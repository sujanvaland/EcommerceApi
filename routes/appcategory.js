const express = require('express');
const app = express();
var connection = require('../config/db');
var slug = require('slug')
var multer  = require('multer')
const path = require('path');
const fs = require('fs')
var sizeOf = require('image-size');


//rest api to get all category
app.get('/category', function (req, res) {
  connection.query('select * from tbl_categorymaster where isactive=1 order by sortorder asc', function (error, results, fields) {
      if (error) throw error;
      res.send(results);
    });
});

//rest api to get a single tbl_categorymaster data
app.post('/categorydetail', function (req, res) {
  connection.query('select * from tbl_categorymaster where id=?', [req.body.id], function (error, results, fields) {
      if (error) throw error;
      res.send(results);
    });
});
  
  module.exports = app;