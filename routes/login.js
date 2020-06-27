const express = require('express');
const logger = require('../logger/logger');
const jwt = require('jsonwebtoken');
const app = express();
var connection = require('../config/db');
//const bcrypt = require("bcrypt");
const saltRounds = 10;

/* Mailer Code Start */
const nodemailer = require('nodemailer');

// For localhost Auth
var transporter = nodemailer.createTransport({
  host: '125.0.0.1',
  port:25
});

/* Mailer Code End */
  
let refreshTokens = [];

//rest api to create a new tbl_registration record into mysql database
app.post('/register', function (req, res) {
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

// Login For Admin
app.post('/login',(req,res) =>{
  //Authenticate user
  const username = req.body.Email;
  const password = req.body.Password;
  connection.query('SELECT id,firstname,lastname,email,phone,userguid,username,role_id FROM `tbl_registration` WHERE username="'+username+'" and password="'+password+'" and role_id=1', function (error, results, fields) {
    if (error) throw error;
    if(results.length)
    {
      const user = { userguid : results[0].userguid}
      const accessToken = generateAccessToken(user)
      const refreshToken = generateRefreshToken(user);
      refreshTokens.push(refreshToken);
      res.json({ Message:"success",results,accessToken : accessToken, refreshToken : refreshToken});
    }
    else
    {
      res.json({ Message:"Username or Password is wrong. Please Try Again.",results});
    }
    
  });
  // res.json({ accessToken : accessToken, refreshToken : refreshToken});
});

// Login For Delivery Staff
app.post('/deliverystaff_login',(req,res) =>{
  //Authenticate user
  const username = req.body.Email;
  const password = req.body.Password;
  connection.query('SELECT id,firstname,lastname,email,phone,userguid,username,role_id FROM `tbl_registration` WHERE username="'+username+'" and password="'+password+'" and role_id=2', function (error, results, fields) {
    if (error) throw error;
    if(results.length)
    {
      const user = { userguid : results[0].userguid}
      const accessToken = generateAccessToken(user)
      const refreshToken = generateRefreshToken(user);
      refreshTokens.push(refreshToken);
      res.json({ Message:"success",results,accessToken : accessToken, refreshToken : refreshToken});
    }
    else
    {
      res.json({ Message:"Username or Password is wrong. Please Try Again.",results});
    }
    
  });
  // res.json({ accessToken : accessToken, refreshToken : refreshToken});
});

// Login For Customer
app.post('/customer_login',(req,res) =>{
  //Authenticate user
  const username = req.body.Email;
  const password = req.body.Password;
  connection.query('SELECT id,firstname,lastname,email,phone,userguid,username,role_id FROM `tbl_registration` WHERE username="'+username+'" and password="'+password+'" and role_id=3', function (error, results, fields) {
    if (error) throw error;
    if(results.length)
    {
      const user = { userguid : results[0].userguid}
      const accessToken = generateAccessToken(user)
      const refreshToken = generateRefreshToken(user);
      refreshTokens.push(refreshToken);
      res.json({ Message:"success",results,accessToken : accessToken, refreshToken : refreshToken});
    }
    else
    {
      res.json({ Message:"Username or Password is wrong. Please Try Again.",results});
    }
    
  });
  // res.json({ accessToken : accessToken, refreshToken : refreshToken});
});

function generateAccessToken(user){
  return jwt.sign(user,process.env.ACCESS_TOKEN_SECRET)
}

function generateRefreshToken(user){
  return jwt.sign(user,process.env.REFRESH_TOKEN_SECRET)
}

app.post('/PasswordRecovery',(req,res) =>{
  //Authenticate user
  const username = req.body.Email;
  connection.query('SELECT email,userguid FROM `tbl_registration` WHERE email="'+username+'"', function (error, results, fields) {
    if (error) throw error;
    if(results.length)
    {
      var mailOptions = {
        from: 'iampatelprince@gmail.com',
        to: results.email,
        subject: 'Password Recovery Mail',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://localhost:4200/#/passwordreset/' + results.userguid + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
          res.json({ Message:"success"});
        }
      });
      
    }
    else
    {
      res.json({ Message:"Username is wrong. Please Try Again.",results});
    }
    
  });

  
  // res.json({ accessToken : accessToken, refreshToken : refreshToken});
});

module.exports = app;