#!/usr/bin/node
// Inside the folder utils, create a file redis.js that contains the class RedisClient.
// RedisClient should have:
// the constructor that creates a client to Redis:
// any error of the redis client must be displayed in the console
// a function isAlive that returns true when the connection to Redis is a success otherwise, false

const Redis = require('ioredis');

class RedisClient {
  constructor() {
    this.client = new Redis();
    this.client.on('error', (err) => {
      console.error('Redis error:', err);
    });
  }

  async isAlive() {
    try {
      await this.client.ping();
      return true;
    } catch (error) {
      console.error('Connection check failed:', error);
      return false;
    }
  }

  async get(key) {
    try {
      return await this.client.get(key); // Ensure it returns a string
    } catch (error) {
      console.error('Error getting value:', error);
      return null;
    }
  }

  async set(key, value, duration) {
    try {
      await this.client.set(key, value, 'EX', duration);
    } catch (error) {
      console.error('Error setting value:', error);
      throw error;
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Error deleting key:', error);
      throw error;
    }
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
