module.exports = {
  INITIAL_BANKROLL: 1000,
  MIN_BET: 10,
  MAX_BET: 500,
  BLACKJACK_PAYOUT: 2.5, // bet + 1.5x
  WIN_PAYOUT: 2, // bet + 1x
  PUSH_PAYOUT: 1, // return bet
  SURRENDER_PAYOUT: 0.5, // return half bet
  INSURANCE_PAYOUT: 2, // bet returned plus 2:1
  NUM_DECKS: 8, // Use 8 decks (52x8 cards)
  MAX_SPLITS: 4
};
