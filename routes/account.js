const express = require('express');
const app = express();
var connection = require('../config/db');

  
  //rest api to get a login customer data
  app.post('/userdetail', function (req, res) {
    connection.query('select id,firstname,lastname,email,phone,userguid,username,role_id,isactive from tbl_registration where username="'+req.body.username+'" and role_id=3', function (error, results, fields) {
      if (error) throw error;
      res.send(results);
    });
  });
  
  module.exports = app;