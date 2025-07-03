const Player = require('./player');
const {
  BLACKJACK_PAYOUT,
  WIN_PAYOUT,
  PUSH_PAYOUT,
  SURRENDER_PAYOUT,
  INSURANCE_PAYOUT,
} = require('./constants');
const { updatePlayerBankroll, getPlayerBankroll } = require('./db');

function outcomeMultiplier(result, isBlackjack = false) {
  switch (result) {
    case 'blackjack':
      return BLACKJACK_PAYOUT;
    case 'win':
      return WIN_PAYOUT;
    case 'push':
      return PUSH_PAYOUT;
    case 'surrender':
      return SURRENDER_PAYOUT;
    default:
      return 0; // lose
  }
}

async function resolveGame(game, playerId) {
  const player = new Player(playerId, await getPlayerBankroll(playerId));
  player.bet = game.bet;
  let totalReturn = 0;

  if (game.hands.length > 0) {
    for (let i = 0; i < game.hands.length; i++) {
      const { result, bet } = game.determineHandWinner(
        game.hands[i],
        game.dealerCards,
        game.splitBets[i],
        true
      );
      totalReturn += bet * outcomeMultiplier(result);
    }
  } else if (game.surrendered) {
    totalReturn += game.bet * outcomeMultiplier('surrender');
  } else {
    const { result, bet } = game.determineHandWinner(
      game.playerCards,
      game.dealerCards,
      game.bet,
      false
    );
    totalReturn += bet * outcomeMultiplier(result);
  }

  if (game.insuranceBet > 0) {
    if (game.isBlackjack(game.dealerCards)) {
      totalReturn += game.insuranceBet * INSURANCE_PAYOUT;
    }
    // if dealer not blackjack, insurance bet already deducted
  }

  const finalBalance = player.bankroll + totalReturn;
  await updatePlayerBankroll(playerId, finalBalance, 'round_settlement');

  return {
    finalBalance,
    bankrollChange: finalBalance - player.bankroll,
  };
}

module.exports = resolveGame;
