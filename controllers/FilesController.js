#!/usr/bin/node
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

// files controller for the file

class FilesController {
    static async postUpload(req, res) {
        // for getting the authorization
        const token = req.headers['x-token'];
        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const { name, type, parentId = 0, isPublic = false, data } = req.body;
        // extracting the required information from the body of the request
        

        // validating the input and if the neccessary field are provided
        if (!name) {
            return res.status(400).json({ error: 'Missing name' });
        }
        if (!type || !['folder', 'file', 'image'].includes(type)) {
            return res.status(400).json({ error: 'Missing type or invalid type' });
        }
        if (type !== 'folder' && !data) {
            return res.status(400).json({ error: 'Missing data' });
        }
        // validating parentId if it is provided
        if (parentId !== 0) {
            const parentFile = await dbClient.getFileById(parentId);
            if (!parentFile) {
                return res.status(400).json({ error: 'Parent not found' });
            }
            if (parentFile.type !== 'folder') {
                return res.status(400).json({ error: 'Parent is not a folder' });
            }
        }
        const fileData = {
            userId,
            name,
            type,
            parentId: parentId === 0 ? null : parentId,
            isPublic,
        };
        if (type !== 'folder') {
            const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
            }
            const localPath = path.join(folderPath, uuidv4());
            fs.writeFileSync(localPath, Buffer.from(data, 'base64'));
            fileData.localPath = localPath;
        }
        try {
            const newFile = await dbClient.createFile(fileData);
            return res.status(201).json(newFile);
        } catch (error) {
            console.error('Error creating file:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
module.exports = FilesController;