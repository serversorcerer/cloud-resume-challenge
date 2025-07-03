const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.BLACKJACK_TABLE || 'blackjack-games';

// Game configuration
const INITIAL_BANKROLL = 1000;
const MIN_BET = 10;
const MAX_BET = 500; // Increased max bet

// Helper function to get CORS headers with proper origin
function getCorsHeaders(event) {
  const origin = event?.headers?.origin || event?.headers?.Origin;
  const allowedOrigins = [
    'https://josephaleto.io',
    'https://www.josephaleto.io',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ];
  
  // Check if origin is allowed
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : 'https://josephaleto.io';
  
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,x-amz-date,authorization,x-api-key,x-amz-security-token,x-amz-user-agent',
    'Access-Control-Max-Age': '86400'
  };
}

// Card deck and game logic
const SUITS = ['♠️', '♥️', '♦️', '♣️'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// 1. 8-Deck Shoe
const NUM_DECKS = 8;

class BlackjackGame {
  constructor(bet = MIN_BET, shoe = null) {
    this.shoe = shoe || this.createShoe();
    this.playerCards = [];
    this.dealerCards = [];
    this.gameOver = false;
    this.playerTurn = true;
    this.canDouble = true;
    this.canSplit = false;
    this.canSurrender = true;
    this.gameId = uuidv4();
    this.bet = bet;
    this.originalBet = bet;
    this.insuranceBet = 0;
    this.surrendered = false;
    this.hands = [];
    this.currentHandIndex = 0;
    this.splitBets = [];
    this.splitCount = 0;
    this.maxSplits = 4;
    this.splitAces = false;
  }

  createShoe() {
    let shoe = [];
    for (let d = 0; d < NUM_DECKS; d++) {
      for (const suit of SUITS) {
        for (const rank of RANKS) {
          shoe.push({ suit, rank });
        }
      }
    }
    return this.shuffleDeck(shoe);
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
    // Reshuffle if < 52 cards left
    if (this.shoe.length < 52) {
      this.shoe = this.createShoe();
    }
    return this.shoe.pop();
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

  canSplitHand(cards) {
    if (cards.length !== 2) return false;
    const tenValues = ['10', 'J', 'Q', 'K'];
    // Only allow up to maxSplits
    if (this.splitCount >= this.maxSplits) return false;
    // Special rule for Aces
    if (cards[0].rank === 'A' && cards[1].rank === 'A') return true;
    // Any two 10-value cards
    return (
      (cards[0].rank === cards[1].rank) ||
      (tenValues.includes(cards[0].rank) && tenValues.includes(cards[1].rank))
    );
  }

  dealInitialCards() {
    this.playerCards.push(this.dealCard());
    this.dealerCards.push(this.dealCard());
    this.playerCards.push(this.dealCard());
    this.dealerCards.push(this.dealCard());
    this.canSplit = this.canSplitHand(this.playerCards);
    this.canInsure = this.dealerCards[0].rank === 'A';
    this.splitCount = 0;
    this.splitAces = false;
    // Check for dealer blackjack
    const dealerUp = this.dealerCards[0];
    const dealerHole = this.dealerCards[1];
    const tenValues = ['10', 'J', 'Q', 'K'];
    if (dealerUp.rank === 'A' || tenValues.includes(dealerUp.rank)) {
      if (this.isBlackjack(this.dealerCards)) {
        this.gameOver = true;
        this.playerTurn = false;
      }
    }
  }

  playerHit() {
    if (this.gameOver || !this.playerTurn) throw new Error('Invalid move: game over or not player turn');
    const currentHand = this.getCurrentHand();
    // If split Aces, cannot hit
    if (this.splitAces) throw new Error('Cannot hit split Aces');
    currentHand.push(this.dealCard());
    this.canDouble = false;
    if (this.isBust(currentHand)) {
      // For split hands, move to next hand if available
      if (this.hands.length > 0 && this.currentHandIndex < this.hands.length - 1) {
        this.currentHandIndex++;
        this.canDouble = this.hands[this.currentHandIndex].length === 2;
        return null;
      } else {
        // All hands are done, end the game
        this.gameOver = true;
        this.playerTurn = false;
        return this.determineWinner();
      }
    }
    return null;
  }

  playerStand() {
    if (this.gameOver || !this.playerTurn) throw new Error('Invalid move: game over or not player turn');
    if (this.hands.length > 0 && this.currentHandIndex < this.hands.length - 1) {
      this.currentHandIndex++;
      this.canDouble = this.hands[this.currentHandIndex].length === 2;
      return null;
    }
    // Only play dealer if player has not busted
    if (!this.isBust(this.getCurrentHand())) {
      this.playerTurn = false;
      return this.dealerPlay();
    } else {
      this.gameOver = true;
      this.playerTurn = false;
      return this.determineWinner();
    }
  }

  playerDouble() {
    if (this.gameOver || !this.playerTurn || !this.canDouble) throw new Error('Invalid move: cannot double down');
    const currentHand = this.getCurrentHand();
    // Cannot double after split Aces
    if (this.splitAces) throw new Error('Cannot double after split Aces');
    if (currentHand.length !== 2) throw new Error('Can only double on first two cards');
    if (this.hands.length > 0) {
      this.splitBets[this.currentHandIndex] *= 2;
    } else {
      this.bet = this.originalBet * 2;
    }
    currentHand.push(this.dealCard());
    this.canDouble = false;
    if (this.isBust(currentHand)) {
      if (this.hands.length > 0 && this.currentHandIndex < this.hands.length - 1) {
        this.currentHandIndex++;
        this.canDouble = this.hands[this.currentHandIndex].length === 2;
        return null;
      } else {
        this.gameOver = true;
        this.playerTurn = false;
        return this.dealerPlay();
      }
    }
    if (this.hands.length > 0 && this.currentHandIndex < this.hands.length - 1) {
      this.currentHandIndex++;
      this.canDouble = this.hands[this.currentHandIndex].length === 2;
      return null;
    }
    this.playerTurn = false;
    return this.dealerPlay();
  }

  playerSplit() {
    if (this.gameOver || !this.playerTurn || !this.canSplit) throw new Error('Invalid move: cannot split');
    if (this.splitCount >= this.maxSplits) throw new Error('Maximum splits reached');
    const card1 = this.playerCards[0];
    const card2 = this.playerCards[1];
    // Special rule for Aces
    if (card1.rank === 'A' && card2.rank === 'A') {
      this.hands = [
        [card1, this.dealCard()],
        [card2, this.dealCard()]
      ];
      this.splitAces = true;
    } else {
      this.hands = [
        [card1, this.dealCard()],
        [card2, this.dealCard()]
      ];
      this.splitAces = false;
    }
    this.splitBets = [this.originalBet, this.originalBet];
    this.currentHandIndex = 0;
    this.playerCards = [];
    this.canSplit = false;
    this.canDouble = this.hands[0].length === 2;
    this.splitCount++;
    return null;
  }

  playerSurrender() {
    if (this.gameOver || !this.playerTurn || !this.canSurrender || this.hands.length > 0) throw new Error('Invalid move: cannot surrender');
    this.surrendered = true;
    this.gameOver = true;
    this.playerTurn = false;
    return 'surrender';
  }

  playerInsurance(amount) {
    if (!this.canInsure || this.insuranceBet > 0) throw new Error('Invalid move: cannot take insurance');
    this.insuranceBet = amount;
    return null;
  }

  dealerPlay() {
    // Dealer reveals hole card and plays
    while (this.calculateHandValue(this.dealerCards) < 17 ||
      (this.calculateHandValue(this.dealerCards) === 17 && this.hasSoft17(this.dealerCards))) {
      this.dealerCards.push(this.dealCard());
    }
    this.gameOver = true;
    return this.determineWinner();
  }

  hasSoft17(cards) {
    // Returns true if hand is a soft 17 (contains Ace counted as 11)
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
    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }
    return value === 17 && aces > 0;
  }

  determineWinner() {
    if (this.surrendered) {
      return 'surrender';
    }

    // Handle insurance first
    let insuranceResult = null;
    if (this.insuranceBet > 0 && this.isBlackjack(this.dealerCards)) {
      insuranceResult = 'insurance_win';
    }

    // Handle split hands
    if (this.hands.length > 0) {
      const results = [];
      for (let i = 0; i < this.hands.length; i++) {
        const handResult = this.determineHandWinner(this.hands[i], this.dealerCards, this.splitBets[i], true);
        results.push(handResult);
      }
      return { type: 'split', results, insurance: insuranceResult };
    }

    // Handle single hand
    const result = this.determineHandWinner(this.playerCards, this.dealerCards, this.bet, false);
    return { type: 'single', result, insurance: insuranceResult };
  }

  determineHandWinner(playerCards, dealerCards, bet, isSplitHand = false) {
    const playerValue = this.calculateHandValue(playerCards);
    const dealerValue = this.calculateHandValue(dealerCards);

    const playerBlackjack = this.isBlackjack(playerCards);
    const dealerBlackjack = this.isBlackjack(dealerCards);

    if (playerBlackjack && !dealerBlackjack) {
      if (!isSplitHand) {
        return { result: 'blackjack', bet, payout: Math.floor(bet * 1.5) };
      } else {
        // 21 after split is just a win, not blackjack
        return { result: 'win', bet, payout: bet };
      }
    }

    if (dealerBlackjack && !playerBlackjack) {
      return { result: 'lose', bet, payout: -bet };
    }

    if (playerBlackjack && dealerBlackjack) {
      if (!isSplitHand) {
        return { result: 'push', bet, payout: 0 };
      } else {
        // 21 after split is just a win, but dealer blackjack beats it
        return { result: 'lose', bet, payout: -bet };
      }
    }

    if (this.isBust(playerCards)) {
      return { result: 'lose', bet, payout: -bet };
    }

    if (this.isBust(dealerCards)) {
      return { result: 'win', bet, payout: bet };
    }

    if (playerValue > dealerValue) {
      return { result: 'win', bet, payout: bet };
    } else if (playerValue < dealerValue) {
      return { result: 'lose', bet, payout: -bet };
    } else {
      return { result: 'push', bet, payout: 0 };
    }
  }

  getCurrentHand() {
    if (this.hands.length > 0) {
      return this.hands[this.currentHandIndex];
    }
    return this.playerCards;
  }

  getGameState() {
    return {
      gameId: this.gameId,
      playerCards: this.playerCards,
      dealerCards: this.dealerCards,
      hands: this.hands,
      currentHandIndex: this.currentHandIndex,
      gameOver: this.gameOver,
      playerTurn: this.playerTurn,
      canDouble: this.canDouble && this.getCurrentHand().length === 2 && this.playerTurn,
      canSplit: this.canSplit && this.playerTurn && this.hands.length === 0,
      canSurrender: this.canSurrender && this.playerTurn && this.hands.length === 0,
      canInsure: this.canInsure,
      bet: this.bet,
      originalBet: this.originalBet,
      insuranceBet: this.insuranceBet,
      surrendered: this.surrendered,
      splitBets: this.splitBets
    };
  }

  // Static method to restore game from saved state
  static fromSavedState(savedState) {
    const game = new BlackjackGame(savedState.bet || MIN_BET);
    game.gameId = savedState.gameId;
    game.playerCards = savedState.playerCards || [];
    game.dealerCards = savedState.dealerCards || [];
    game.hands = savedState.hands || [];
    game.currentHandIndex = savedState.currentHandIndex || 0;
    game.gameOver = savedState.gameOver || false;
    game.playerTurn = savedState.playerTurn !== undefined ? savedState.playerTurn : true;
    game.canDouble = savedState.canDouble !== undefined ? savedState.canDouble : true;
    game.canSplit = savedState.canSplit !== undefined ? savedState.canSplit : false;
    game.canSurrender = savedState.canSurrender !== undefined ? savedState.canSurrender : true;
    game.canInsure = savedState.canInsure !== undefined ? savedState.canInsure : false;
    game.shoe = savedState.shoe || game.createShoe();
    game.bet = savedState.bet || MIN_BET;
    game.originalBet = savedState.originalBet || savedState.bet || MIN_BET;
    game.insuranceBet = savedState.insuranceBet || 0;
    game.surrendered = savedState.surrendered || false;
    game.splitBets = savedState.splitBets || [];
    return game;
  }
}

// Database operations
async function saveGameState(game, playerId) {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      pk: `game#${game.gameId}`,
      sk: 'state',
      gameState: game.getGameState(),
      shoe: game.shoe,
      playerId: playerId,
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

// Player bankroll management
async function getPlayerBankroll(playerId) {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      pk: `player#${playerId}`,
      sk: 'bankroll'
    }
  };

  const result = await dynamodb.get(params).promise();
  if (!result.Item) {
    // Initialize new player with starting bankroll
    await initializePlayer(playerId);
    return INITIAL_BANKROLL;
  }
  return result.Item.bankroll;
}

