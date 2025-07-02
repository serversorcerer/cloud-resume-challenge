const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.BLACKJACK_TABLE || 'blackjack-games';

const HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,POST',
  'Access-Control-Allow-Headers': 'Content-Type'
};

// Card deck and game logic
const SUITS = ['♠️', '♥️', '♦️', '♣️'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

class BlackjackGame {
  constructor() {
    this.deck = this.createDeck();
    this.playerCards = [];
    this.dealerCards = [];
    this.gameOver = false;
    this.playerTurn = true;
    this.canDouble = true;
    this.gameId = uuidv4();
  }

  createDeck() {
    const deck = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({ suit, rank });
      }
    }
    return this.shuffleDeck(deck);
  }

  shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  dealCard() {
    return this.deck.pop();
  }

  calculateHandValue(cards) {
    let value = 0;
    let aces = 0;

    for (const card of cards) {
      if (card.rank === 'A') {
        aces++;
        value += 11;
      } else if (['J', 'Q', 'K'].includes(card.rank)) {
        value += 10;
      } else {
        value += parseInt(card.rank);
      }
    }

    // Adjust for aces
    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }

    return value;
  }

  isBlackjack(cards) {
    return cards.length === 2 && this.calculateHandValue(cards) === 21;
  }

  isBust(cards) {
    return this.calculateHandValue(cards) > 21;
  }

  dealInitialCards() {
    this.playerCards.push(this.dealCard());
    this.dealerCards.push(this.dealCard());
    this.playerCards.push(this.dealCard());
    this.dealerCards.push(this.dealCard());
  }

  playerHit() {
    if (this.gameOver || !this.playerTurn) {
      throw new Error('Invalid move: game over or not player turn');
    }

    this.playerCards.push(this.dealCard());
    this.canDouble = false;

    if (this.isBust(this.playerCards)) {
      this.gameOver = true;
      this.playerTurn = false;
      return 'lose';
    }

    return null; // Game continues
  }

  playerStand() {
    if (this.gameOver || !this.playerTurn) {
      throw new Error('Invalid move: game over or not player turn');
    }

    this.playerTurn = false;
    return this.dealerPlay();
  }

  playerDouble() {
    if (this.gameOver || !this.playerTurn || !this.canDouble) {
      throw new Error('Invalid move: cannot double down');
    }

    this.playerCards.push(this.dealCard());
    this.playerTurn = false;
    this.canDouble = false;

    if (this.isBust(this.playerCards)) {
      this.gameOver = true;
      return 'lose';
    }

    return this.dealerPlay();
  }

  dealerPlay() {
    while (this.calculateHandValue(this.dealerCards) < 17) {
      this.dealerCards.push(this.dealCard());
    }

    this.gameOver = true;
    return this.determineWinner();
  }

  determineWinner() {
    const playerValue = this.calculateHandValue(this.playerCards);
    const dealerValue = this.calculateHandValue(this.dealerCards);

    const playerBlackjack = this.isBlackjack(this.playerCards);
    const dealerBlackjack = this.isBlackjack(this.dealerCards);

    if (playerBlackjack && !dealerBlackjack) {
      return 'blackjack';
    }

    if (dealerBlackjack && !playerBlackjack) {
      return 'lose';
    }

    if (playerBlackjack && dealerBlackjack) {
      return 'push';
    }

    if (this.isBust(this.dealerCards)) {
      return 'win';
    }

    if (playerValue > dealerValue) {
      return 'win';
    } else if (playerValue < dealerValue) {
      return 'lose';
    } else {
      return 'push';
    }
  }

  getGameState() {
    return {
      gameId: this.gameId,
      playerCards: this.playerCards,
      dealerCards: this.dealerCards,
      gameOver: this.gameOver,
      playerTurn: this.playerTurn,
      canDouble: this.canDouble && this.playerCards.length === 2 && this.playerTurn
    };
  }

  // Static method to restore game from saved state
  static fromSavedState(savedState) {
    const game = new BlackjackGame();
    game.gameId = savedState.gameId;
    game.playerCards = savedState.playerCards || [];
    game.dealerCards = savedState.dealerCards || [];
    game.gameOver = savedState.gameOver || false;
    game.playerTurn = savedState.playerTurn !== undefined ? savedState.playerTurn : true;
    game.canDouble = savedState.canDouble !== undefined ? savedState.canDouble : true;
    game.deck = savedState.deck || game.createDeck();
    return game;
  }
}

// Database operations
async function saveGameState(game) {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      pk: `game#${game.gameId}`,
      sk: 'state',
      gameState: game.getGameState(),
      deck: game.deck,
      ttl: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours TTL
      createdAt: new Date().toISOString()
    }
  };

  await dynamodb.put(params).promise();
}

