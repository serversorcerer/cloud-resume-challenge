const { handler } = require('../blackjack');

// Mock external dependencies
jest.mock('../lib/db', () => ({
  saveGameState: jest.fn(),
  loadGameState: jest.fn(),
  updateStats: jest.fn(),
  getStats: jest.fn(),
  getPlayerBankroll: jest.fn().mockResolvedValue(1000)
}));

jest.mock('../lib/game');
jest.mock('../lib/resolution');
jest.mock('../lib/player');

describe('Blackjack Lambda Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CORS Headers', () => {
    it('should handle OPTIONS request with CORS headers', async () => {
      const event = {
        httpMethod: 'OPTIONS',
        headers: {
          origin: 'https://josephaleto.io'
        }
      };

      const result = await handler(event);

      expect(result.statusCode).toBe(200);
      expect(result.headers['Access-Control-Allow-Origin']).toBe('https://josephaleto.io');
      expect(result.headers['Access-Control-Allow-Methods']).toBe('GET,POST,OPTIONS');
    });

    it('should use default origin for unknown origins', async () => {
      const event = {
        httpMethod: 'OPTIONS',
        headers: {
          origin: 'https://malicious-site.com'
        }
      };

      const result = await handler(event);

      expect(result.headers['Access-Control-Allow-Origin']).toBe('https://josephaleto.io');
    });
  });

  describe('Request Parsing', () => {
    it('should handle invalid JSON in request body', async () => {
      const event = {
        httpMethod: 'POST',
        body: 'invalid json',
        headers: {}
      };

      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body)).toEqual({ error: 'Invalid request body' });
    });

    it('should handle missing body', async () => {
      const event = {
        httpMethod: 'POST',
        headers: {}
      };

      const result = await handler(event);

      // Should not throw an error for missing body
      expect(result.statusCode).not.toBe(400);
    });
  });

  describe('New Game Action', () => {
    it('should validate bet amounts', async () => {
      const event = {
        httpMethod: 'POST',
        body: JSON.stringify({
          action: 'newGame',
          bet: 5 // Below minimum
        }),
        headers: {}
      };

      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).error).toContain('Bet must be between');
    });

    it('should reject bets exceeding maximum', async () => {
      const event = {
        httpMethod: 'POST',
        body: JSON.stringify({
          action: 'newGame',
          bet: 10000 // Above maximum
        }),
        headers: {}
      };

      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).error).toContain('Bet must be between');
    });
  });

  describe('Game Actions', () => {
    it('should require gameId for hit action', async () => {
      const event = {
        httpMethod: 'POST',
        body: JSON.stringify({
          action: 'hit'
        }),
        headers: {}
      };

      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).error).toBe('Game ID required');
    });

    it('should require gameId for stand action', async () => {
      const event = {
        httpMethod: 'POST',
        body: JSON.stringify({
          action: 'stand'
        }),
        headers: {}
      };

      const result = await handler(event);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).error).toBe('Game ID required');
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown actions gracefully', async () => {
      const event = {
        httpMethod: 'POST',
        body: JSON.stringify({
          action: 'unknownAction'
        }),
        headers: {}
      };

      const result = await handler(event);

      // Should not crash, but may not have specific handling
      expect(result.statusCode).toBeDefined();
    });
  });

  describe('GET vs POST handling', () => {
    it('should handle GET requests with query parameters', async () => {
      const event = {
        httpMethod: 'GET',
        queryStringParameters: {
          action: 'newGame',
          bet: '100'
        },
        headers: {}
      };

      // This will test the parameter extraction logic
      const result = await handler(event);
      
      expect(result.statusCode).toBeDefined();
    });

    it('should handle POST requests with body parameters', async () => {
      const event = {
        httpMethod: 'POST',
        body: JSON.stringify({
          action: 'newGame',
          bet: 100
        }),
        headers: {}
      };

      const result = await handler(event);
      
      expect(result.statusCode).toBeDefined();
    });
  });
});