async function initializePlayer(playerId) {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      pk: `player#${playerId}`,
      sk: 'bankroll',
      bankroll: INITIAL_BANKROLL,
      createdAt: new Date().toISOString()
    }
  };

  await dynamodb.put(params).promise();
}

async function updatePlayerBankroll(playerId, newBankroll, reason = 'unknown') {
  // Get current bankroll for logging
  const currentBankroll = await getPlayerBankroll(playerId);
  const change = newBankroll - currentBankroll;
  
  console.log(`[BANKROLL] ${reason}: ${currentBankroll} -> ${newBankroll} (change: ${change > 0 ? '+' : ''}${change})`);
  
  const params = {
    TableName: TABLE_NAME,
    Key: {
      pk: `player#${playerId}`,
      sk: 'bankroll'
    },
    UpdateExpression: 'SET bankroll = :bankroll, updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':bankroll': newBankroll,
      ':updatedAt': new Date().toISOString()
    },
    ReturnValues: 'ALL_NEW'
  };

  const response = await dynamodb.update(params).promise();
  return response.Attributes.bankroll;
}

// PYTHON-STYLE: Simple bankroll management following Python implementation
class Player {
  constructor(playerId, bankroll = 1000) {
    this.playerId = playerId;
    this.bankroll = bankroll;
    this.bet = 0;
  }

