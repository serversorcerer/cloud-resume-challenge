const { updatePlayerBankroll, getPlayerBankroll } = require('./db');
const { INITIAL_BANKROLL } = require('./constants');

class Player {
  constructor(playerId, bankroll = INITIAL_BANKROLL) {
    this.playerId = playerId;
    this.bankroll = bankroll;
    this.bet = 0;
  }

  async placeBet(amount) {
    if (amount > this.bankroll) throw new Error('Insufficient bankroll.');
    this.bet = amount;
    this.bankroll -= amount;
    await updatePlayerBankroll(this.playerId, this.bankroll, `bet_placed_${amount}`);
    return this.bankroll;
  }

  async payout(multiplier) {
    const amount = Math.floor(this.bet * multiplier);
    this.bankroll += amount;
    await updatePlayerBankroll(this.playerId, this.bankroll, `payout_${amount}`);
    return this.bankroll;
  }

  async getBankroll() {
    this.bankroll = await getPlayerBankroll(this.playerId);
    return this.bankroll;
  }
}

module.exports = Player;
