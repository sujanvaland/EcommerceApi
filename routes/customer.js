const express = require('express');
const logger = require('../logger/logger');
const jwt = require('jsonwebtoken');
const app = express();
var connection = require('../config/db');

  //rest api to get all customers
  app.get('/customer', function (req, res) {
    connection.query('select * from tbl_registration', function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });

  //rest api to get a single tbl_registration data
  app.post('/GetCustomerInfo/:CustomerGuid', function (req, res) {
    connection.query('select id,firstname,lastname,email,phone,userguid from tbl_registration where userguid=?', [req.params.CustomerGuid], function (error, results, fields) {
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
  app.post('/updatecustomer', function (req, res) {
    connection.query('UPDATE `tbl_registration` SET `firstname`=?,`lastname`=?,`email`=?,`phone`=? where `id`=?', [req.body.firstname,req.body.lastname, req.body.email, req.body.phone, req.body.id], function (error, results, fields) {
     if (error) throw error;
       res.send(results);
     });
  });
  
  //rest api to delete record from mysql database
  app.delete('/customer', function (req, res) {
    connection.query('DELETE FROM `tbl_registration` WHERE `id`=?', [req.body.id], function (error, results, fields) {
     if (error) throw error;
       res.send('Record has been deleted!');
     });
  });
  
  module.exports = app;