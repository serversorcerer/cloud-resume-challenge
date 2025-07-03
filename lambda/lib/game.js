const { v4: uuidv4 } = require('uuid');
const {
  NUM_DECKS,
  MAX_SPLITS,
} = require('./constants');

const SUITS = ['♠️', '♥️', '♦️', '♣️'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

class BlackjackGame {
  constructor(bet, shoe = null) {
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
    this.maxSplits = MAX_SPLITS;
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
    if (this.shoe.length < 52) this.shoe = this.createShoe();
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
    if (this.splitCount >= this.maxSplits) return false;
    const tenValues = ['10', 'J', 'Q', 'K'];
    if (cards[0].rank === 'A' && cards[1].rank === 'A') return true;
    return (
      cards[0].rank === cards[1].rank ||
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
    const dealerUp = this.dealerCards[0];
    const tenValues = ['10', 'J', 'Q', 'K'];
    if (dealerUp.rank === 'A' || tenValues.includes(dealerUp.rank)) {
      if (this.isBlackjack(this.dealerCards)) {
        this.gameOver = true;
        this.playerTurn = false;
      }
    }
  }

  getCurrentHand() {
    if (this.hands.length > 0) return this.hands[this.currentHandIndex];
    return this.playerCards;
  }

  playerHit() {
    if (this.gameOver || !this.playerTurn) throw new Error('Invalid move');
    const currentHand = this.getCurrentHand();
    if (this.splitAces) throw new Error('Cannot hit split Aces');
    currentHand.push(this.dealCard());
    this.canDouble = false;
    if (this.isBust(currentHand)) {
      if (this.hands.length > 0 && this.currentHandIndex < this.hands.length - 1) {
        this.currentHandIndex++;
        this.canDouble = this.hands[this.currentHandIndex].length === 2;
        return null;
      }
      this.gameOver = true;
      this.playerTurn = false;
      return this.dealerPlay();
    }
    return null;
  }

  playerStand() {
    if (this.gameOver || !this.playerTurn) throw new Error('Invalid move');
    if (this.hands.length > 0 && this.currentHandIndex < this.hands.length - 1) {
      this.currentHandIndex++;
      this.canDouble = this.hands[this.currentHandIndex].length === 2;
      return null;
    }
    if (!this.isBust(this.getCurrentHand())) {
      this.playerTurn = false;
      return this.dealerPlay();
    }
    this.gameOver = true;
    this.playerTurn = false;
    return this.determineWinner();
  }

  playerDouble() {
    if (this.gameOver || !this.playerTurn || !this.canDouble) throw new Error('Invalid move');
    const currentHand = this.getCurrentHand();
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
      }
      this.gameOver = true;
      this.playerTurn = false;
      return this.dealerPlay();
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
    if (this.gameOver || !this.playerTurn || !this.canSplit) throw new Error('Invalid move');
    if (this.splitCount >= this.maxSplits) throw new Error('Maximum splits reached');
    const [card1, card2] = this.playerCards;
    if (card1.rank === 'A' && card2.rank === 'A') {
      this.hands = [ [card1, this.dealCard()], [card2, this.dealCard()] ];
      this.splitAces = true;
    } else {
      this.hands = [ [card1, this.dealCard()], [card2, this.dealCard()] ];
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
    if (this.gameOver || !this.playerTurn || !this.canSurrender || this.hands.length > 0)
      throw new Error('Invalid move');
    this.surrendered = true;
    this.gameOver = true;
    this.playerTurn = false;
    return 'surrender';
  }

  playerInsurance(amount) {
    if (!this.canInsure || this.insuranceBet > 0) throw new Error('Invalid move');
    this.insuranceBet = amount;
    return null;
  }

  dealerPlay() {
    while (
      this.calculateHandValue(this.dealerCards) < 17 ||
      (this.calculateHandValue(this.dealerCards) === 17 && this.hasSoft17(this.dealerCards))
    ) {
      this.dealerCards.push(this.dealCard());
    }
    this.gameOver = true;
    return this.determineWinner();
  }

  hasSoft17(cards) {
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
    if (this.surrendered) return 'surrender';
    let insuranceResult = null;
    if (this.insuranceBet > 0 && this.isBlackjack(this.dealerCards)) {
      insuranceResult = 'insurance_win';
    }
    if (this.hands.length > 0) {
      const results = [];
      for (let i = 0; i < this.hands.length; i++) {
        results.push(this.determineHandWinner(this.hands[i], this.dealerCards, this.splitBets[i], true));
      }
      return { type: 'split', results, insurance: insuranceResult };
    }
    const result = this.determineHandWinner(this.playerCards, this.dealerCards, this.bet, false);
    return { type: 'single', result, insurance: insuranceResult };
  }

  determineHandWinner(playerCards, dealerCards, bet, isSplitHand = false) {
    const playerValue = this.calculateHandValue(playerCards);
    const dealerValue = this.calculateHandValue(dealerCards);
    const playerBlackjack = this.isBlackjack(playerCards);
    const dealerBlackjack = this.isBlackjack(dealerCards);

    if (playerBlackjack && !dealerBlackjack) {
      if (!isSplitHand) return { result: 'blackjack', bet };
      return { result: 'win', bet };
    }

    if (dealerBlackjack && !playerBlackjack) {
      return { result: 'lose', bet };
    }

    if (playerBlackjack && dealerBlackjack) {
      if (!isSplitHand) return { result: 'push', bet };
      return { result: 'lose', bet };
    }

    if (this.isBust(playerCards)) return { result: 'lose', bet };
    if (this.isBust(dealerCards)) return { result: 'win', bet };

    if (playerValue > dealerValue) return { result: 'win', bet };
    if (playerValue < dealerValue) return { result: 'lose', bet };
    return { result: 'push', bet };
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
      splitBets: this.splitBets,
    };
  }

  static fromSavedState(state) {
    const game = new BlackjackGame(state.bet);
    game.gameId = state.gameId;
    game.playerCards = state.playerCards || [];
    game.dealerCards = state.dealerCards || [];
    game.hands = state.hands || [];
    game.currentHandIndex = state.currentHandIndex || 0;
    game.gameOver = state.gameOver || false;
    game.playerTurn = state.playerTurn !== undefined ? state.playerTurn : true;
    game.canDouble = state.canDouble !== undefined ? state.canDouble : true;
    game.canSplit = state.canSplit !== undefined ? state.canSplit : false;
    game.canSurrender = state.canSurrender !== undefined ? state.canSurrender : true;
    game.canInsure = state.canInsure !== undefined ? state.canInsure : false;
    game.shoe = state.shoe || game.createShoe();
    game.bet = state.bet;
    game.originalBet = state.originalBet || state.bet;
    game.insuranceBet = state.insuranceBet || 0;
    game.surrendered = state.surrendered || false;
    game.splitBets = state.splitBets || [];
    return game;
  }
}

module.exports = BlackjackGame;
