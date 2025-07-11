// Sweepstakes Configuration
module.exports = {
  // Entry System
  DAILY_FREE_ENTRIES: 5,
  MAX_DAILY_ENTRIES: 10,
  ENTRY_REFILL_HOURS: 24,
  
  // Points System (replaces money)
  STARTING_POINTS: 1000,
  MIN_BET_POINTS: 10,
  MAX_BET_POINTS: 500,
  
  // Prize Tiers
  PRIZE_TIERS: {
    bronze: { threshold: 5000, prizes: ['$10 Gift Card', '$5 Cash'] },
    silver: { threshold: 15000, prizes: ['$25 Gift Card', '$20 Cash'] },
    gold: { threshold: 50000, prizes: ['$100 Gift Card', '$75 Cash'] },
    platinum: { threshold: 100000, prizes: ['$500 Gift Card', '$400 Cash'] }
  },
  
  // Compliance
  MIN_AGE: 18,
  RESTRICTED_STATES: ['ND', 'MT'], // Example - check actual laws
  VOID_WHERE_PROHIBITED: true,
  
  // Entry Methods
  ENTRY_METHODS: {
    play: 'Play games to earn entries',
    mail: 'Mail-in entry (AMOE)',
    social: 'Social media engagement'
  }
};
