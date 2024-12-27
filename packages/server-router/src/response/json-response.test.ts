import { describe, test, expect } from 'bun:test';
import { json } from './json-response';

describe('json response utility', () => {
  describe('success responses', () => {
    test('should create a basic success response', async () => {
      const data = { name: 'John' };
      const response = json(data);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      
      const body = await response.json();
      expect(body).toEqual({ name: 'John' });
    });

    test('should allow custom status code', async () => {
      const data = { id: 1 };
      const response = json(data, { status: 201 });
      
      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body).toEqual({ id: 1 });
    });

    test('should accept custom headers', async () => {
      const response = json({ test: true }, { 
        headers: { 
          'Cache-Control': 'no-cache',
          'X-Custom': 'value'
        }
      });

      expect(response.headers.get('Cache-Control')).toBe('no-cache');
      expect(response.headers.get('X-Custom')).toBe('value');
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    test('should preserve data types', async () => {
      const data = {
        string: 'test',
        number: 123,
        boolean: true,
        array: [1, 2, 3],
        object: { key: 'value' },
        null: null
      };
      
      const response = json(data);
      const body = await response.json();
      expect(body).toEqual(data);
    });
  });

  describe('error responses', () => {
    test('should create a basic error response', async () => {
      const response = json.error('Something went wrong');
      
      expect(response.status).toBe(400);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      
      const body = await response.json();
      expect(body).toEqual({
        error: 'Something went wrong'
      });
    });

    test('should accept status code as number', async () => {
      const response = json.error('Not Found', 404);
      
      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body).toEqual({
        error: 'Not Found'
      });
    });

    test('should accept options object', async () => {
      const response = json.error('Unauthorized', {
        status: 401,
        headers: { 'WWW-Authenticate': 'Bearer' }
      });
      
      expect(response.status).toBe(401);
      expect(response.headers.get('WWW-Authenticate')).toBe('Bearer');
      
      const body = await response.json();
      expect(body).toEqual({
        error: 'Unauthorized'
      });
    });

    test('should include error details when provided', async () => {
      const details = { field: 'email', message: 'Invalid format' };
      const response = json.error('Validation failed', 400, details);
      
      const body = await response.json();
      expect(body).toEqual({
        error: 'Validation failed',
        details: { field: 'email', message: 'Invalid format' }
      });
    });
  });

  describe('edge cases', () => {
    test('should handle null data', async () => {
      const response = json(null);
      const body = await response.json();
      expect(body).toBe(null);
    });

    test('should handle undefined data as null', async () => {
      const response = json(undefined);
      const body = await response.json();
      expect(body).toBe(null);
    });

    test('should handle array data', async () => {
      const data = [1, 2, 3];
      const response = json(data);
      const body = await response.json();
      expect(body).toEqual([1, 2, 3]);
    });

    test('should handle empty objects', async () => {
      const response = json({});
      const body = await response.json();
      expect(body).toEqual({});
    });

    test('should handle complex nested structures', async () => {
      const data = {
        users: [
          { id: 1, items: ['a', 'b'] },
          { id: 2, items: ['c', 'd'] }
        ],
        metadata: {
          total: 2,
          page: 1
        }
      };
      
      const response = json(data);
      const body = await response.json();
      expect(body).toEqual(data);
    });
  });
});
