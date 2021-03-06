const express = require('express');
const logger = require('../logger/logger');
const jwt = require('jsonwebtoken');
const app = express();
var connection = require('../config/db');
const { v1: uuidv1 } = require('uuid');
//const bcrypt = require("bcrypt");
const saltRounds = 10;

/* Mailer Code Start */
const nodemailer = require('nodemailer');

// For localhost Auth
var transporter = nodemailer.createTransport({
  host: "mail.thedailymeat.in",
  port: 465,
  secure: true, // upgrade later with STARTTLS
  auth: {
    user: "system@thedailymeat.in",
    pass: "Firefox@001"
  }
});
/* Mailer Code End */
  
let refreshTokens = [];

let fromemail = 'contact@thedailymeat.in';

// SMS Code Start
var request = require('request');
var SendSMSURL='http://dnd.smssetu.co.in/smsstatuswithid.aspx';
var SMSusername='9687268055';
var SMSpassword='TDM055VDR';
var SMSsenderId='TDMEAT';

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
  connection.query('SELECT id,firstname,lastname,email,phone,userguid,username,role_id,isactive,customerimage,birthdate,gender FROM `tbl_registration` WHERE username="'+username+'" and password="'+password+'" and role_id=2', function (error, results, fields) {
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
  connection.query('SELECT id,firstname,lastname,email,phone,userguid,username,role_id,isactive,customerimage,birthdate,gender,send_otp,(select sum(qty) from tbl_cart where userguid=tbl_registration.userguid) as countcartitems FROM `tbl_registration` WHERE username="'+username+'" and password="'+password+'" and role_id=3', function (error, results, fields) {
    if (error) throw error;
    if(results.length)
    {
      const isactive = results[0].isactive;
      if(isactive == 1)
      {
        const user = { userguid : results[0].userguid}
        const accessToken = generateAccessToken(user)
        const refreshToken = generateRefreshToken(user);
        refreshTokens.push(refreshToken);
        
        connection.query('SELECT id FROM `tbl_cart` WHERE device_token="'+req.headers.device_token+'"', function (error, cartresults, fields) {
          if (error) throw error;
          if(cartresults.length)
          {
            connection.query('update tbl_cart set userguid="'+results[0].userguid+'" where device_token = "'+req.headers.device_token+'"', function (cartupdaterror, cartupdateresults, fields) {
              if (cartupdaterror) throw cartupdaterror;
              res.json({ Message:"success",results,accessToken : accessToken, refreshToken : refreshToken});
            });
          }
          else
          {
            res.json({ Message:"success",results,accessToken : accessToken, refreshToken : refreshToken});
          }
        });
      }
      else
      {
        var send_otp=results[0].send_otp;

        //Send SMS
        var tophone=results[0].phone;
        
        var SendMessage="HI, "+send_otp+" is Your Verification code(O.T.P) for activating account. Thank you for using THE DAILY MEAT. Please do not share OTP with anyone.";
        //var SendMessage="Your one time passcode for activate account is " +send_otp;
        //var SendMessage="Your one time passcode for activate account:0000";
        var SendUrl = SendSMSURL+"?mobile="+SMSusername+"&pass="+SMSpassword+"&senderid="+SMSsenderId+"&to="+tophone+"&msg="+SendMessage;
                        
        request(SendUrl, function (error, response) {
          //if (error) throw new Error(error);
        });

        // Send Email
          var toemail=results[0].email;

          var mailOptions = {
            from: fromemail,
            to: toemail,
            subject: 'Send OTP Mail',
            text: 'Verify your account.\n\n' +
            'Below is your one time passcode:\n\n' +
            send_otp + '\n\n' +
            'We are here to help if you need it.\n'
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

          res.json({ Message:"Please Verify Your Account.",results});
      }
      
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
        from: fromemail,
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

// Signup For Customer
app.post('/customer_signup', function (req, res) {
  // here in the req.file you will have the uploaded avatar file
  var params  = req.body;
  
  connection.query('select username from tbl_registration where username="'+params.username+'"', function (error, results, fields) {
    if(results.length == 0)
    {
        //console.log(req);
        params.registration_date= new Date();
        params.userguid=uuidv1();
        params.role_id=3;
        params.send_otp=Math.floor(1000 + Math.random() * 9000);
        //params.send_otp='0000';
        params.isactive = 0;
              
        connection.query('INSERT INTO `tbl_registration` SET ?', params, function (error, Insertresults, fields) {
          if (error) throw error;

          if(Insertresults.insertId > 0)
            {

              //Send SMS
              var SendMessage="HI, "+params.send_otp+" is Your Verification code(O.T.P) for activating account. Thank you for using THE DAILY MEAT. Please do not share OTP with anyone.";
              //var SendMessage="Your one time passcode for activate account is " +params.send_otp;
              var SendUrl = SendSMSURL+"?mobile="+SMSusername+"&pass="+SMSpassword+"&senderid="+SMSsenderId+"&to="+params.phone+"&msg="+SendMessage;
                              
              request(SendUrl, function (error, response) {
                //console.log(error);
              });

              //Send Email

              var mailOptions = {
                from: fromemail,
                to: results.email,
                subject: 'Send OTP Mail',
                text: 'Verify your account.\n\n' +
                'Below is your one time passcode:\n\n' +
                 params.send_otp + '\n\n' +
                'We are here to help if you need it.\n'
              };
              
              transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                }
              });

              res.json({ Message:"success",Insertresults});
            }
          else
          {
            return res.send({ Message: 'Something went wrong. !!!'})
          }
        });
    }
    else
    {
      return res.send({ Message: 'not_unique:login'})
    }
  });
});

// Verification For Customer
app.post('/verify_customer',(req,res) =>{
  //Authenticate user
  const username = req.body.username;
  const send_otp = req.body.send_otp;
  connection.query('SELECT id,firstname,lastname,email,phone,userguid,username,role_id,password,customerimage,(select sum(qty) from tbl_cart where userguid=tbl_registration.userguid) as countcartitems FROM `tbl_registration` WHERE username="'+username+'" and send_otp="'+send_otp+'" and role_id=3', function (error, results, fields) {
    if (error) throw error;
    if(results.length)
    {
      connection.query('update tbl_registration set isactive=1 where username="'+username+'"', function (error, results1, fields) {
        if (error) throw error;
        const user = { userguid : results[0].userguid}
        const accessToken = generateAccessToken(user)
        const refreshToken = generateRefreshToken(user);
        refreshTokens.push(refreshToken);

        connection.query('SELECT id FROM `tbl_cart` WHERE device_token="'+req.headers.device_token+'"', function (error, cartresults, fields) {
          if (error) throw error;
          if(cartresults.length)
          {
            connection.query('update tbl_cart set userguid="'+results[0].userguid+'" where device_token = "'+req.headers.device_token+'"', function (cartupdaterror, cartupdateresults, fields) {
              if (cartupdaterror) throw cartupdaterror;
              res.json({ Message:"success",results,accessToken : accessToken, refreshToken : refreshToken});
            });
          }
          else
          {
            res.json({ Message:"success",results,accessToken : accessToken, refreshToken : refreshToken});
          }
        });
        //res.json({ Message:"success",results,accessToken : accessToken, refreshToken : refreshToken});
      });
    }
    else
    {
      res.json({ Message:"Enter correct OTP. Please Try Again.",results});
    }
    
  });
  // res.json({ accessToken : accessToken, refreshToken : refreshToken});
});

// Reset Password For Customer
app.post('/customer_reset_password',(req,res) =>{
  //Authenticate user
  const username = req.body.username;
  connection.query('SELECT id,firstname,lastname,email,phone,userguid,username,role_id,customerimage FROM `tbl_registration` WHERE username="'+username+'" and role_id=3', function (error, results, fields) {
    if (error) throw error;
    if(results.length)
    {
      var tamppassword=Math.floor(10000000 + Math.random() * 90000000);
      connection.query('update tbl_registration set password="'+tamppassword+'" where username="'+username+'"', function (error, results1, fields) {
        
        //Send SMS
        var tophone=results[0].phone;
        var SendMessage="Your temporary password for login account is "+tamppassword+". Thank you for using THE DAILY MEAT. Please do not share your password with anyone.";
        //var SendMessage="Your temporary password for login account is " + tamppassword;
        //var SendMessage="Temporary password for login account is 0000";
        //var SendMessage="Your one time passcode for activate account:0000";
        var SendUrl = SendSMSURL+"?mobile="+SMSusername+"&pass="+SMSpassword+"&senderid="+SMSsenderId+"&to="+tophone+"&msg="+SendMessage;
                        
        request(SendUrl, function (error, response) {
          if (error) {
            res.json({ Message:"Something went Wrong!!!"});
          }
          else
          {
            res.json({ Message:"success",results});
          }
        });

        //Send Email
        // var mailOptions = {
        //   from: fromemail,
        //   to: results.email,
        //   subject: 'Password Recovery Mail',
        //   text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        //   'Please use temporary password, or change this into your mobile application to complete the process:\n\n' +
        //   'Temporary password is : ' + tamppassword + '\n\n' +
        //   'Do not share anyone.\n'
        // };
        
        // transporter.sendMail(mailOptions, function(error, info){
        //   if (error) {
        //     console.log(error);
        //   } else {
        //     console.log('Email sent: ' + info.response);
        //   }
        // });
        
        
      });
    }
    else
    {
      res.json({ Message:"missing_required_fields:username"});
    }
    
  });
  // res.json({ accessToken : accessToken, refreshToken : refreshToken});
});

// Reset Password For Deliverystaff
app.post('/deliverystaff_reset_password',(req,res) =>{
  //Authenticate user
  const username = req.body.username;
  connection.query('SELECT id,firstname,lastname,email,phone,userguid,username,role_id,customerimage FROM `tbl_registration` WHERE username="'+username+'" and role_id=2', function (error, results, fields) {
    if (error) throw error;
    if(results.length)
    {
      var tamppassword=Math.floor(10000000 + Math.random() * 90000000);
      connection.query('update tbl_registration set password="'+tamppassword+'" where username="'+username+'"', function (error, results1, fields) {
        
        //Send SMS
        var tophone=results[0].phone;
        var SendMessage="Your temporary password for login account is "+tamppassword+". Thank you for using THE DAILY MEAT. Please do not share your password with anyone.";
        //var SendMessage="Your temporary password for login account is " + tamppassword;
        //var SendMessage="Temporary password for login account is 0000";
        //var SendMessage="Your one time passcode for activate account:0000";
        var SendUrl = SendSMSURL+"?mobile="+SMSusername+"&pass="+SMSpassword+"&senderid="+SMSsenderId+"&to="+tophone+"&msg="+SendMessage;
                        
        request(SendUrl, function (error, response) {
          if (error) {
            res.json({ Message:"Something went Wrong!!!"});
          }
          else
          {
            res.json({ Message:"success",results});
          }
        });

        // var mailOptions = {
        //   from: fromemail,
        //   to: results.email,
        //   subject: 'Password Recovery Mail',
        //   text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        //   'Please use temporary password, or change this into your mobile application to complete the process:\n\n' +
        //   'Temporary password is : ' + tamppassword + '\n\n' +
        //   'Do not share anyone.\n'
        // };
        
        // transporter.sendMail(mailOptions, function(error, info){
        //   if (error) {
        //     console.log(error);
        //   } else {
        //     console.log('Email sent: ' + info.response);
        //   }
        // });
        
        // res.json({ Message:"success",results});
      });
    }
    else
    {
      res.json({ Message:"missing_required_fields:username"});
    }
    
  });
  // res.json({ accessToken : accessToken, refreshToken : refreshToken});
});

//rest api to update a New Change Password data
app.post('/NewChangePassword', function (req, res) {
  var params  = req.body;
  connection.query('select id from tbl_registration where password="'+params.oldpassword+'"', function (error, results, fields) {
    if(results.length > 0)
    {
      connection.query('UPDATE `tbl_registration` SET `password`=? where `password`=?', [params.newpassword, params.oldpassword], function (error, results, fields) {
        if (error) throw error;
          res.json({ Message:"success"});
        });
    }
    else
    {
      res.json({ Message:"Temporary Password is not match."});
    }
  });
});

module.exports = app;