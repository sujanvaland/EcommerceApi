const express = require('express');
const logger = require('../logger/logger');
const jwt = require('jsonwebtoken');
const app = express();
var connection = require('../config/db');
const bcrypt = require("bcrypt");
const saltRounds = 10;

  //rest api to get all customers
  app.get('/customer', function (req, res) {
    connection.query('select * from tbl_registration', function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });

  //rest api to get a login customer data
  app.get('/GetLoginCustomerInfo', function (req, res) {
    connection.query('select id,firstname,lastname,email,phone,userguid,username,role_id from tbl_registration where userguid=?', [req.headers.customerguid], function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });

  //rest api to get a single tbl_registration data
  app.get('/customer/:id', function (req, res) {
    connection.query('select * from tbl_registration where id=?', [req.params.id], function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });
  
  //rest api to update record into mysql database
  app.post('/UpdateCustomerInfo', function (req, res) {
    connection.query('UPDATE `tbl_registration` SET `firstname`=?,`lastname`=?,`email`=?,`phone`=? where `userguid`=?', [req.body.FirstName,req.body.LastName, req.body.Email, req.body.Phone, req.headers.customerguid], function (error, results, fields) {
     if (error) throw error;
       res.send({Message:"success",results});
     });
  });
  
  //rest api to delete record from mysql database
  app.delete('/customer', function (req, res) {
    connection.query('DELETE FROM `tbl_registration` WHERE `id`=?', [req.body.id], function (error, results, fields) {
     if (error) throw error;
       res.send('Record has been deleted!');
     });
  });

  //rest api to get a login customer data
  app.post('/ChangePassword', function (req, res) {
    var params  = req.body;
    connection.query('select password from tbl_registration where userguid="'+req.headers.customerguid+'"', function (error, results, fields) {
      if (error) throw error;
      if(results.length)
       {
          var oldhash=results[0].password;
          bcrypt.compare(params.OldPassword, oldhash, function(err, result) {
            // result == true
            if(result)
            {
              connection.query('select id from tbl_registration where userguid="'+req.headers.customerguid+'" and password="'+oldhash+'"', function (error, results, fields) {
                if (error) throw error;
                if(results.length)
                  {
                    bcrypt.hash(params.NewPassword, saltRounds, function(err, hash) {
                      // Store hash in your password DB.
                      connection.query('update tbl_registration set password="'+hash+'" where userguid="'+req.headers.customerguid+'"', function (error, results, fields) {
                        if (error) throw error;
                        res.json({ Message:"success"});
                      });
                    });
                    
                  }
                  else
                  {
                    res.json({ Message:"Old password is wrong!."});
                  }
              });
            }
            else
            {
              res.json({ Message:"Old password is wrong!."});
            }
          
          });
       }
    });
  });
  
  module.exports = app;