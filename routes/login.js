const express = require('express');
const logger = require('../logger/logger');
const jwt = require('jsonwebtoken');
const app = express();
var connection = require('../config/db');
  
let refreshTokens = [];

//rest api to create a new tbl_registration record into mysql database
app.post('/register', function (req, res) {
  console.log(req);
  var params  = req.body;
  connection.query('INSERT INTO `tbl_registration` SET ?', params, function (error, results, fields) {
     if (error) throw error;
     res.send(results);
   });
});

app.get('/token', (req,res) =>{
  const refreshToken = req.body.token;
  if(refreshToken == null) return res.sendStatus(401)
  if(!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
  jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET, (err,user) =>{
    if(err) return res.sendStatus(403)
    const accessToken =  generateAccessToken({ name : user.name});
    res.json({ accessToken : accessToken });
  });
});

app.delete('/logout', (req,res) =>{
  refreshTokens = refreshTokens.filter(token => token !== req.body.token)
  res.sendStatus(204);
});

app.post('/login',(req,res) =>{
  //Authenticate user
  const username = req.body.Email;
  const password = req.body.Password;
  var params  = req.body;
  connection.query('SELECT * FROM `tbl_registration` WHERE username="'+username+'" and password="'+password+'"', function (error, results, fields) {
    if (error) throw error;
    if(results.length)
    {
      const user = { name : username}
      const accessToken = generateAccessToken(user)
      const refreshToken = generateRefreshToken(user);
      refreshTokens.push(refreshToken);
      res.json({ Message:"success",results,accessToken : accessToken, refreshToken : refreshToken});
    }
    else
    {
      res.json({ Message:"Email or Password is wrong. Please Try Again.",results});
    }
    
  });

  
  // res.json({ accessToken : accessToken, refreshToken : refreshToken});
});

function generateAccessToken(user){
  return jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{ expiresIn : '15s'})
}

function generateRefreshToken(user){
  return jwt.sign(user,process.env.REFRESH_TOKEN_SECRET)
}

module.exports = app;