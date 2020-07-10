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
      res.json({ Message:"success",results});
    });
});

//rest api to get a tbl_product data by category
app.post('/productlistbycategory', function (req, res) {
  var sql = "SELECT *,(select qty from tbl_cart where userguid='"+req.body.customerguid+"' and pid=tbl_product.id) as itemqty from tbl_product where category='"+req.body.cat+"' and isactive=1 order by sortorder asc";
  connection.query(sql, function (error, results, fields) {
      if (error) throw error;
      res.json({ Message:"success",results});
    });
});

//rest api to get a single tbl_product data
app.post('/productdetail', function (req, res) {
  connection.query('select *,(select qty from tbl_cart where userguid="'+req.body.customerguid+'" and pid=tbl_product.id) as itemqty from tbl_product where id=?', [req.body.id], function (error, results, fields) {
      if (error) throw error;
      res.json({ Message:"success",results});
    });
});

//rest api to get new arival product
app.get('/newarrivalproduct', function (req, res) {
  connection.query('select * from tbl_product where isactive=1 and isnewarrival=1 ORDER BY id desc limit 2', function (error, results, fields) {
      if (error) throw error;
      if(results.length > 0)
      {
        res.json({ Message:"success",results});
      }
      else
      {
        res.json({ Message:"error",results});
      }
    });
});
  
  module.exports = app;