const { hashPassword } = require('../utils/utils');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const { v4: uuidv4 } = require('uuid');

class AuthController {
    static async getConnect(req, res) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Basic ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const base64Credentials = authHeader.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [email, password] = credentials.split(':');

        if (!email || !password) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const hashedPassword = hashPassword(password);

        try {
            const user = await dbClient.getUser(email);
            if (!user || user.password !== hashedPassword) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const token = uuidv4();
            const key = `auth_${token}`;
            await redisClient.set(key, user._id.toString(), 86400);

            return res.status(200).json({ token });
        } catch (error) {
            console.error('Error in authentication:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async getDisconnect(req, res) {
        const token = req.headers['x-token'];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const key = `auth_${token}`;

        try {
            const userId = await redisClient.get(key);
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            await redisClient.del(key);
            return res.status(204).send();
        } catch (error) {
            console.error('Error in disconnecting:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = AuthController;
