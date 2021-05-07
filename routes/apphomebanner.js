const express = require('express');
const app = express();
var connection = require('../config/db');
var slug = require('slug')
var multer  = require('multer')
const path = require('path');
const fs = require('fs')
var sizeOf = require('image-size');


//rest api to get all homebanner
app.get('/homebanner', function (req, res) {
  connection.query('select * from tbl_homebanner where isactive=1 order by sortorder asc', function (error, results, fields) {
      if (error) throw error;
      res.json({ Message:"success",results});
    });
});
  
module.exports = app;