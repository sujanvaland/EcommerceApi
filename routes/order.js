const express = require('express');
const app = express();
var connection = require('../config/db');
var request = require('request');
var PushNotificationURL='https://fcm.googleapis.com/fcm/send';
var AuthorizationKey='key=AAAAs35jvRM:APA91bHZN45AahBEKrYzlKkyJ7N87xuDyaB1aqyWPm5uMQlgmwEgDRTCops8Bk7MQyHBHWc_qTNFCAXbOaewCMSn1zZymDkQyFT7_AyGnzCek6hN8169AcPRTMKvWzOHwOzZKT7GFDul';
var SenderId='770919611667';

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

    connection.query('select *,(select CONCAT(firstname," ",lastname) from tbl_registration where userguid=tbl_order.staff_id) as staffname from tbl_order where id!="" '+filterbyname+' '+filterbydaterange+' '+filterorderstatus+' ', function (error, results, fields) {
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
                    var changedate= new Date();
                    connection.query('INSERT INTO `tbl_orderstatus_log` SET `orderstatus`=?,`orderguid`=?,`userguid`=?,`changedate`=?', [req.body.orderstatus, req.body.orderguid, req.headers.customerguid, changedate], function (error, Insertresults, fields) {
                      if (error) throw error;
                      res.send({Message:"success"});
                    });
                  });
                });
              }
              else
              {
                connection.query('UPDATE `tbl_order` SET `orderstatus`=? where `orderguid`=?', [req.body.orderstatus, req.body.orderguid], function (error, results, fields) {
                  if (error) throw error;
                  var changedate= new Date();
                  connection.query('INSERT INTO `tbl_orderstatus_log` SET `orderstatus`=?,`orderguid`=?,`userguid`=?,`changedate`=?', [req.body.orderstatus, req.body.orderguid, req.headers.customerguid, changedate], function (error, Insertresults, fields) {
                    if (error) throw error;
                    res.send({Message:"success"});
                  });
                });
              }
            });
          }
          else
          {
            connection.query('UPDATE `tbl_order` SET `orderstatus`=? where `orderguid`=?', [req.body.orderstatus, req.body.orderguid], function (error, results, fields) {
              if (error) throw error;
              var changedate= new Date();
              connection.query('INSERT INTO `tbl_orderstatus_log` SET `orderstatus`=?,`orderguid`=?,`userguid`=?,`changedate`=?', [req.body.orderstatus, req.body.orderguid, req.headers.customerguid, changedate], function (error, Insertresults, fields) {
                if (error) throw error;
                res.send({Message:"success"});
              });
            });
          }
        });
      }
      else
      {
        connection.query('UPDATE `tbl_order` SET `orderstatus`=? where `orderguid`=?', [req.body.orderstatus, req.body.orderguid], function (error, results, fields) {
          if (error) throw error;
          var changedate= new Date();
          connection.query('INSERT INTO `tbl_orderstatus_log` SET `orderstatus`=?,`orderguid`=?,`userguid`=?,`changedate`=?', [req.body.orderstatus, req.body.orderguid, req.headers.customerguid, changedate], function (error, Insertresults, fields) {
            if (error) throw error;
            res.send({Message:"success"});
          });
        });
      }
  });

  //rest api to SendOrderStatusNotification
  app.post('/SendOrderStatusNotification', function (req, res) {
    connection.query('select id,staff_id,userguid from tbl_order where orderguid="'+req.body.orderguid+'"', function (error, orderresults, fields) {
      if (error) throw error;
      if(orderresults.length > 0)
        {
          var orderno=orderresults[0].id;
          var staff_id=orderresults[0].staff_id;
          var userguid=orderresults[0].userguid;

          var orderstatusvalue="";
          if(req.body.orderstatus==1)
          {
            orderstatusvalue="Pending";
          }
          if(req.body.orderstatus==2)
          {
            orderstatusvalue="Confirmed";
          }
          if(req.body.orderstatus==3)
          {
            orderstatusvalue="Ready";
          }
          if(req.body.orderstatus==4)
          {
            orderstatusvalue="Pickup";
          }
          if(req.body.orderstatus==5)
          {
            orderstatusvalue="Delivered";
          }
          if(req.body.orderstatus==6)
          {
            orderstatusvalue="Cancelled";
          }

          if(orderstatusvalue !='' && orderno!='' && userguid !='')
          {
            connection.query('select device_token from tbl_registration where isactive=1 and role_id=3 and userguid="'+userguid+'"', function (error, results, fields) {
              if (error) throw error;
              if(results.length > 0)
              {
                var device_token=results[0].device_token;
                if(device_token!='')
                {
                  var PushMessage="Your Order No. "+orderno+" has been "+orderstatusvalue+".";
                  var options = {
                    'method': 'POST',
                    'url': PushNotificationURL,
                    'headers': {
                      'Content-Type': 'application/json',
                      'Authorization': AuthorizationKey,
                      'Sender': SenderId
                    },
                    body: JSON.stringify({"to":device_token,"priority":"high","content_available":true,"notification":{"body":PushMessage,"title":"Order Status"}})
                  };
                  request(options, function (error, response) {
                    if (error) throw new Error(error);
                    if(staff_id !='')
                    {
                      if(req.body.orderstatus==3)
                      {
                        connection.query('select device_token from tbl_registration where isactive=1 and role_id=2 and userguid="'+staff_id+'"', function (error, results, fields) {
                          if (error) throw error;
                          if(results.length > 0)
                          {
                            var device_token=results[0].device_token;
                            if(device_token!='')
                            {
                              var PushMessage="Order No. "+orderno+" has been "+orderstatusvalue+".";
                              var options = {
                                'method': 'POST',
                                'url': PushNotificationURL,
                                'headers': {
                                  'Content-Type': 'application/json',
                                  'Authorization': AuthorizationKey,
                                  'Sender': SenderId
                                },
                                body: JSON.stringify({"to":device_token,"priority":"high","content_available":true,"notification":{"body":PushMessage,"title":"Order Status"}})
                              };
                              request(options, function (error, response) {
                                if (error) throw new Error(error);
                                res.send({Message:"success"});
                              });
                            }
                            else
                            {
                              res.send({Message:"success"});
                            }
                          }
                          else
                          {
                            res.send({Message:"success"});
                          }
                        });
                      }
                      else
                      {
                        res.send({Message:"success"});
                      }
                    }
                    else
                    {
                      res.send({Message:"success"});
                    }
                  });
                }
                else
                {
                  res.send({Message:"Something was wrong."});
                }
              }
              else
              {
                res.send({Message:"Something was wrong."});
              }
            });
          }  
          else
          {
            res.send({Message:"Something was wrong."});
          }   
        }
      else
      {
        res.send({Message:"Something was wrong."});
      }
    });
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

  //rest api to SendAssignStaffNotification
  app.post('/SendAssignStaffNotification', function (req, res) {

    connection.query('select id,staff_id,userguid from tbl_order where orderguid="'+req.body.orderguid+'"', function (error, orderresults, fields) {
      if (error) throw error;
      if(orderresults.length > 0)
        {
          var orderno=orderresults[0].id;
          var staff_id=orderresults[0].staff_id;
          var userguid=orderresults[0].userguid;

          if(orderno !='' && staff_id!='' && userguid !='')
          {
            connection.query('select device_token from tbl_registration where isactive=1 and role_id=2 and userguid="'+staff_id+'"', function (error, results, fields) {
              if (error) throw error;
              if(results.length > 0)
              {
                var device_token=results[0].device_token;
                if(device_token!='')
                {
                  var PushMessage="You have assign new Order No. "+orderno+".";
                  var options = {
                    'method': 'POST',
                    'url': PushNotificationURL,
                    'headers': {
                      'Content-Type': 'application/json',
                      'Authorization': AuthorizationKey,
                      'Sender': SenderId
                    },
                    body: JSON.stringify({"to":device_token,"priority":"high","content_available":true,"notification":{"body":PushMessage,"title":"Assign Order"}})
                  };
                  request(options, function (error, response) {
                    if (error) throw new Error(error);
                    connection.query('select device_token,firstname,lastname,phone from tbl_registration where isactive=1 and role_id=3 and userguid="'+userguid+'"', function (error, results, fields) {
                      if (error) throw error;
                      if(results.length > 0)
                      {
                        var device_token=results[0].device_token;
                        var firstname=results[0].firstname;
                        var lastname=results[0].lastname;
                        var phone=results[0].phone;
                        if(device_token!='')
                        {
                          var PushMessage="Your Order No. "+orderno+" has been assign to "+firstname+" "+lastname+".";
                          var options = {
                            'method': 'POST',
                            'url': PushNotificationURL,
                            'headers': {
                              'Content-Type': 'application/json',
                              'Authorization': AuthorizationKey,
                              'Sender': SenderId
                            },
                            body: JSON.stringify({"to":device_token,"priority":"high","content_available":true,"notification":{"body":PushMessage,"title":"Assign Order"}})
                          };
                          request(options, function (error, response) {
                            if (error) throw new Error(error);
                            res.send({Message:"success"});
                          });
                        }
                        else
                        {
                          res.send({Message:"success"});
                        }
                      }
                      else
                      {
                        res.send({Message:"success"});
                      }
                    });
                  });
                }
                else
                {
                  res.send({Message:"Something was wrong."});
                }
              }
              else
              {
                res.send({Message:"Something was wrong."});
              }
            });
          }  
          else
          {
            res.send({Message:"Something was wrong."});
          }   
        }
      else
      {
        res.send({Message:"Something was wrong."});
      }
    });
});
 
  //rest api to get count of orders into mysql database
  app.get('/GetOrdersCount', function (req, res) {
    connection.query('select count(id) as orderCount from tbl_order', function (error, results, fields) {
        if (error) throw error;
        res.send(results);
     });
  });

   //rest api to get sum of amount of today's orders into mysql database
   app.get('/GetTodayOrdersAmount', function (req, res) {
    var d=new Date();
    month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    var today= [year, month, day].join('-');

    connection.query('select sum(grandtotal) as todayAmount from tbl_order where DATE(orderdate)="'+today+'" and orderstatus=5', function (error, results, fields) {
        if (error) throw error;
        res.send(results);
     });
  });

  //rest api to get sum of amount of this month orders into mysql database
  app.get('/GetThisMonthOrdersAmount', function (req, res) {
    var d=new Date();
    month = '' + (d.getMonth() + 1);
    if (month.length < 2) 
        month = '0' + month;
    var thismonth= month;
    connection.query('select sum(grandtotal) as thismonthamount from tbl_order where DATE_FORMAT(orderdate,"%m")="'+thismonth+'" and orderstatus=5', function (error, results, fields) {
        if (error) throw error;
        res.send(results);
     });
  });

  //rest api to get sum of amount of all orders into mysql database
  app.get('/GetTotalOrdersAmount', function (req, res) {
    connection.query('select sum(grandtotal) as totalamount from tbl_order where orderstatus=5', function (error, results, fields) {
        if (error) throw error;
        res.send(results);
     });
  });

  //rest api to get sum of amount of all orders into mysql database
  app.get('/GetRecentOrders', function (req, res) {
    var d=new Date();
    month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    var today= [year, month, day].join('-');

    connection.query('select * from tbl_order where orderstatus=1 and DATE(orderdate)="'+today+'" order by orderdate desc limit 10', function (error, results, fields) {
        if (error) throw error;
        res.send(results);
     });
  });
  
  module.exports = app;