const express = require('express');
const logger = require('../logger/logger');
const jwt = require('jsonwebtoken');
const app = express();

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const CustomerGuid = decodedToken.userguid;
    if (req.headers.customerguid !== CustomerGuid) {
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
