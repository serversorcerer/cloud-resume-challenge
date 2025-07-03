const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.BLACKJACK_TABLE || 'blackjack-games';
const { INITIAL_BANKROLL } = require('./constants');

async function saveGameState(game, playerId) {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      pk: `game#${game.gameId}`,
      sk: 'state',
      gameState: game.getGameState(),
      shoe: game.shoe,
      playerId,
      ttl: Math.floor(Date.now() / 1000) + 86400,
      createdAt: new Date().toISOString(),
    },
  };
  await dynamodb.put(params).promise();
}

async function loadGameState(gameId) {
  const params = {
    TableName: TABLE_NAME,
    Key: { pk: `game#${gameId}`, sk: 'state' },
  };
  const result = await dynamodb.get(params).promise();
  return result.Item;
}

async function updateStats(result) {
  const params = {
    TableName: TABLE_NAME,
    Key: { pk: 'stats', sk: 'global' },
    UpdateExpression: 'ADD gamesPlayed :p, gamesWon :w',
    ExpressionAttributeValues: {
      ':p': 1,
      ':w': ['win', 'blackjack'].includes(result) ? 1 : 0,
    },
    ReturnValues: 'ALL_NEW',
  };
  const res = await dynamodb.update(params).promise();
  return res.Attributes;
}

async function getStats() {
  const params = {
    TableName: TABLE_NAME,
    Key: { pk: 'stats', sk: 'global' },
  };
  const result = await dynamodb.get(params).promise();
  return result.Item || { gamesPlayed: 0, gamesWon: 0 };
}

async function getPlayerBankroll(playerId) {
  const params = {
    TableName: TABLE_NAME,
    Key: { pk: `player#${playerId}`, sk: 'bankroll' },
  };
  const result = await dynamodb.get(params).promise();
  if (!result.Item) {
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
      createdAt: new Date().toISOString(),
    },
  };
  await dynamodb.put(params).promise();
}

async function updatePlayerBankroll(playerId, newBankroll, reason = 'unknown') {
  const current = await getPlayerBankroll(playerId);
  const change = newBankroll - current;
  console.log(`[BANKROLL] ${reason}: ${current} -> ${newBankroll} (${change >= 0 ? '+' : ''}${change})`);
  const params = {
    TableName: TABLE_NAME,
    Key: { pk: `player#${playerId}`, sk: 'bankroll' },
    UpdateExpression: 'SET bankroll = :b, updatedAt = :u',
    ExpressionAttributeValues: {
      ':b': newBankroll,
      ':u': new Date().toISOString(),
    },
    ReturnValues: 'ALL_NEW',
  };
  const res = await dynamodb.update(params).promise();
  return res.Attributes.bankroll;
}

module.exports = {
  saveGameState,
  loadGameState,
  updateStats,
  getStats,
  getPlayerBankroll,
  initializePlayer,
  updatePlayerBankroll,
};
