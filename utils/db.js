#!/usr/bin/node
// DBClient should have:
// the constructor that creates a client to MongoDB:
// host: from the environment variable DB_HOST or default: localhost
// port: from the environment variable DB_PORT or default: 27017
// database: from the environment variable DB_DATABASE or default: files_manager
const { MongoClient, ObjectId } = require('mongodb');
const mongo = require('mongodb');
const { hashPassword } = require('./utils');

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || '27017';
    const database = process.env.DB_DATABASE || 'files_manager';

    const url = `mongodb://${host}:${port}/${database}`;
    this.client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
    this.connection = null;
  }

  async init() {
    try {
      await this.connect();
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
    }
  }

  async connect() {
    try {
      await this.client.connect();
      this.connection = this.client.db();
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      this.connection = null;
    }
  }
// a function isAlive that returns true when the connection to MongoDB is success otherwise,false
  async isAlive() {
    try {
      if (!this.connection || !this.client.isConnected()) {
        await this.connect();
      }
      await this.connection.admin().ping();
      return true;
    } catch (error) {
      console.error('MongoDB connection is not alive:', error);
      return false;
    }
  }
// an asynchronous function nbUsers that returns the number of documents in the collection users
  async nbUsers() {
    try {
      if (!this.connection) {
        throw new Error('No database connection');
      }
      const usersCollection = this.connection.collection('users');
      const count = await usersCollection.countDocuments();
      return count;
    } catch (error) {
      console.error('Error counting users:', error);
      return -1;
    }
  }
// an asynchronous function nbFiles that returns the number of documents in the collection files
  async nbFiles() {
    try {
      if (!this.connection) {
        throw new Error('No database connection');
      }
      const filesCollection = this.connection.collection('files');
      const count = await filesCollection.countDocuments();
      return count;
    } catch (error) {
      console.error('Error counting files:', error);
      return -1;
    }
  }

  async createUser(email, password) {
    const hashedPwd = hashPassword(password);
    const user = await this.connection.collection('users').insertOne({ email, password: hashedPwd });
    return user;
  }

  async getUser(email) {
    const user = await this.connection.collection('users').find({ email }).toArray();
    if (!user.length) {
      return null;
    }
    return user[0];
  }

  async getUserById(id) {
    const _id = new mongo.ObjectID(id);
    const user = await this.connection.collection('users').find({ _id }).toArray();
    if (!user.length) {
      return null;
    }
    return user[0];
  }

  async userExist(email) {
    const user = await this.getUser(email);
    if (user) {
      return true;
    }
    return false;
  }
  // for file creation
  async createFile(fileData) {
    try {
      if (!this.connection) {
        throw new Error('No database connection');
      }
      const filesCollection = this.connection.collection('files');
      const result = await filesCollection.insertOne(fileData);
      const insertedFile = result.ops[0];
      return insertedFile;
    } catch (error) {
      console.error('Error creating file:', error);
      throw error;
    }
  }
  // getting the file by id
  async getFileById(id) {
    try {
      if (!this.connection) {
        throw new Error('No database connection');
      }
      const filesCollection = this.connection.collection('files');
      const file = await filesCollection.findOne({ _id: new ObjectId(id) });
      return file;
    } catch (error) {
      console.error('Error getting file by ID:', error);
      return null;
    }
  }
  async disconnect() {
    try {
      if (this.client) {
        await this.client.close();
        console.log('Disconnected from MongoDB');
      }
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }
}

const dbClient = new DBClient();
dbClient.init();

module.exports = dbClient;
