const express = require('express');
const app = express();
var connection = require('../config/db');
const { v1: uuidv1 } = require('uuid');

  
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

    var sql = "SELECT tbl_cart.id,tbl_cart.pid,tbl_cart.qty, tbl_product.productname AS productname, tbl_product.productimage AS productimage, tbl_product.price as unitprice,(tbl_product.price*tbl_cart.qty) as pprice FROM tbl_cart JOIN tbl_product ON tbl_cart.pid = tbl_product.id where qty > 0 and userguid='"+req.headers.customerguid+"' and tbl_product.isactive=1 and tbl_product.id IN (select pid from tbl_location_stock where instock=1 and pid=tbl_product.id and location='"+req.headers.location+"')";
    
    connection.query(sql, function (error, results, fields) {
         if (error) throw error;
         res.json({ Message:"success",results});
       });
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

  //rest api to get all cart Count by userguid
  app.get('/getcartcount', function (req, res) {

    var sql = "SELECT sum(qty) as totalcartcount FROM tbl_cart JOIN tbl_product ON tbl_cart.pid = tbl_product.id where qty > 0 and userguid='"+req.headers.customerguid+"' and tbl_product.isactive=1 and tbl_product.id IN (select pid from tbl_location_stock where instock=1 and pid=tbl_product.id and location='"+req.headers.location+"')";
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

  //rest api to Place Order data
  app.post('/placeorder', function (req, res) {
    var params  = req.body;
    var sql = "SELECT tbl_cart.id,sum(tbl_product.price*tbl_cart.qty) as subtotal FROM tbl_cart JOIN tbl_product ON tbl_cart.pid = tbl_product.id where qty > 0 and userguid='"+req.headers.customerguid+"' and tbl_product.isactive=1 and tbl_product.id IN (select pid from tbl_location_stock where instock=1 and pid=tbl_product.id and location='"+req.headers.location+"')";
    connection.query(sql, function (error, results, fields) {
      if (error) throw error;
      if(results.length == 0)
      {
        res.json({ Message:"error",error_message:"There are no items into cart. Please Try Again."});
      }
      else
      {
        connection.query('select id,addresstype,bfirstname,blastname,bphone,door_no_build_no_street,locality,landmark,bcity,bzipcode,isdefault,latitude,longitude from tbl_manage_address where userguid="'+req.headers.customerguid+'" and id="'+req.body.addressid+'"', function (error, addressresults, fields) {
          if (error) throw error;
          if(addressresults.length > 0)
          {
            var orderstatus = 0;
            if (req.body.paymenttype ==1)
            {
              orderstatus = 1;
            }
            var subtotal=results[0].subtotal;
            var deliverycharge=0;
            var ordertotal=(subtotal - 0) + (deliverycharge - 0);
            var orderguid=uuidv1();

            var newparams={
              "addresstype":addressresults[0].addresstype,
              "firstname":addressresults[0].bfirstname,
              "lastname":addressresults[0].blastname,
              "phone":addressresults[0].bphone,
              "email":'',
              "door_no_build_no_street":addressresults[0].door_no_build_no_street,
              "locality":addressresults[0].locality,
              "landmark":addressresults[0].landmark,
              "city":addressresults[0].bcity,
              "zipcode":addressresults[0].bzipcode,
              "latitude":addressresults[0].latitude,
              "longitude":addressresults[0].longitude,
              "orderguid":orderguid,
              "ordertotal":ordertotal,
              "userguid":req.headers.customerguid,
              "subtotal":subtotal,
              "paymenttype":req.body.paymenttype,
              "grandtotal":ordertotal,
              "deliverycharge":deliverycharge,
              "orderstatus":orderstatus,
              "orderdate": new Date()
            }
            
            // For Insert Order
            connection.query('INSERT INTO `tbl_order` SET ?', newparams, function (error, Insertresults, fields) {
              if (error) throw error;
              // For Insert Order Items
              if(Insertresults.insertId > 0)
              {
                var orderitemsql ="insert into tbl_orderitem(pid,productname,pieces,net_weight,productimage,orderguid,qty,pprice,unitprice,mainprice) select pid,(select productname from tbl_product where id=tbl_cart.pid) as productname,(select pieces from tbl_product where id=tbl_cart.pid) as pieces,(select net_weight from tbl_product where id=tbl_cart.pid) as net_weight,(select productimage from tbl_product where id=tbl_cart.pid) as productimage,'"+orderguid+"',qty,((select price from tbl_product where id=tbl_cart.pid)*qty) as pprice,(select price from tbl_product where id=tbl_cart.pid) as unitprice,(select price from tbl_product where id=tbl_cart.pid) as mainprice from tbl_cart where userguid='"+req.headers.customerguid+"'";
                connection.query(orderitemsql, function (error, InsertItemresults, fields) {
                    if (error) throw error;
                    // For Delete Cart
                    connection.query('DELETE FROM tbl_cart WHERE userguid="'+req.headers.customerguid+'"', function (error, results, fields) {
                      if (error) throw error;
                      res.json({ Message:"success",orderguid:orderguid});
                    });
                });
              }
              else
              {
                connection.query('DELETE FROM tbl_order WHERE id="'+Insertresults.insertId+'"', function (error, results, fields) {
                  if (error) throw error;
                  res.json({ Message:"error",error_message:"Something went wrong. Please try again."});
                });
              }
              
            });
          }
          else
          {
            res.json({ Message:"error",error_message:"Please select atleast one address."});
          }
        });
        
      }
    });
  });

  //rest api to get all orders Customer Wise
  app.get('/orderbyuserguid', function (req, res) {
    var callbackCounter = 0;
    connection.query('select * from tbl_order where userguid="'+req.headers.customerguid+'"', function (error, results, fields) {
        if (error) throw error;
        let orders = [];
        results.forEach(element => { 
          connection.query('select * from tbl_orderitem where orderguid="'+element.orderguid+'"', function (error, itemresults, fields) {
            if (error) throw error;
            element.orderitems = [];
            itemresults.forEach(newelement => {
              element.orderitems.push(newelement);
            });
            orders.push(element);
            callbackCounter++;
            if(results.length == callbackCounter)
            {
              res.send({Message:"success",orders});
            }
          });
        });
     });
  });


  //rest api to Re-Order.
  app.post('/reorder', function (req, res) {
    var callbackCounter = 0;
    var productresultsCounter = 0;
    connection.query('select pid,qty from tbl_orderitem where orderguid="'+req.body.orderguid+'"', function (error, results, fields) {
        if (error) throw error;
        if(results.length > 0)
        {
          results.forEach(element => { 
            connection.query('select * from tbl_product where id="'+element.pid+'" and id IN (select pid from tbl_location_stock where instock=1 and pid="'+element.pid+'" and location="'+req.headers.location+'")', function (error, productresults, fields) {
              if (error) throw error;
              if(productresults.length > 0)
              {
                productresultsCounter++;
                connection.query('select id,qty from tbl_cart where pid="'+productresults[0].id+'" and userguid="'+req.headers.customerguid+'"', function (error, cartitemresults, fields) {
                  if(cartitemresults.length == 0)
                  {
                    connection.query('INSERT INTO `tbl_cart` SET `pid`=?,`userguid`=?,`qty`=?', [productresults[0].id, req.headers.customerguid, element.qty], function (error, Insertresults, fields) {
                      if (error) throw error;
                    });
                  }
                  else
                  {
                    old_qty=cartitemresults[0].qty;
                    new_qty=(old_qty - 0) + (element.qty - 0);
            
                    if(new_qty > 0)
                    {
                      connection.query('update tbl_cart set qty='+new_qty+' where id = "'+cartitemresults[0].id+'"', function (error, cartupdateresults, fields) {
                        if (error) throw error;
                      });
                    }
                    else
                    {
                      connection.query('DELETE FROM tbl_cart WHERE id = "'+cartitemresults[0].id+'"', function (error, deletecartresults, fields) {
                        if (error) throw error;
                      });
                    }
                  }
                });
              }
              callbackCounter++;
              if(results.length == callbackCounter)
              {
                if(productresultsCounter > 0)
                {
                   res.send({Message:"success"});
                }
                else
                {
                  res.send({Message:"Some of reason you can't reorder this items."});
                }
              }
            });
          });
        }
        else
        {
          res.send({Message:"No Items in this Order."});
        }
     });
  });

  
  module.exports = app;