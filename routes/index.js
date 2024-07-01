#!/usr/bin/node
// Inside the folder routes, create a file index.js that contains all endpoints of our API:
// GET /status => AppController.getStatus
// GET /stats => AppController.getStats
const express = require('express');

const router = express.Router();
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');
const FilesController = require('../controllers/FilesController');
//const UserController = require('../controllers/UserController');

// definning the routes 
//router.get('/status', AppController.getStatus);
//router.get('/stats', AppController.getStats);
//router.post('/users', UsersController.postNew);
//router.get('/connect', AuthController.getConnect);
//router.get('/disconnect', AuthController.getDisconnect);
//router.get('/users/me', UsersController.getMe);
router.get('/status', AppController.getStatus ? AppController.getStatus : (req, res) => {});
router.get('/stats', AppController.getStats ? AppController.getStats : (req, res) => {});
router.post('/users', UsersController.postNew ? UsersController.postNew : (req, res) => {});
router.get('/connect', AuthController.getConnect ? AuthController.getConnect : (req, res) => {});
router.get('/disconnect', AuthController.getDisconnect ? AuthController.getDisconnect : (req, res) => {});
router.get('/users/me', UsersController.getMe ? UsersController.getMe : (req, res) => {});
router.post('/files', FilesController.postUpload ? FilesController.postUpload: (req, res) => {});

// This code checks if each controller method is defined before calling it.
// If it's not defined, it uses a default callback function that does nothing.

module.exports = router;