  // Place bet - deduct from bankroll immediately (like Python)
  async placeBet(amount) {
    if (amount > this.bankroll) {
      throw new Error('Insufficient bankroll.');
    }
    this.bet = amount;
    this.bankroll -= amount;
    await updatePlayerBankroll(this.playerId, this.bankroll, `bet_placed_${amount}`);
    return this.bankroll;
  }

  // Win - add winnings to bankroll (like Python)
  async win(multiplier = 2.0) {
    const winnings = Math.floor(this.bet * multiplier);
    this.bankroll += winnings;
    await updatePlayerBankroll(this.playerId, this.bankroll, `win_${winnings}`);
    return this.bankroll;
  }

  // Push - return bet to bankroll (like Python)
  async push() {
    this.bankroll += this.bet;
    await updatePlayerBankroll(this.playerId, this.bankroll, `push_${this.bet}`);
    return this.bankroll;
  }

  // Reset hand - clear bet (like Python)
  resetHand() {
    this.bet = 0;
  }

  // Surrender - return half bet
  async surrender() {
    const refund = Math.floor(this.bet / 2);
    this.bankroll += refund;
    await updatePlayerBankroll(this.playerId, this.bankroll, `surrender_${refund}`);
    return this.bankroll;
  }

  // Get current bankroll from database
  async getBankroll() {
    this.bankroll = await getPlayerBankroll(this.playerId);
    return this.bankroll;
  }
}

