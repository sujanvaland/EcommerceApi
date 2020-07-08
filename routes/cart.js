const express = require('express');
const app = express();
var connection = require('../config/db');

  
  //rest api to add cart data
  app.post('/addtocart', function (req, res) {
    var params  = req.body;
    connection.query('select id,qty from tbl_cart where pid="'+params.pid+'" and userguid="'+req.headers.customerguid+'"', function (error, results, fields) {
      if(results.length == 0)
      {
        params.userguid=req.headers.customerguid;
        connection.query('INSERT INTO `tbl_cart` SET `pid`=?,`userguid`=?,`qty`=?', [params.pid, params.userguid, params.qty], function (error, Insertresults, fields) {
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

    var sql = "SELECT tbl_cart.id,tbl_cart.pid,tbl_cart.qty, tbl_product.productname AS productname, tbl_product.productimage AS productimage, tbl_product.price as unitprice,(tbl_product.price*tbl_cart.qty) as pprice FROM tbl_cart JOIN tbl_product ON tbl_cart.pid = tbl_product.id where qty > 0 and userguid='"+req.headers.customerguid+"' and tbl_product.isactive=1 and tbl_product.instock=1";
    
    connection.query(sql, function (error, results, fields) {
         if (error) throw error;
         res.json({ Message:"success",results});
       });

    // connection.query('select id,pid,qty,(select productname from tbl_product where id=tbl_cart.pid) as productname,(select price from tbl_product where id=tbl_cart.pid) as unitprice,((select price from tbl_product where id=tbl_cart.pid)*qty) as pprice,(select isactive from tbl_product where id=tbl_cart.pid) as isactive,(select instock from tbl_product where id=tbl_cart.pid) as instock from tbl_cart where userguid="'+req.headers.customerguid+'" and tbl_product.isactive=1', function (error, results, fields) {
    //    if (error) throw error;
    //    res.json({ Message:"success",results});
    //  });
  });

  //rest api to get all cart item by userguid
  app.post('/getproductitemcount', function (req, res) {
    var sql = "SELECT qty from tbl_cart where userguid='"+req.headers.customerguid+"' and pid='"+req.body.pid+"'";
    connection.query(sql, function (error, results, fields) {
         if (error) throw error;
         if(results.length == 0)
         {
           results=[{ 'qty' : 0 }];
         }
        res.json({ Message:"success",results});
         
    });
  });

  
  module.exports = app;