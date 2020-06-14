const express = require('express');
const logger = require('../logger/logger');
const jwt = require('jsonwebtoken');
const app = express();
var connection = require('../config/db');

  //rest api to get all customers
  app.get('/customer', function (req, res) {
    connection.query('select * from customer', function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });

  //rest api to get a single customer data
  app.get('/customer/:id', function (req, res) {
    connection.query('select * from customer where Id=?', [req.params.id], function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });
  
  //rest api to create a new customer record into mysql database
  app.post('/customer', function (req, res) {
    var params  = req.body;
    connection.query('INSERT INTO customer SET ?', params, function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });
  
  //rest api to update record into mysql database
  app.post('/updatecustomer', function (req, res) {
    connection.query('UPDATE `customer` SET `Name`=?,`Address`=?,`Country`=?,`Phone`=? where `Id`=?', [req.body.Name,req.body.Address, req.body.Country, req.body.Phone, req.body.Id], function (error, results, fields) {
     if (error) throw error;
       res.send(results);
     });
  });
  
  //rest api to delete record from mysql database
  app.delete('/customer', function (req, res) {
    connection.query('DELETE FROM `customer` WHERE `Id`=?', [req.body.Id], function (error, results, fields) {
     if (error) throw error;
       res.send('Record has been deleted!');
     });
  });
  
  module.exports = app;