// PYTHON-STYLE: Simple game resolution following Python implementation
async function resolveGame(game, playerId) {
  const player = new Player(playerId, await getPlayerBankroll(playerId));
  player.bet = game.bet; // Restore current bet amount
  
  const playerHand = game.hands.length > 0 ? game.hands[game.currentHandIndex] : game.playerCards;
  const playerTotal = game.calculateHandValue(playerHand);
  const dealerTotal = game.calculateHandValue(game.dealerCards);
  
  let result = "";
  let finalBalance = player.bankroll;

  // Handle split hands
  if (game.hands.length > 0) {
    const splitResults = [];
    let totalWinnings = 0;
    
    for (let i = 0; i < game.hands.length; i++) {
      const hand = game.hands[i];
      const handBet = game.splitBets[i];
      const handTotal = game.calculateHandValue(hand);
      
      // Handle each split hand individually (like Python)
      if (game.isBlackjack(hand) && !game.isBlackjack(game.dealerCards)) {
        // Blackjack pays 3:2
        const winnings = Math.floor(handBet * 2.5);
        totalWinnings += winnings;
        splitResults.push(`Hand ${i + 1}: Blackjack! +$${winnings}`);
      } else if (handTotal > dealerTotal && handTotal <= 21) {
        // Win
        const winnings = handBet * 2;
        totalWinnings += winnings;
        splitResults.push(`Hand ${i + 1}: Win! +$${winnings}`);
      } else if (handTotal === dealerTotal && handTotal <= 21) {
        // Push
        totalWinnings += handBet;
        splitResults.push(`Hand ${i + 1}: Push. Bet returned.`);
      } else {
        // Lose - bet already deducted
        splitResults.push(`Hand ${i + 1}: Lose.`);
      }
    }
    
    // Add total winnings to bankroll
    finalBalance = player.bankroll + totalWinnings;
    await updatePlayerBankroll(playerId, finalBalance, `split_settlement_${totalWinnings}`);
    
    result = splitResults.join(' | ');
  } else {
    // Single hand resolution (exactly like Python)
    if (game.isBlackjack(playerHand) && !game.isBlackjack(game.dealerCards)) {
      finalBalance = await player.win(2.5);
      result = "Blackjack! You win 3:2.";
    } else if (game.isBlackjack(game.dealerCards) && !game.isBlackjack(playerHand)) {
      finalBalance = player.bankroll; // Bet already deducted
      await updatePlayerBankroll(playerId, finalBalance, `lose_${game.bet}`);
      result = "Dealer has Blackjack. You lose.";
    } else if (game.isBust(playerHand)) {
      finalBalance = player.bankroll; // Bet already deducted
      await updatePlayerBankroll(playerId, finalBalance, `lose_${game.bet}`);
      result = "You busted. You lose.";
    } else if (game.isBust(game.dealerCards)) {
      finalBalance = await player.win();
      result = "Dealer busts. You win!";
    } else if (playerTotal > dealerTotal) {
      finalBalance = await player.win();
      result = "You win!";
    } else if (playerTotal === dealerTotal) {
      finalBalance = await player.push();
      result = "Push.";
    } else {
      finalBalance = player.bankroll; // Bet already deducted
      await updatePlayerBankroll(playerId, finalBalance, `lose_${game.bet}`);
      result = "Dealer wins.";
    }
  }

  return {
    result,
    finalBalance,
    bankrollChange: finalBalance - player.bankroll
  };
}

