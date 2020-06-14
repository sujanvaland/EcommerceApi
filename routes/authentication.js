const express = require('express');
const logger = require('../logger/logger');
const jwt = require('jsonwebtoken');
const app = express();

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const username = decodedToken.username;
    if (req.body.username && req.body.userId !== username) {
      return res.sendStatus(401);
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: "You request is unauthorized"
    });
  }
};
