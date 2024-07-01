#!/usr/bin/node
const { v4 } = require('uuid');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const { getAuthzHeader, getToken, hashPassword } = require('../utils/utils');
const { decodeToken, getCredentials } = require('../utils/utils');

class AuthController {
  static async getConnect(req, res) {
    try {
      const authzHeader = getAuthzHeader(req);
      if (!authzHeader) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = getToken(authzHeader);
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const decodedToken = decodeToken(token);
      if (!decodedToken) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { email, password } = getCredentials(decodedToken);
      const user = await dbClient.getUser(email);
      if (!user || user.password !== hashPassword(password)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const accessToken = v4();
      await redisClient.set(`auth_${accessToken}`, user._id.toString(), 60 * 60 * 24); // Store as string
      res.json({ token: accessToken });
    } catch (error) {
      console.error('Error during user connection:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Other methods remain unchanged

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      res.end();
      return;
    }
    const id = await redisClient.get(`auth_${token }`);
    if (!id) {
      res.status(401).json({ error: 'Unauthorized' });
      res.end();
      return;
    }
    const user = await dbClient.getUserById(id);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      res.end();
      return;
    }
    await redisClient.del(`auth_${token}`);
    res.status(204).end();
  }
  static async getMe(req, res) {
    try {
      const token = req.headers['x-token'];
      if (!token) {
        console.log('Missing token');
        return res.status(401).json({ error: 'Unauthorized' });
      }
  
      const userId = await redisClient.get(`auth_${token}`);
      console.log('Retrieved user ID from Redis:', userId); // Add debug log
  
      if (!userId) {
        console.log('Token not found or expired');
        return res.status(401).json({ error: 'Unauthorized' });
      }
  
      const user = await dbClient.getUserById(userId);
      console.log('User fetched from DB:', user); // Add debug log
  
      if (!user) {
        console.log('User not found in DB');
        return res.status(401).json({ error: 'Unauthorized' });
      }
  
      res.json({ id: user._id, email: user.email });
    } catch (error) {
      console.error('Error in getMe:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }  
}

module.exports = AuthController;