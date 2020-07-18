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
      res.json({ Message:"success",results});
    });
});

//rest api to get a single tbl_categorymaster data
app.post('/categorydetail', function (req, res) {
  connection.query('select * from tbl_categorymaster where id=?', [req.body.id], function (error, results, fields) {
      if (error) throw error;
      res.json({ Message:"success",results});
    });
});

//rest api to get all location
app.get('/location', function (req, res) {
  connection.query('select * from tbl_city_master where isactive=1 order by city asc', function (error, results, fields) {
      if (error) throw error;
      res.json({ Message:"success",results});
    });
});
  
  module.exports = app;