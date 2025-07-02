# ♠️ Blackjack Game - Cloud Resume Challenge

A fully functional, serverless blackjack game deployed to josephaleto.io using AWS infrastructure.

## 🎮 Features

- **Complete Blackjack Rules**: Hit, Stand, Double Down, and proper scoring
- **Real-time Gameplay**: Smooth card animations and game state management
- **Statistics Tracking**: Win/loss ratios and game history
- **Responsive Design**: Works on desktop and mobile devices
- **Terminal Integration**: Launch game directly from the website terminal
- **Serverless Architecture**: Built with AWS Lambda, API Gateway, and DynamoDB

## 🏗️ Architecture

```
Frontend (website/blackjack.html)
    ↓
API Gateway (HTTP API)
    ↓
Lambda Function (lambda/blackjack.js)
    ↓
DynamoDB Table (game state & stats)
```

### Components

1. **Frontend**: Pure HTML/CSS/JavaScript game interface
2. **Backend**: Node.js Lambda function handling game logic
3. **Database**: DynamoDB for game state persistence and statistics
4. **API**: API Gateway for secure frontend-backend communication
5. **Infrastructure**: Terraform for infrastructure as code

## 🚀 Deployment

### Prerequisites

- AWS CLI configured with appropriate permissions
- Terraform installed
- Node.js and npm for Lambda dependencies

### Quick Deploy

```bash
# Run the automated deployment script
./deploy-blackjack.sh
```

### Manual Deployment

1. **Install Lambda dependencies**:
```bash
cd lambda
npm install
cd ..
```

2. **Deploy infrastructure**:
```bash
cd infra
terraform init
terraform plan -target=aws_dynamodb_table.blackjack_games \
                -target=aws_lambda_function.blackjack_function \
                -target=aws_apigatewayv2_api.blackjack_api
terraform apply
```

3. **Update API URL in frontend**:
```bash
# Get the API URL from Terraform output
API_URL=$(terraform output -raw blackjack_api_url)

# Update blackjack.html with the correct API endpoint
cd ../website
sed -i "s|const API_URL = '.*';|const API_URL = '$API_URL';|g" blackjack.html
```

4. **Deploy website**:
```bash
aws s3 cp blackjack.html s3://josephaleto.io/blackjack.html
```

5. **Update terminal commands**:
```bash
cd ../lambda
zip function.zip commands.js
aws lambda update-function-code --function-name cloud-resume-commands --zip-file fileb://function.zip
```

## 🎯 Game Rules

### Objective
Get as close to 21 as possible without going over, while beating the dealer's hand.

### Card Values
- **Number cards (2-10)**: Face value
- **Face cards (J, Q, K)**: 10 points
- **Aces**: 11 points (automatically adjusts to 1 if needed to avoid bust)

### Player Actions
- **Hit**: Take another card
- **Stand**: Keep current hand and end turn
- **Double Down**: Double your bet, take exactly one more card, then stand

### Winning Conditions
- **Blackjack**: 21 with first two cards (Ace + 10-value card)
- **Win**: Hand closer to 21 than dealer without busting
- **Push**: Tie with dealer
- **Bust**: Hand exceeds 21 (automatic loss)

### Dealer Rules
- Must hit on 16 or less
- Must stand on 17 or more

## 🔧 API Endpoints

### POST /blackjack

**Actions:**
- `newGame`: Start a new game
- `hit`: Player takes a card
- `stand`: Player ends turn, dealer plays
- `double`: Player doubles down
- `getStats`: Retrieve player statistics

**Request Format:**
```json
{
  "action": "newGame|hit|stand|double|getStats",
  "gameId": "uuid-if-required"
}
```

**Response Format:**
```json
{
  "gameState": {
    "gameId": "uuid",
    "playerCards": [{"suit": "♠️", "rank": "A"}],
    "dealerCards": [{"suit": "♥️", "rank": "K"}],
    "gameOver": false,
    "playerTurn": true,
    "canDouble": true
  },
  "result": "win|lose|push|blackjack",
  "stats": {
    "gamesPlayed": 10,
    "gamesWon": 6
  }
}
```

## 📊 Database Schema

### DynamoDB Table: `blackjack-games`

**Game State Records:**
- `pk`: `game#{gameId}`
- `sk`: `state`
- `gameState`: Game state object
- `deck`: Remaining cards in deck
- `ttl`: 24-hour expiration

**Statistics Records:**
- `pk`: `stats`
- `sk`: `global`
- `gamesPlayed`: Total games
- `gamesWon`: Total wins

## 🎨 Frontend Features

- **Card Animations**: Smooth dealing and revealing animations
- **Visual Feedback**: Color-coded game status (win/lose/push)
- **Responsive Design**: Mobile-friendly layout
- **Loading States**: Visual feedback during API calls
- **Statistics Display**: Real-time win rate tracking

## 🔐 Security

- **CORS Configuration**: Properly configured for website domain
- **Input Validation**: Server-side validation of all game actions
- **Rate Limiting**: API Gateway throttling
- **No Sensitive Data**: No real money or personal information stored

## 🧪 Testing

### Manual Testing
1. Visit `https://josephaleto.io/blackjack.html`
2. Click "New Game" to start
3. Test all game actions (Hit, Stand, Double Down)
4. Verify statistics update correctly
5. Test different game scenarios (blackjack, bust, etc.)

### Terminal Integration
1. Visit `https://josephaleto.io`
2. Click on terminal
3. Type `blackjack` command
4. Verify redirection to game

## 📈 Monitoring

- **CloudWatch Logs**: Lambda function execution logs
- **API Gateway Metrics**: Request/response monitoring
- **DynamoDB Metrics**: Read/write capacity monitoring

## 🎯 Future Enhancements

- [ ] Multiplayer support
- [ ] Betting system (virtual chips)
- [ ] Game history and replay
- [ ] Advanced statistics and analytics
- [ ] Tournament mode
- [ ] Social features and leaderboards

## 🔗 Links

- **Play Game**: https://josephaleto.io/blackjack.html
- **Terminal**: https://josephaleto.io (type `blackjack`)
- **Source Code**: https://github.com/serversorcerer/cloud-resume-challenge

## 📄 License

MIT License - see LICENSE file for details.

---

Built with ❤️ and ☁️ by Joe Leto | Deployed on AWS
