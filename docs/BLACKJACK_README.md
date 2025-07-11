# Enhanced Blackjack Game 🃏

A fully-featured blackjack game with professional casino rules, built with AWS Lambda, DynamoDB, and a modern web interface.

## 🎮 Features

### Core Game Rules
- **Standard Blackjack Rules**: Dealer hits on soft 17, player wins on 21
- **Blackjack Pays 3:2**: Natural blackjack pays 1.5x your bet
- **Double Down**: Double your bet and receive one more card
- **Split Pairs**: Split matching cards into separate hands
- **Surrender**: Give up half your bet to end the hand early
- **Insurance**: Bet against dealer blackjack when dealer shows Ace

### Advanced Features
- **Multiple Hands**: Play up to 4 split hands simultaneously
- **Hand Tracking**: Visual indicators for active hand during splits
- **Bankroll Management**: Persistent player bankroll with betting limits
- **Statistics Tracking**: Win/loss ratio and games played
- **Session Management**: Player names and persistent sessions

### Technical Features
- **Real-time Game State**: Live updates via API Gateway
- **Persistent Storage**: Game state saved in DynamoDB
- **Responsive Design**: Works on desktop and mobile
- **Professional UI**: Modern, casino-style interface

## 🚀 Deployment

### Prerequisites
- AWS CLI configured
- Node.js and npm installed
- Terraform (for initial infrastructure setup)

### Quick Deploy
```bash
# Deploy the enhanced blackjack game
./deploy-blackjack.sh
```

### Manual Deployment
```bash
# Navigate to lambda directory
cd lambda

# Install dependencies
npm install

# Create deployment package
zip -r blackjack-enhanced.zip . -x "node_modules/*" "*.zip"

# Deploy to AWS Lambda
aws lambda update-function-code \
    --function-name blackjack-game \
    --zip-file fileb://blackjack-enhanced.zip \
    --region us-east-1
```

## 🎯 How to Play

### Basic Gameplay
1. **Place a Bet**: Choose from $10, $25, $50, $100, $250, or custom amount
2. **Deal Cards**: Click "New Game" to start
3. **Make Decisions**: Hit, Stand, Double Down, Split, or Surrender
4. **Dealer Plays**: Dealer follows house rules (hit on soft 17)
5. **Collect Winnings**: Blackjack pays 3:2, regular wins pay 1:1

### Special Actions

#### Split (🃏)
- **When**: You have two cards of the same rank
- **How**: Click "Split" button
- **Result**: Creates two separate hands, each with its own bet
- **Strategy**: Great for 8s, Aces, and high pairs

#### Double Down (⚡)
- **When**: You have exactly 2 cards
- **How**: Click "Double Down" button
- **Result**: Doubles your bet, you get exactly one more card
- **Strategy**: Best on 10-11 vs dealer 2-9

#### Surrender (🏳️)
- **When**: You have exactly 2 cards (before any other action)
- **How**: Click "Surrender" button
- **Result**: Loses half your bet, ends the hand
- **Strategy**: Use on very weak hands vs strong dealer upcards

#### Insurance (🛡️)
- **When**: Dealer shows an Ace
- **How**: Click "Insurance" button
- **Result**: Side bet that pays 2:1 if dealer has blackjack
- **Strategy**: Generally not recommended (house edge ~7%)

## 🏗️ Architecture

### Backend (AWS Lambda)
- **Runtime**: Node.js 18.x
- **Game Logic**: Complete blackjack rules implementation
- **State Management**: Game state persistence in DynamoDB
- **API**: RESTful endpoints via API Gateway

### Frontend (Static HTML/JS)
- **Framework**: Vanilla JavaScript
- **Styling**: Custom CSS with modern design
- **Responsive**: Mobile-first design approach
- **Real-time**: Live updates via fetch API

### Database (DynamoDB)
- **Tables**: 
  - `blackjack-games`: Game state and player data
  - `player-stats`: Win/loss statistics
- **TTL**: Automatic cleanup of old game data

## 📊 API Endpoints

### Game Actions
- `POST /blackjack` - Main game endpoint
  - `action: "newGame"` - Start new game
  - `action: "hit"` - Take a card
  - `action: "stand"` - End turn
  - `action: "double"` - Double down
  - `action: "split"` - Split pairs
  - `action: "surrender"` - Surrender hand
  - `action: "insurance"` - Take insurance

### Data Actions
- `action: "getStats"` - Get player statistics
- `action: "getBankroll"` - Get current bankroll

## 🎨 UI Features

### Visual Design
- **Dark Theme**: Casino-style dark interface
- **Card Animations**: Smooth card dealing animations
- **Status Indicators**: Clear game state feedback
- **Hand Highlighting**: Active hand during splits
- **Responsive Layout**: Works on all screen sizes

### User Experience
- **Intuitive Controls**: Clear button labels and states
- **Real-time Feedback**: Immediate response to actions
- **Error Handling**: Graceful error messages
- **Loading States**: Visual feedback during API calls

## 🔧 Configuration

### Environment Variables
- `BLACKJACK_TABLE`: DynamoDB table name
- `MIN_BET`: Minimum bet amount (default: $10)
- `MAX_BET`: Maximum bet amount (default: $500)
- `INITIAL_BANKROLL`: Starting bankroll (default: $1000)

### Game Settings
- **Deck**: Standard 52-card deck
- **Shuffle**: Random shuffle after each game
- **Dealer Rules**: Hit on soft 17
- **Blackjack Payout**: 3:2 (1.5x bet)
- **Insurance Payout**: 2:1
- **Surrender**: Early surrender (before dealer checks for blackjack)

## 🧪 Testing

### Manual Testing
1. **Basic Gameplay**: Play several hands to verify rules
2. **Split Testing**: Test splits with various card combinations
3. **Edge Cases**: Test blackjack, bust, push scenarios
4. **Bankroll**: Verify betting and payout calculations
5. **Persistence**: Check that game state saves correctly

### Automated Testing
```bash
# Run tests (if implemented)
npm test

# Check API endpoints
curl -X POST https://your-api-url/blackjack \
  -H "Content-Type: application/json" \
  -d '{"action":"newGame","bet":10}'
```

## 🚨 Troubleshooting

### Common Issues
- **API Errors**: Check Lambda function logs in CloudWatch
- **State Issues**: Verify DynamoDB table permissions
- **UI Problems**: Check browser console for JavaScript errors
- **Deployment Failures**: Ensure AWS credentials are configured

### Debug Mode
Enable debug logging by setting environment variable:
```bash
DEBUG=true
```

## 📈 Performance

### Optimizations
- **Lambda Cold Start**: ~100-200ms
- **API Response Time**: ~50-100ms
- **Database Queries**: Optimized DynamoDB access patterns
- **Frontend Loading**: Minified CSS/JS, optimized images

### Scalability
- **Concurrent Players**: Limited by Lambda concurrency limits
- **Database**: DynamoDB auto-scaling
- **API Gateway**: Handles thousands of requests per second

## 🎉 Future Enhancements

### Planned Features
- **Multiplayer**: Real-time multiplayer games
- **Tournaments**: Scheduled blackjack tournaments
- **Leaderboards**: Global player rankings
- **Achievements**: Unlockable achievements and badges
- **Customization**: Player avatars and themes

### Technical Improvements
- **WebSocket**: Real-time updates without polling
- **Caching**: Redis for improved performance
- **Analytics**: Detailed game analytics and insights
- **Mobile App**: Native iOS/Android applications

## 📄 License

This project is part of the Cloud Resume Challenge and is for educational purposes.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Happy Gaming! 🃏♠️♥️♦️♣️**
