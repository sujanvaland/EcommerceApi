const express = require('express');
const app = express();
var connection = require('../config/db');
var slug = require('slug')
var multer  = require('multer')
const path = require('path');
const fs = require('fs')
var sizeOf = require('image-size');



//rest api to add cart data
app.post('/addtocart', function (req, res) {
  var params  = req.body;
  connection.query('select id,qty from tbl_cart where pid="'+params.pid+'" and device_token="'+req.headers.device_token+'"', function (error, results, fields) {
    if(results.length == 0)
    {
      params.userguid='';
      if(req.headers.customerguid!=undefined && req.headers.customerguid!='' && req.headers.customerguid!=null && req.headers.customerguid!='undefined')
      {
        params.userguid=req.headers.customerguid;
      }
      params.device_token=req.headers.device_token;
      connection.query('INSERT INTO `tbl_cart` SET `pid`=?,`userguid`=?,`device_token`=?,`qty`=?', [params.pid, params.userguid, params.device_token, params.qty], function (error, Insertresults, fields) {
        if (error) throw error;
        res.json({ Message:"success",Insertresults});
      });
    }
    else
    {
      old_qty=results[0].qty;
      if(params.mode=="remove")
      {
        new_qty=0;
        if(old_qty > 0)
        {
          new_qty=(old_qty - 0) - (params.qty - 0);
        }
        
      }
      else
      {
        new_qty=(old_qty - 0) + (params.qty - 0);
      }

      if(new_qty > 0)
      {
        connection.query('update tbl_cart set qty='+new_qty+' where id = "'+results[0].id+'"', function (error, results, fields) {
          if (error) throw error;
          res.json({ Message:"success",results});
        });
      }
      else
      {
        connection.query('DELETE FROM tbl_cart WHERE id = "'+results[0].id+'"', function (error, results, fields) {
          if (error) throw error;
          res.json({ Message:"success",results});
        });
      }
    }
  });
});

//rest api to get all cart item by userguid
app.get('/getcartitems', function (req, res) {

  var sql = "SELECT tbl_cart.id,tbl_cart.pid,tbl_cart.qty, tbl_product.productname AS productname, tbl_product.productimage AS productimage, tbl_product.price as unitprice,(tbl_product.price*tbl_cart.qty) as pprice FROM tbl_cart JOIN tbl_product ON tbl_cart.pid = tbl_product.id where qty > 0 and device_token='"+req.headers.device_token+"' and tbl_product.isactive=1 and tbl_product.id IN (select pid from tbl_location_stock where instock=1 and pid=tbl_product.id and location='"+req.headers.location+"')";
  
  connection.query(sql, function (error, results, fields) {
       if (error) throw error;
       res.json({ Message:"success",results});
     });
});

//rest api to get all cart Count by userguid
app.get('/getcartcount', function (req, res) {

  var sql = "SELECT sum(qty) as totalcartcount FROM tbl_cart JOIN tbl_product ON tbl_cart.pid = tbl_product.id where qty > 0 and device_token='"+req.headers.device_token+"' and tbl_product.isactive=1 and tbl_product.id IN (select pid from tbl_location_stock where instock=1 and pid=tbl_product.id and location='"+req.headers.location+"')";
  connection.query(sql, function (error, results, fields) {
       if (error) throw error;

       var totalcartcount=0;
       if(results[0].totalcartcount > 0)
       {
        totalcartcount=results[0].totalcartcount;
       }
       res.json({ Message:"success",totalcartcount:totalcartcount});
     });
});
  
  module.exports = app;