#!/usr/bin/node
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
}

module.exports = UsersController;
