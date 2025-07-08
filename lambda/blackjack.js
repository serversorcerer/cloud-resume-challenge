const { v4: uuidv4 } = require('uuid');
const BlackjackGame = require('./lib/game');
const { resolveGame } = require('./lib/resolution');
const Player = require('./lib/player');
const {
  saveGameState,
  loadGameState,
  updateStats,
  getStats,
  getPlayerBankroll,
} = require('./lib/db');

const MIN_BET = 10;
const MAX_BET = 1000;

function getCorsHeaders(event) {
  const origin = event?.headers?.origin || event?.headers?.Origin;
  const allowedOrigins = [
    'https://josephaleto.io',
    'https://www.josephaleto.io',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];
  const allowedOrigin = allowedOrigins.includes(origin)
    ? origin
    : 'https://josephaleto.io';
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type,x-amz-date,authorization,x-api-key,x-amz-security-token,x-amz-user-agent',
    'Access-Control-Max-Age': '86400',
  };
}

async function parseBody(event) {
  try {
    return event?.body ? (typeof event.body === 'string' ? JSON.parse(event.body) : event.body) : {};
  } catch (err) {
    throw new Error('Invalid request body');
  }
}

// Fix the createErrorResponse function
const createErrorResponse = async (event, playerId, message, statusCode = 400) => {
    const headers = getCorsHeaders(event);
    const bankroll = playerId ? await getPlayerBankroll(playerId) : 0;
    return {
        statusCode,
        headers,
        body: JSON.stringify({ 
            error: message, 
            bankroll 
        })
    };
};

