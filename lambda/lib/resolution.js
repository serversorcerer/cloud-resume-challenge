const Player = require('./player');
const {
  INSURANCE_PAYOUT
} = require('./constants');
const { updatePlayerBankroll, getPlayerBankroll } = require('./db');

function calculatePayout(outcome, bet) {
  switch (outcome) {
  case 'blackjack':
    return bet * 2.5;
  case 'win':
    return bet * 2;
  case 'push':
    return bet;
  case 'surrender':
    return bet / 2;
  case 'lose':
  default:
    return 0;
  }
}

async function resolveGame(game, playerId) {
  const player = new Player(playerId, await getPlayerBankroll(playerId));
  player.bet = game.bet;
  let totalPayout = 0;
  const outcomes = [];

  if (game.hands.length > 0) {
    for (let i = 0; i < game.hands.length; i++) {
      const { result, payout } = game.determineHandWinner(
        game.hands[i],
        game.dealerCards,
        game.splitBets[i],
        true
      );
      totalPayout += payout;
      const bet = game.splitBets[i];
      outcomes.push({ bet, result, payout, net: payout - bet });
    }
  } else {
    const handResult = game.surrendered
      ? { result: 'surrender', bet: game.bet, payout: calculatePayout('surrender', game.bet) }
      : game.determineHandWinner(
        game.playerCards,
        game.dealerCards,
        game.bet,
        false
      );
    totalPayout += handResult.payout;
    outcomes.push({ bet: game.bet, result: handResult.result, payout: handResult.payout, net: handResult.payout - game.bet });
  }

  if (game.insuranceBet > 0) {
    if (game.isBlackjack(game.dealerCards)) {
      totalPayout += game.insuranceBet * INSURANCE_PAYOUT;
    }
    // if dealer not blackjack, insurance bet already deducted
  }

  const finalBalance = player.bankroll + totalPayout;
  await updatePlayerBankroll(playerId, finalBalance, 'round_settlement');

  outcomes.forEach(o => {
    console.log(
      `[DEBUG] Bet: $${o.bet} | Result: ${o.result.toUpperCase()} | Payout: $${o.payout} | New Bankroll: $${finalBalance}`
    );
  });

  return {
    finalBalance,
    bankrollChange: finalBalance - player.bankroll,
    outcomes // include detailed hand-by-hand results
  };
}

module.exports = { resolveGame, calculatePayout };
