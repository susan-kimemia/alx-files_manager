const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class UsersController {
    static async postNew(req, res) {
        const { email, password } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Missing email' });
        }
        if (!password) {
            return res.status(400).json({ error: 'Missing password' });
        }

        try {
            const existingUser = await dbClient.userExist(email);
            if (existingUser) {
                return res.status(400).json({ error: 'Already exist' });
            }

            const user = await dbClient.createUser(email, password);
            const id = `${user.insertedId}`;

            return res.status(201).json({ id, email });
        } catch (error) {
            console.error('Error creating user:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }

    static async getMe(req, res) {
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

            const user = await dbClient.getUserById(userId);
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            return res.status(200).json({ id: user._id, email: user.email });
        } catch (error) {
            console.error('Error retrieving user:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = UsersController;