exports.handler = async (event) => {
  const headers = getCorsHeaders(event);
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  let body;
  try {
    body = await parseBody(event);
  } catch (err) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: err.message }) };
  }

  const isGet = event.httpMethod === 'GET';
  const action = isGet ? event.queryStringParameters?.action : body.action;
  const gameId = isGet ? event.queryStringParameters?.gameId : body.gameId;
  const bet = isGet ? parseInt(event.queryStringParameters?.bet) : body.bet;
  const playerId = isGet ? event.queryStringParameters?.playerId : body.playerId;

  try {
    switch (action) {
      case 'newGame': {
        const currentPlayerId = playerId || uuidv4();
        const betAmount = bet || MIN_BET;
        if (betAmount < MIN_BET || betAmount > MAX_BET) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: `Bet must be between ${MIN_BET} and ${MAX_BET}` }),
          };
        }
        
        const currentBankroll = await getPlayerBankroll(currentPlayerId);
        const player = new Player(currentPlayerId, currentBankroll);
        
        try {
            await player.placeBet(betAmount);
        } catch (err) {
            return createErrorResponse(event, currentPlayerId, err.message);
        }
        
        const game = new BlackjackGame(betAmount);
        game.originalBet = betAmount; // Ensure this is set
        game.dealInitialCards();
        await saveGameState(game, currentPlayerId);
        
        if (game.gameOver || game.isBlackjack(game.playerCards)) {
            const resolution = await resolveGame(game, currentPlayerId);
            await updateStats(game.isBlackjack(game.playerCards) ? 'blackjack' : 'lose');
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    gameState: game.getGameState(),
                    bankroll: resolution.finalBalance,
                    bankrollChange: resolution.bankrollChange,
                    playerId: currentPlayerId,
                    result: game.isBlackjack(game.playerCards) ? 'blackjack' : 'lose'
                }),
            };
        }
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                gameState: game.getGameState(),
                bankroll: player.bankroll,
                playerId: currentPlayerId,
            }),
        };
      }
      case 'hit': {
        if (!gameId) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Game ID required' }) };
        const saved = await loadGameState(gameId);
        if (!saved) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Game not found' }) };
        const game = BlackjackGame.fromSavedState({ ...saved.gameState, shoe: saved.shoe });
        const result = game.playerHit();
        await saveGameState(game, saved.playerId);
        let bankrollUpdate = {};
        if (result) {
          const res = await resolveGame(game, saved.playerId);
          const type = typeof result === 'object' ? (result.type === 'split' ? 'split' : result.result.result) : result;
          await updateStats(type);
          bankrollUpdate = { bankroll: res.finalBalance, bankrollChange: res.bankrollChange };
        } else {
          // For ongoing games, just return current bankroll
          const currentBankroll = await getPlayerBankroll(saved.playerId);
          bankrollUpdate = { bankroll: currentBankroll };
        }
        return { statusCode: 200, headers, body: JSON.stringify({ gameState: game.getGameState(), result, playerId: saved.playerId, ...bankrollUpdate }) };
      }
      case 'stand': {
        if (!gameId) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Game ID required' }) };
        const saved = await loadGameState(gameId);
        if (!saved) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Game not found' }) };
        const game = BlackjackGame.fromSavedState({ ...saved.gameState, shoe: saved.shoe });
        const result = game.playerStand();
        await saveGameState(game, saved.playerId);
        const res = await resolveGame(game, saved.playerId);
        const type = typeof result === 'object' ? (result.type === 'split' ? 'split' : result.result.result) : result;
        await updateStats(type);
        return { statusCode: 200, headers, body: JSON.stringify({ gameState: game.getGameState(), result, bankroll: res.finalBalance, bankrollChange: res.bankrollChange, playerId: saved.playerId }) };
      }
      case 'double': {
        if (!gameId) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Game ID required' }) };
        const saved = await loadGameState(gameId);
        if (!saved) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Game not found' }) };
        const game = BlackjackGame.fromSavedState({ ...saved.gameState, shoe: saved.shoe });
        const currentBankroll = await getPlayerBankroll(saved.playerId);
        
        // Check if player can afford to double
        if (currentBankroll < game.originalBet) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'Insufficient funds to double', bankroll: currentBankroll }) };
        }
        
        const player = new Player(saved.playerId, currentBankroll);
        try {
          await player.placeBet(game.originalBet);
          game.bet = game.originalBet * 2;
        } catch (err) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: err.message, bankroll: currentBankroll }) };
        }
        const result = game.playerDouble();
        await saveGameState(game, saved.playerId);
        const res = await resolveGame(game, saved.playerId);
        const type = typeof result === 'object' ? (result.type === 'split' ? 'split' : result.result.result) : result;
        await updateStats(type);
        return { statusCode: 200, headers, body: JSON.stringify({ gameState: game.getGameState(), result, bankroll: res.finalBalance, bankrollChange: res.bankrollChange, playerId: saved.playerId }) };
      }
      case 'split': {
        if (!gameId) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Game ID required' }) };
        const saved = await loadGameState(gameId);
        if (!saved) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Game not found' }) };
        const game = BlackjackGame.fromSavedState({ ...saved.gameState, shoe: saved.shoe });
        const currentBankroll = await getPlayerBankroll(saved.playerId);
        
        // Check if player can afford to split
        if (currentBankroll < game.originalBet) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'Insufficient funds to split', bankroll: currentBankroll }) };
        }
        
        const player = new Player(saved.playerId, currentBankroll);
        try {
          await player.placeBet(game.originalBet);
        } catch (err) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: err.message, bankroll: currentBankroll }) };
        }
        const result = game.playerSplit();
        await saveGameState(game, saved.playerId);
        
        // Update bankroll to reflect the split bet deduction
        const updatedBankroll = await getPlayerBankroll(saved.playerId);
        return { statusCode: 200, headers, body: JSON.stringify({ gameState: game.getGameState(), result, bankroll: updatedBankroll, playerId: saved.playerId }) };
      }
      case 'surrender': {
        if (!gameId) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Game ID required' }) };
        const saved = await loadGameState(gameId);
        if (!saved) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Game not found' }) };
        const game = BlackjackGame.fromSavedState({ ...saved.gameState, shoe: saved.shoe });
        const result = game.playerSurrender();
        await saveGameState(game, saved.playerId);
        const res = await resolveGame(game, saved.playerId);
        await updateStats(result);
        return { statusCode: 200, headers, body: JSON.stringify({ gameState: game.getGameState(), result, bankroll: res.finalBalance, bankrollChange: res.bankrollChange, playerId: saved.playerId }) };
      }
      case 'insurance': {
        if (!gameId) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Game ID required' }) };
        const saved = await loadGameState(gameId);
        if (!saved) return { statusCode: 404, headers, body: JSON.stringify({ error: 'Game not found' }) };
        const game = BlackjackGame.fromSavedState({ ...saved.gameState, shoe: saved.shoe });
        const player = new Player(saved.playerId, await getPlayerBankroll(saved.playerId));
        const insuranceAmount = body.insuranceAmount || Math.floor(game.originalBet * 0.5);
        try {
          await player.placeBet(insuranceAmount);
        } catch (err) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: err.message, bankroll: await getPlayerBankroll(saved.playerId) }) };
        }
        const result = game.playerInsurance(insuranceAmount);
        await saveGameState(game, saved.playerId);
        
        // If insurance resolves the game, handle bankroll resolution
        let bankrollUpdate = { bankroll: player.bankroll };
        if (game.gameOver) {
          const res = await resolveGame(game, saved.playerId);
          await updateStats(result);
          bankrollUpdate = { bankroll: res.finalBalance, bankrollChange: res.bankrollChange };
        }
        
        return { statusCode: 200, headers, body: JSON.stringify({ gameState: game.getGameState(), result, playerId: saved.playerId, ...bankrollUpdate }) };
      }
      case 'getStats': {
        const stats = await getStats();
        return { statusCode: 200, headers, body: JSON.stringify({ stats }) };
      }
      case 'getBankroll': {
        const currentPlayerId = playerId || uuidv4();
        const bankroll = await getPlayerBankroll(currentPlayerId);
        return { statusCode: 200, headers, body: JSON.stringify({ bankroll, playerId: currentPlayerId }) };
      }
      default:
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid action' }) };
    }
  } catch (err) {
    console.error('Error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