async function loadGameState(gameId) {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      pk: `game#${gameId}`,
      sk: 'state'
    }
  };

  const result = await dynamodb.get(params).promise();
  return result.Item;
}

async function updateStats(result) {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      pk: 'stats',
      sk: 'global'
    },
    UpdateExpression: 'ADD gamesPlayed :played, gamesWon :won',
    ExpressionAttributeValues: {
      ':played': 1,
      ':won': ['win', 'blackjack'].includes(result) ? 1 : 0
    },
    ReturnValues: 'ALL_NEW'
  };

  const response = await dynamodb.update(params).promise();
  return response.Attributes;
}

async function getStats() {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      pk: 'stats',
      sk: 'global'
    }
  };

  const result = await dynamodb.get(params).promise();
  return result.Item || { gamesPlayed: 0, gamesWon: 0 };
}

// Lambda handler
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  if (event?.requestContext?.http?.method === 'OPTIONS') {
    return { statusCode: 204, headers: HEADERS, body: '' };
  }

  let body = {};
  try {
    body = event?.body 
      ? (typeof event.body === 'string' ? JSON.parse(event.body) : event.body)
      : {};
  } catch (err) {
    console.error('Invalid request body', err);
    return { 
      statusCode: 400, 
      headers: HEADERS, 
      body: JSON.stringify({ error: 'Invalid request body' }) 
    };
  }

  const { action, gameId } = body;

  try {
    switch (action) {
      case 'newGame': {
        const game = new BlackjackGame();
        game.dealInitialCards();

        // Check for initial blackjack
        if (game.isBlackjack(game.playerCards)) {
          game.gameOver = true;
          game.playerTurn = false;
          const result = game.determineWinner();
          await updateStats(result);
          await saveGameState(game);
          
          return {
            statusCode: 200,
            headers: HEADERS,
            body: JSON.stringify({
              gameState: game.getGameState(),
              result
            })
          };
        }

        await saveGameState(game);

        return {
          statusCode: 200,
          headers: HEADERS,
          body: JSON.stringify({
            gameState: game.getGameState()
          })
        };
      }

      case 'hit': {
        if (!gameId) {
          return {
            statusCode: 400,
            headers: HEADERS,
            body: JSON.stringify({ error: 'Game ID required' })
          };
        }

        const savedGame = await loadGameState(gameId);
        if (!savedGame) {
          return {
            statusCode: 404,
            headers: HEADERS,
            body: JSON.stringify({ error: 'Game not found' })
          };
        }

        const game = BlackjackGame.fromSavedState({
          ...savedGame.gameState,
          deck: savedGame.deck
        });

        const result = game.playerHit();
        await saveGameState(game);

        if (result) {
          await updateStats(result);
        }

        return {
          statusCode: 200,
          headers: HEADERS,
          body: JSON.stringify({
            gameState: game.getGameState(),
            result
          })
        };
      }

      case 'stand': {
        if (!gameId) {
          return {
            statusCode: 400,
            headers: HEADERS,
            body: JSON.stringify({ error: 'Game ID required' })
          };
        }

        const savedGame = await loadGameState(gameId);
        if (!savedGame) {
          return {
            statusCode: 404,
            headers: HEADERS,
            body: JSON.stringify({ error: 'Game not found' })
          };
        }

        const game = BlackjackGame.fromSavedState({
          ...savedGame.gameState,
          deck: savedGame.deck
        });

        const result = game.playerStand();
        await saveGameState(game);
        await updateStats(result);

        return {
          statusCode: 200,
          headers: HEADERS,
          body: JSON.stringify({
            gameState: game.getGameState(),
            result
          })
        };
      }

      case 'double': {
        if (!gameId) {
          return {
            statusCode: 400,
            headers: HEADERS,
            body: JSON.stringify({ error: 'Game ID required' })
          };
        }

        const savedGame = await loadGameState(gameId);
        if (!savedGame) {
          return {
            statusCode: 404,
            headers: HEADERS,
            body: JSON.stringify({ error: 'Game not found' })
          };
        }

        const game = BlackjackGame.fromSavedState({
          ...savedGame.gameState,
          deck: savedGame.deck
        });

        const result = game.playerDouble();
        await saveGameState(game);
        await updateStats(result);

        return {
          statusCode: 200,
          headers: HEADERS,
          body: JSON.stringify({
            gameState: game.getGameState(),
            result
          })
        };
      }

      case 'getStats': {
        const stats = await getStats();
        return {
          statusCode: 200,
          headers: HEADERS,
          body: JSON.stringify({ stats })
        };
      }

      default:
        return {
          statusCode: 400,
          headers: HEADERS,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: HEADERS,
      body: JSON.stringify({ error: error.message })
    };
  }
};
