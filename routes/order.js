const express = require('express');
const app = express();
var connection = require('../config/db');

  //rest api to get all orders
  app.get('/order', function (req, res) {
    var callbackCounter = 0;
    connection.query('select *,(select CONCAT(firstname," ",lastname) from tbl_registration where userguid=tbl_order.staff_id) as staffname from tbl_order', function (error, results, fields) {
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
              res.send(orders);
            }
          });
        });
     });
  });
  
  app.get('/GetAllOrders', function (req, res) {
    var callbackCounter = 0;
    connection.query('select *,(select CONCAT(firstname," ",lastname) from tbl_registration where userguid=tbl_order.staff_id) as staffname from tbl_order', function (error, results, fields) {
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
              res.send(orders);
            }
          });
        });
     });
  });

  //rest api to get filter order
  app.get('/GetAllOrders/:name', function (req, res) {
     var callbackCounter = 0;
     connection.query('select *,(select CONCAT(firstname," ",lastname) from tbl_registration where userguid=tbl_order.staff_id) as staffname from tbl_order where (firstname like "%'+req.params.name+'%" or lastname like "%'+req.params.name+'%")', function (error, results, fields) {
         if (error) throw error;
         if(results.length > 0)
         {
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
                res.send(orders);
              }
            });
          });
         }
         else
         {
          res.send(results);
         }
      });
  });

  //rest api to get a login order data
  app.post('/GetOrderInfo', function (req, res) {
    var callbackCounter = 0;
    connection.query('select *,(select CONCAT(firstname," ",lastname) from tbl_registration where userguid=tbl_order.staff_id) as staffname from tbl_order where orderguid="'+req.body.orderguid+'"', function (error, results, fields) {
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
              res.send(orders);
            }
          });
        });
     });
  });

  //rest api to get a single tbl_order data
  app.get('/order/:id', function (req, res) {
     var callbackCounter = 0;
     connection.query('select *,(select CONCAT(firstname," ",lastname) from tbl_registration where userguid=tbl_order.staff_id) as staffname from tbl_order where id="'+req.params.id+'"', function (error, results, fields) {
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
               res.send(orders);
             }
           });
         });
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

  //rest api to update order status into mysql database
  app.post('/ChangeStatus', function (req, res) {
      if(req.body.orderstatus==6)
      {
        connection.query('select staff_id from tbl_order where orderguid="'+req.body.orderguid+'"', function (error, orderresults, fields) {
          if (error) throw error;
          if(orderresults.length > 0)
          {
            connection.query('select userguid,assignorder from tbl_registration where isactive=1 and role_id=2 and userguid="'+orderresults[0].staff_id+'"', function (error, results, fields) {
              if (error) throw error;
              if(results.length > 0)
              {
                var oldassignorder=results[0].assignorder;
                var newone=1;
                var assignorder=0;
                if(oldassignorder > 0)
                {
                  assignorder=(oldassignorder - 0) - (newone - 0);
                }
                
                connection.query('UPDATE `tbl_registration` SET `assignorder`=? where `userguid`=?', [assignorder, orderresults[0].staff_id], function (error, results, fields) {
                  if (error) throw error;
                  connection.query('UPDATE `tbl_order` SET `orderstatus`=?,`staff_id`=? where `orderguid`=?', [req.body.orderstatus,null, req.body.orderguid], function (error, results, fields) {
                    if (error) throw error;
                    res.send({Message:"success"});
                  });
                });
              }
              else
              {
                connection.query('UPDATE `tbl_order` SET `orderstatus`=? where `orderguid`=?', [req.body.orderstatus, req.body.orderguid], function (error, results, fields) {
                  if (error) throw error;
                  res.send({Message:"success"});
                });
              }
            });
          }
          else
          {
            connection.query('UPDATE `tbl_order` SET `orderstatus`=? where `orderguid`=?', [req.body.orderstatus, req.body.orderguid], function (error, results, fields) {
              if (error) throw error;
              res.send({Message:"success"});
            });
          }
        });
      }
      else
      {
        connection.query('UPDATE `tbl_order` SET `orderstatus`=? where `orderguid`=?', [req.body.orderstatus, req.body.orderguid], function (error, results, fields) {
          if (error) throw error;
          res.send({Message:"success"});
        });
      }
  });

  //rest api to get all active staff into mysql database
  app.get('/GetAllActiveStaff', function (req, res) {
    connection.query('select firstname,lastname,userguid,assignorder from tbl_registration where isactive=1 and role_id=2 and onride=0 and assignorder < 2', function (error, results, fields) {
        if (error) throw error;
        res.send(results);
     });
  });

  //rest api to assign staff to order into mysql database
  app.post('/AssignStaff', function (req, res) {
    connection.query('select userguid,assignorder from tbl_registration where isactive=1 and role_id=2 and onride=0 and assignorder < 2 and userguid="'+req.body.staff_id+'"', function (error, results, fields) {
        if (error) throw error;
        if(results.length > 0)
        {
          connection.query('UPDATE `tbl_order` SET `staff_id`=? where `orderguid`=?', [req.body.staff_id, req.body.orderguid], function (error, orderresults, fields) {
            if (error) throw error;
              var oldassignorder=results[0].assignorder;
              var newone=1;
              var assignorder=(oldassignorder - 0) + (newone - 0);
              connection.query('UPDATE `tbl_registration` SET `assignorder`=? where `userguid`=?', [assignorder, req.body.staff_id], function (error, results, fields) {
                if (error) throw error;
                  res.send({Message:"success",results});
                });
            });
        }
        else
        {
          res.send({Message:"error"});
        }
    });
    
  });
  
  module.exports = app;