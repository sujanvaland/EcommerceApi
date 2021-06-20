const express = require('express');
const app = express();
var connection = require('../config/db');
const { v1: uuidv1 } = require('uuid');
var request = require('request');
var PushNotificationURL='https://fcm.googleapis.com/fcm/send';
var AuthorizationKey='key=AAAAs35jvRM:APA91bHZN45AahBEKrYzlKkyJ7N87xuDyaB1aqyWPm5uMQlgmwEgDRTCops8Bk7MQyHBHWc_qTNFCAXbOaewCMSn1zZymDkQyFT7_AyGnzCek6hN8169AcPRTMKvWzOHwOzZKT7GFDul';
var SenderId='770919611667';

  //rest api to get all deliverystaffs
  app.get('/deliverystaff', function (req, res) {
    connection.query('select * from tbl_registration', function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });
  
  app.get('/GetAllDeliverystaffs', function (req, res) {
    connection.query('select id,firstname,lastname,email,phone,userguid,username,role_id,isactive from tbl_registration where role_id=2', function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });

  //rest api to get filter deliverystaff
  app.get('/GetAllDeliverystaffs/:name', function (req, res) {
    connection.query('select id,firstname,lastname,email,phone,userguid,username,role_id,isactive from tbl_registration where role_id=2 and (firstname like "%'+req.params.name+'%" or lastname like "%'+req.params.name+'%")', function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });

  //rest api to get a login deliverystaff data
  app.post('/GetDeliverystaffInfo', function (req, res) {
    connection.query('select id,firstname,lastname,email,phone,userguid,username,role_id,isactive,password from tbl_registration where userguid="'+req.body.CustomerGuid+'" and role_id=2', function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });
  

  //rest api to get a login deliverystaff data
  app.get('/GetLoginDeliverystaffInfo', function (req, res) {
    connection.query('select id,firstname,lastname,email,phone,userguid,username,role_id,isactive from tbl_registration where userguid=?', [req.headers.customerguid], function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });

  //rest api to get a single tbl_registration data
  app.get('/deliverystaff/:id', function (req, res) {
    connection.query('select * from tbl_registration where id=?', [req.params.id], function (error, results, fields) {
       if (error) throw error;
       res.send(results);
     });
  });
  
  //rest api to update record into mysql database
  app.post('/UpdateDeliverystaffInfo', function (req, res) {
    connection.query('UPDATE `tbl_registration` SET `firstname`=?,`lastname`=?,`email`=?,`phone`=? where `userguid`=?', [req.body.FirstName,req.body.LastName, req.body.Email, req.body.Phone, req.headers.customerguid], function (error, results, fields) {
     if (error) throw error;
       res.send({Message:"success",results});
     });
  });
  
  //rest api to delete record from mysql database
  app.delete('/deliverystaff', function (req, res) {
    connection.query('DELETE FROM `tbl_registration` WHERE `id`=?', [req.body.id], function (error, results, fields) {
     if (error) throw error;
       res.send('Record has been deleted!');
     });
  });

  //rest api to get a login deliverystaff data
  app.post('/ChangePassword', function (req, res) {
    var params  = req.body;
    connection.query('select password from tbl_registration where userguid="'+req.headers.customerguid+'"', function (error, results, fields) {
      if (error) throw error;
      if(results.length)
       {
          connection.query('select id from tbl_registration where userguid="'+req.headers.customerguid+'" and password="'+oldhash+'"', function (error, results, fields) {
            if (error) throw error;
            if(results.length)
              {
                connection.query('update tbl_registration set password="'+params.NewPassword+'" where userguid="'+req.headers.customerguid+'"', function (error, results, fields) {
                  if (error) throw error;
                  res.json({ Message:"success"});
                });
              }
              else
              {
                res.json({ Message:"Old password is wrong!."});
              }
          });
       }
    });
  });

  //rest api to update record into mysql database
  app.post('/lock_unlock_deliverystaff', function (req, res) {
    // here in the req.file you will have the uploaded avatar file
    var params  = req.body;
    
    if (params.isactive == true)
    {
      params.isactive = 1;
    }
    else
    {
      params.isactive = 0;
    }

    connection.query('select username from tbl_registration where username="'+params.username+'" and userguid!="'+params.userguid+'"', function (error, results, fields) {
      if(results.length == 0)
      {
          connection.query('UPDATE `tbl_registration` SET `firstname`=?,`lastname`=?,`email`=?,`phone`=?,`username`=?,`password`=?,`isactive`=? where `userguid`=?', [params.firstname,params.lastname,params.email,params.phone,params.username,params.password,params.isactive,params.userguid], function (error, results, fields) {
            if (error) throw error;
              res.json({ Message:"success",results});
            });
      }
      else
      {
        return res.send({ Message: 'Username already exist. !!!'})
      }
    });
  });

  app.post('/deliverystaff', function (req, res) {
    // here in the req.file you will have the uploaded avatar file
    var params  = req.body;
    
    connection.query('select username from tbl_registration where username="'+params.username+'"', function (error, results, fields) {
      if(results.length == 0)
      {
          //console.log(req);
          params.registration_date= new Date();
          params.userguid=uuidv1();
          params.role_id=2;

          if (params.isactive == true)
          {
            params.isactive = 1;
          }
          else
          {
            params.isactive = 0;
          }
                
          connection.query('INSERT INTO `tbl_registration` SET ?', params, function (error, Insertresults, fields) {
            if (error) throw error;
            res.json({ Message:"success",Insertresults});
          });
      }
      else
      {
        return res.send({ Message: 'Username already exist. !!!'})
      }
    });
  });


  // Start API for Mobile APP
    //rest api to get all orders Delivery Staff Wise
    app.get('/orderbystaff', function (req, res) {
      var callbackCounter = 0;
      connection.query('select * from tbl_order where staff_id="'+req.headers.customerguid+'"', function (error, results, fields) {
          if (error) throw error;
          if(results.length)
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
                  res.send({Message:"success",orders});
                }
              });
            });
          }
          else
          {
            res.send({Message:"No Orders in List"});
          }
          
      });
    });

    //rest api to update order status into mysql database
    app.post('/ChangeStatus', function (req, res) {
      connection.query('UPDATE `tbl_order` SET `orderstatus`=? where `orderguid`=?', [req.body.orderstatus, req.body.orderguid], function (error, results, fields) {
        if (error) throw error;
        var changedate= new Date();
        connection.query('INSERT INTO `tbl_orderstatus_log` SET `orderstatus`=?,`orderguid`=?,`userguid`=?,`changedate`=?', [req.body.orderstatus, req.body.orderguid, req.headers.customerguid, changedate], function (error, Insertresults, fields) {
          if (error) throw error;
          connection.query('select assignorder from tbl_registration where isactive=1 and role_id=2 and userguid="'+req.headers.customerguid+'"', function (error, results, fields) {
            if (error) throw error;
            if(results.length > 0)
            {
              var oldassignorder=results[0].assignorder;
              var newone=1;
              var assignorder=0;
              if(req.body.orderstatus==5)
                {
                  if(oldassignorder > 0)
                  {
                    assignorder=(oldassignorder - 0) - (newone - 0);
                  }
                }
              else
                {
                  assignorder=oldassignorder;
                }
              
              connection.query('UPDATE `tbl_registration` SET `assignorder`=? where `userguid`=?', [assignorder, req.headers.customerguid], function (error, results, fields) {
                if (error) throw error;
                connection.query('select id,userguid from tbl_order where orderguid="'+req.body.orderguid+'"', function (error, orderresults, fields) {
                  if (error) throw error;
                  if(orderresults.length > 0)
                    {
                      var orderno=orderresults[0].id;
                      var userguid=orderresults[0].userguid;
                      var orderstatusvalue="";
                      if(req.body.orderstatus==4)
                      {
                        orderstatusvalue="Pickup";
                      }
                      if(req.body.orderstatus==5)
                      {
                        orderstatusvalue="Delivered";
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
                              var PushMessage="Your Order No. "+orderno+" has been "+orderstatusvalue+". For any queries please contact us on: thedailymeat786@gmail.com";
                              //var PushMessage="Your Order No. "+orderno+" has been "+orderstatusvalue+".";
                              var options = {
                                'method': 'POST',
                                'url': PushNotificationURL,
                                'headers': {
                                  'Content-Type': 'application/json',
                                  'Authorization': AuthorizationKey,
                                  'Sender': SenderId
                                },
                                body: JSON.stringify({"to":device_token,"priority":"high","content_available":true,"notification":{"body":PushMessage,"title":"Order Status"},"data":{"type":"OrderDetail","orderid":orderno}})
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
              });
            }
          });
        });
      });
    });


  // Ends API for Mobile APP
  
  module.exports = app;