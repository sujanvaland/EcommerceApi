const express = require('express');
const app = express();
var connection = require('../config/db');
var slug = require('slug')
var multer  = require('multer')
const path = require('path');
const fs = require('fs')
var sizeOf = require('image-size');


//rest api to get a single tbl_categorymaster data
app.post('/cmsdetail', function (req, res) {
  connection.query('select * from tbl_cms where id=?', [req.body.id], function (error, results, fields) {
      if (error) throw error;
      res.json({ Message:"success",results});
    });
});
  
  module.exports = app;