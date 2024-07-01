// a file AppController.js that contains the definition of the 2 endpoints:
// GET /status should return if Redis is alive and if the DB is alive
// too by using the 2 utils created previously: { "redis": true, "db": true } with a status code 200
// GET /stats should return the number of users and files
// in DB: { "users": 12, "files": 1231 } with a status code 200
// users collection must b used for counting all users
// files collection must be used for counting all files
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class AppController {
  static async getStatus(req, res) {
    try {
      const redisStatus = await redisClient.isAlive();
      const dbStatus = await dbClient.isAlive();
      res.status(200).json({ redis: redisStatus, db: dbStatus });
    } catch (error) {
      res.status(500).json({ error: 'Unable to determine status' });
    }
  }

  static async getStats(req, res) {
    try {
      const userCount = await dbClient.nbUsers();
      const fileCount = await dbClient.nbFiles();
      res.status(200).json({ users: userCount, files: fileCount });
    } catch (error) {
      res.status(500).json({ error: 'Unable to retrieve stats' });
    }
  }
}
module.exports = AppController;