// Lambda handler
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Get CORS headers for this request
  const corsHeaders = getCorsHeaders(event);
  
  // Handle CORS preflight OPTIONS requests
  if (event.httpMethod === 'OPTIONS') {
    return { 
      statusCode: 200, 
      headers: corsHeaders, 
      body: '' 
    };
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
      headers: corsHeaders, 
      body: JSON.stringify({ error: 'Invalid request body' }) 
    };
  }

  // Handle GET requests with query parameters
  let action, gameId, bet, playerId;
  
  if (event.httpMethod === 'GET') {
    const queryParams = event.queryStringParameters || {};
    action = queryParams.action;
    gameId = queryParams.gameId;
    bet = queryParams.bet ? parseInt(queryParams.bet) : undefined;
    playerId = queryParams.playerId;
  } else {
    ({ action, gameId, bet, playerId } = body);
  }

  try {
    switch (action) {
      case 'newGame': {
        // Generate player ID if not provided
        const currentPlayerId = playerId || uuidv4();
        
        // Validate bet amount
        const betAmount = bet || MIN_BET;
        if (betAmount < MIN_BET || betAmount > MAX_BET) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ 
              error: `Bet must be between ${MIN_BET} and ${MAX_BET}` 
            })
          };
        }

        // PYTHON-STYLE: Use Player to place bet
        const player = new Player(currentPlayerId);
        let newBankroll;
        
        try {
          newBankroll = await player.placeBet(betAmount);
        } catch (error) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ 
              error: error.message,
              bankroll: await getPlayerBankroll(currentPlayerId)
            })
          };
        }

        const game = new BlackjackGame(betAmount);
        game.dealInitialCards();

        // Check for initial blackjack
        if (game.isBlackjack(game.playerCards)) {
          game.gameOver = true;
          game.playerTurn = false;
          
          // PYTHON-STYLE: Use new resolution logic
          const resolution = await resolveGame(game, currentPlayerId);
          
          await updateStats('blackjack');
          await saveGameState(game, currentPlayerId);
          
          return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({
              gameState: game.getGameState(),
              result: resolution.result,
              bankroll: resolution.finalBalance,
              bankrollChange: resolution.bankrollChange,
              playerId: currentPlayerId
            })
          };
        }

        await saveGameState(game, currentPlayerId);

        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            gameState: game.getGameState(),
            bankroll: newBankroll,
            betDeducted: true,
            playerId: currentPlayerId
          })
        };
      }

      case 'hit': {
        if (!gameId) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Game ID required' })
          };
        }

        const savedGame = await loadGameState(gameId);
        if (!savedGame) {
          return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Game not found' })
          };
        }

        const game = BlackjackGame.fromSavedState({
          ...savedGame.gameState,
          shoe: savedGame.shoe
        });

        const result = game.playerHit();
        await saveGameState(game, savedGame.playerId);

        let bankrollUpdate = {};
        if (result) {
          // PYTHON-STYLE: Use new resolution logic
          const resolution = await resolveGame(game, savedGame.playerId);
          
          const resultType = typeof result === 'object' ? 
            (result.type === 'split' ? 'split' : result.result.result) : result;
          await updateStats(resultType);
          
          bankrollUpdate = {
            bankroll: resolution.finalBalance,
            bankrollChange: resolution.bankrollChange
          };
        }

        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            gameState: game.getGameState(),
            result,
            playerId: savedGame.playerId,
            ...bankrollUpdate
          })
        };
      }

      case 'stand': {
        if (!gameId) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Game ID required' })
          };
        }

        const savedGame = await loadGameState(gameId);
        if (!savedGame) {
          return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Game not found' })
          };
        }

        const game = BlackjackGame.fromSavedState({
          ...savedGame.gameState,
          shoe: savedGame.shoe
        });

        const result = game.playerStand();
        await saveGameState(game, savedGame.playerId);
        
        // PYTHON-STYLE: Use new resolution logic
        const resolution = await resolveGame(game, savedGame.playerId);
        
        const resultType = typeof result === 'object' ? 
          (result.type === 'split' ? 'split' : result.result.result) : result;
        await updateStats(resultType);

        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            gameState: game.getGameState(),
            result,
            bankroll: resolution.finalBalance,
            bankrollChange: resolution.bankrollChange,
            playerId: savedGame.playerId
          })
        };
      }

      case 'double': {
        if (!gameId) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Game ID required' })
          };
        }

        const savedGame = await loadGameState(gameId);
        if (!savedGame) {
          return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Game not found' })
          };
        }

        const game = BlackjackGame.fromSavedState({
          ...savedGame.gameState,
          shoe: savedGame.shoe
        });

        // PYTHON-STYLE: Use Player for double down
        const player = new Player(savedGame.playerId, await getPlayerBankroll(savedGame.playerId));
        player.bet = game.bet; // Restore current bet
        
        try {
          // Deduct additional bet amount for double down
          await player.placeBet(game.originalBet);
          // Double the bet amount
          game.bet = game.originalBet * 2;
        } catch (error) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ 
              error: error.message,
              bankroll: await getPlayerBankroll(savedGame.playerId)
            })
          };
        }

        const result = game.playerDouble();
        await saveGameState(game, savedGame.playerId);
        
        // PYTHON-STYLE: Use new resolution logic
        const resolution = await resolveGame(game, savedGame.playerId);
        
        const resultType = typeof result === 'object' ? 
          (result.type === 'split' ? 'split' : result.result.result) : result;
        await updateStats(resultType);

        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            gameState: game.getGameState(),
            result,
            bankroll: resolution.finalBalance,
            bankrollChange: resolution.bankrollChange,
            playerId: savedGame.playerId
          })
        };
      }

      case 'split': {
        if (!gameId) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Game ID required' })
          };
        }

        const savedGame = await loadGameState(gameId);
        if (!savedGame) {
          return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Game not found' })
          };
        }

        const game = BlackjackGame.fromSavedState({
          ...savedGame.gameState,
          shoe: savedGame.shoe
        });

        // PYTHON-STYLE: Use Player for split
        const player = new Player(savedGame.playerId, await getPlayerBankroll(savedGame.playerId));
        player.bet = game.bet; // Restore current bet
        
        try {
          // Deduct additional bet for split
          await player.placeBet(game.originalBet);
        } catch (error) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ 
              error: error.message,
              bankroll: await getPlayerBankroll(savedGame.playerId)
            })
          };
        }

        const result = game.playerSplit();
        await saveGameState(game, savedGame.playerId);

        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            gameState: game.getGameState(),
            result,
            bankroll: await getPlayerBankroll(savedGame.playerId),
            playerId: savedGame.playerId
          })
        };
      }

      case 'surrender': {
        if (!gameId) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Game ID required' })
          };
        }

        const savedGame = await loadGameState(gameId);
        if (!savedGame) {
          return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Game not found' })
          };
        }

        const game = BlackjackGame.fromSavedState({
          ...savedGame.gameState,
          shoe: savedGame.shoe
        });

        const result = game.playerSurrender();
        await saveGameState(game, savedGame.playerId);
        
        // PYTHON-STYLE: Use Player for surrender
        const player = new Player(savedGame.playerId, await getPlayerBankroll(savedGame.playerId));
        player.bet = game.bet; // Restore current bet
        const finalBalance = await player.surrender();
        
        await updateStats(result);

        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            gameState: game.getGameState(),
            result,
            bankroll: finalBalance,
            bankrollChange: finalBalance - (await getPlayerBankroll(savedGame.playerId)),
            playerId: savedGame.playerId
          })
        };
      }

      case 'insurance': {
        if (!gameId) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Game ID required' })
          };
        }

        const savedGame = await loadGameState(gameId);
        if (!savedGame) {
          return {
            statusCode: 404,
            headers: corsHeaders,
            body: JSON.stringify({ error: 'Game not found' })
          };
        }

        const game = BlackjackGame.fromSavedState({
          ...savedGame.gameState,
          shoe: savedGame.shoe
        });

        // PYTHON-STYLE: Use Player for insurance
        const player = new Player(savedGame.playerId, await getPlayerBankroll(savedGame.playerId));
        player.bet = game.bet; // Restore current bet
        
        const insuranceAmount = body.insuranceAmount || Math.floor(game.originalBet * 0.5);
        
        try {
          await player.placeBet(insuranceAmount);
        } catch (error) {
          return {
            statusCode: 400,
            headers: corsHeaders,
            body: JSON.stringify({ 
              error: error.message,
              bankroll: await getPlayerBankroll(savedGame.playerId)
            })
          };
        }
        
        const result = game.playerInsurance(insuranceAmount);
        await saveGameState(game, savedGame.playerId);

        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({
            gameState: game.getGameState(),
            result,
            bankroll: await getPlayerBankroll(savedGame.playerId),
            playerId: savedGame.playerId
          })
        };
      }

      case 'getStats': {
        const stats = await getStats();
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ stats })
        };
      }

      case 'getBankroll': {
        const currentPlayerId = playerId || uuidv4();
        const bankroll = await getPlayerBankroll(currentPlayerId);
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify({ 
            bankroll,
            playerId: currentPlayerId
          })
        };
      }

      default:
        return {
          statusCode: 400,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Invalid action' })
        };
    }
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: error.message })
    };
  }
};
