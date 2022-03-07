const express = require('express');
const app = express();
var connection = require('../config/db');

  app.get('/SalesOrderreport', function (req, res) {
    var callbackCounter = 0;
    connection.query('select *,(select CONCAT(firstname," ",lastname) from tbl_registration where userguid=tbl_order.staff_id) as staffname from tbl_order order by id desc', function (error, results, fields) {
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
  app.get('/SalesOrderreport/:name', function (req, res) {
     var callbackCounter = 0;
     connection.query('select *,(select CONCAT(firstname," ",lastname) from tbl_registration where userguid=tbl_order.staff_id) as staffname from tbl_order where (firstname like "%'+req.params.name+'%" or lastname like "%'+req.params.name+'%") order by id desc', function (error, results, fields) {
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

  //rest api to get a filter order data
  app.post('/GetAllFilterOrders', function (req, res) {
    var callbackCounter = 0;
    var filterbyname="";
    if(req.body.name !='' && req.body.name !=null)
    {
       filterbyname='and (firstname like "%'+req.body.name+'%" or lastname like "%'+req.body.name+'%")';
    }

    var filterbydaterange="";
    if(req.body.startdate !='' && req.body.enddate !='')
    {
      filterbydaterange='and DATE(orderdate) >= "'+req.body.startdate+'" and DATE(orderdate) <= "'+req.body.enddate+'"';
    }

    var filterorderstatus="";
    if(req.body.orderstatus !='' && req.body.orderstatus !=null)
    {
      filterorderstatus='and orderstatus= "'+req.body.orderstatus+'"';
    }

    var filtercity="";
    if(req.body.city !='' && req.body.city !=null)
    {
      searchcity="";
      if(req.body.city=="1")
      {
         searchcity="Vadodara";
      }

      if(req.body.city=="2")
      {
         searchcity="Ahmedabad";
      }

      filtercity='and city like "%'+searchcity+'%"';
    }

    var filterpaymenttype="";
    if(req.body.paymenttype !='' && req.body.paymenttype !=null)
    {
      filterpaymenttype='and paymenttype = "'+req.body.paymenttype+'"';
    }

    console.log(filtercity);

    connection.query('select *,(select CONCAT(firstname," ",lastname) from tbl_registration where userguid=tbl_order.staff_id) as staffname from tbl_order where id!="" '+filterbyname+' '+filterbydaterange+' '+filterorderstatus+' '+filtercity+' '+filterpaymenttype+' order by id desc', function (error, results, fields) {
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

  module.exports = app;