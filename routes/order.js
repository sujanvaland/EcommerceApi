const express = require('express');
const app = express();
var connection = require('../config/db');

  //rest api to get all orders
  app.get('/order', function (req, res) {
    connection.query('select * from tbl_order', function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });
  
  app.get('/GetAllOrders', function (req, res) {
    connection.query('select id,firstname,lastname,email,phone,orderguid from tbl_order', function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });

  //rest api to get filter order
  app.get('/GetAllOrders/:name', function (req, res) {
    connection.query('select id,firstname,lastname,email,phone,orderguid from tbl_order where (firstname like "%'+req.params.name+'%" or lastname like "%'+req.params.name+'%")', function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });

  //rest api to get a login order data
  app.post('/GetOrderInfo', function (req, res) {
    connection.query('select id,firstname,lastname,email,phone,orderguid from tbl_order where orderguid="'+req.body.orderguid+'"', function (error, results, fields) {
      if (error) throw error;
      res.send(results);
    });
  });

  //rest api to get a single tbl_order data
  app.get('/order/:id', function (req, res) {
    connection.query('select * from tbl_order where id=?', [req.params.id], function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });
  
  //rest api to update record into mysql database
  app.post('/UpdateOrderInfo', function (req, res) {
    connection.query('UPDATE `tbl_order` SET `firstname`=?,`lastname`=?,`email`=?,`phone`=? where `orderguid`=?', [req.body.firstname,req.body.lastname, req.body.email, req.body.phone, req.body.orderguid], function (error, results, fields) {
     if (error) throw error;
       res.send({Message:"success",results});
     });
  });
  
  //rest api to delete record from mysql database
  app.delete('/order', function (req, res) {
    connection.query('DELETE FROM `tbl_order` WHERE `id`=?', [req.body.id], function (error, results, fields) {
     if (error) throw error;
       res.send('Record has been deleted!');
     });
  });
  
  module.exports = app;