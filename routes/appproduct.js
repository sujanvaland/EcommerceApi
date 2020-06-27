const express = require('express');
const app = express();
var connection = require('../config/db');
var slug = require('slug')
var multer  = require('multer')
const path = require('path');
const fs = require('fs')
var sizeOf = require('image-size');


//rest api to get all product
app.get('/product', function (req, res) {
  connection.query('select * from tbl_product where isactive=1 order by sortorder asc', function (error, results, fields) {
      if (error) throw error;
      res.send(results);
    });
});

//rest api to get a tbl_product data by category
app.post('/productlistbycategory', function (req, res) {
  connection.query('select * from tbl_product where category="'+req.body.cat+'" and isactive=1 order by sortorder asc', function (error, results, fields) {
      if (error) throw error;
      res.send(results);
    });
});

//rest api to get a single tbl_product data
app.post('/productdetail', function (req, res) {
  connection.query('select * from tbl_product where id=?', [req.body.id], function (error, results, fields) {
      if (error) throw error;
      res.send(results);
    });
});
  
  module.exports = app;