const express = require('express');
const app = express();
var connection = require('../config/db');
const { v1: uuidv1 } = require('uuid');
const js_sha512_1 = require("js-sha512");
var request = require('request');
var SendSMSURL='http://dnd.smssetu.co.in/smsstatuswithid.aspx';
var SMSusername='9687268055';
var SMSpassword='TDM055VDR';
var SMSsenderId='TDMEAT';
var adminPhone='9687268055';

  
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


  //rest api to get paymentobject
  app.post('/paymentobject', function (req, res) {
    var params  = req.body;
    var sql = "SELECT * from tbl_payu_config where isactive='1'";
    connection.query(sql, function (error, results, fields) {
         if (error) throw error;
         if(results.length == 0)
          {
            res.json({ Message:"error",error_message:"Something Went Wrong. Please Try Again."});
          }
          else
          {
            $key=results[0].apikey;
            $salt=results[0].apisalt;
            $merchantId=results[0].merchantId;

            $txnId=params.txnId;
            $amount=params.finaltotal;
            $productinfo=params.productName;
            $firstname=params.firstname;
            $email=params.email;
            $phone=params.phone;

            $hash=gethash($key,$amount,$email,$txnId,$productinfo,$firstname,$salt);
            
            $payData = {
                amount: $amount,
                txnId: $txnId,
                productName: $productinfo,
                firstName: $firstname,
                email: $email,
                phone: $phone,
                merchantId: $merchantId,
                key: $key,
                successUrl: 'https://www.payumoney.com/mobileapp/payumoney/success.php',
                failedUrl: 'https://www.payumoney.com/mobileapp/payumoney/failure.php',
                isDebug: false,
                hash:$hash,
            }
            res.json({ Message:"success",payData:$payData}); 
          }
    });
  });

  function gethash(key, amount, email, txnId, productName, firstName, salt, udf1 = "", udf2 = "", udf3 = "", udf4 = "", udf5 = "", udf6 = "", udf7 = "", udf8 = "", udf9 = "", udf10 = "")
  {
    const hashString = `${key}|${txnId}|${amount}|${productName}|${firstName}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}|${udf6}|${udf7}|${udf8}|${udf9}|${udf10}|${salt}`;
    return js_sha512_1.sha512(hashString);
  }

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

            var paymentstatus="";
            var transactionid="";
            var responsedata="";
            var orderstatus = 1;
            if(req.body.paymenttype==2)
            {
               var paymentdata = req.body.paymentdata;
               //console.log(paymentdata);
               if(paymentdata.success)
               {
                  var paymentstatus=paymentdata.response.result.status;
                  var transactionid=paymentdata.response.result.txnid;
                  var responsedata=paymentdata.response.toString();
               }
               else
               {
                 var paymentstatus="failed";
                 var orderstatus = 6;
               }
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
              "orderdate": new Date(),
              "paymentstatus":paymentstatus,
              "transactionid":transactionid,
              "responsedata":responsedata
            }
            
            // For Insert Order
            connection.query('INSERT INTO `tbl_order` SET ?', newparams, function (error, Insertresults, fields) {
              if (error) throw error;
              // For Insert Order Items
              if(Insertresults.insertId > 0)
              {
                connection.query('select orderguid from tbl_order where id="'+Insertresults.insertId+'"', function (error, orderresults, fields) {
                  if (error) throw error;
                  if(orderresults.length)
                  {
                    var orderitemsql ="insert into tbl_orderitem(pid,productname,pieces,net_weight,productimage,orderguid,qty,pprice,unitprice,mainprice) select pid,(select productname from tbl_product where id=tbl_cart.pid) as productname,(select pieces from tbl_product where id=tbl_cart.pid) as pieces,(select net_weight from tbl_product where id=tbl_cart.pid) as net_weight,(select productimage from tbl_product where id=tbl_cart.pid) as productimage,'"+orderguid+"',qty,((select price from tbl_product where id=tbl_cart.pid)*qty) as pprice,(select price from tbl_product where id=tbl_cart.pid) as unitprice,(select price from tbl_product where id=tbl_cart.pid) as mainprice from tbl_cart where userguid='"+req.headers.customerguid+"'";
                    connection.query(orderitemsql, function (error, InsertItemresults, fields) {
                        if (error) throw error;
                        var changedate= new Date();
                        connection.query('INSERT INTO `tbl_orderstatus_log` SET `orderstatus`=?,`orderguid`=?,`userguid`=?,`changedate`=?', [orderstatus, orderresults[0].orderguid, req.headers.customerguid, changedate], function (error, Insertresults, fields) {
                          if (error) throw error;
                          // For Delete Cart
                          connection.query('DELETE FROM tbl_cart WHERE userguid="'+req.headers.customerguid+'"', function (error, results, fields) {
                            if (error) throw error;
                            if(paymentstatus=="failed")
                            {
                               var SendMessage="Your Order No. "+Insertresults.insertId+" has been placed Failed.";
                            }
                            else
                            {
                              var SendMessage="Your Order No. "+Insertresults.insertId+" has been placed success.";
                            }
                            
                            var SendUrl = SendSMSURL+"?mobile="+SMSusername+"&pass="+SMSpassword+"&senderid="+SMSsenderId+"&to="+addressresults[0].bphone+"&msg="+SendMessage;
                              
                            request(SendUrl, function (error, response) {
                              //if (error) throw new Error(error);
                              //res.json({ Message:"success",orderguid:orderguid,paymentstatus:paymentstatus});
                              if(paymentstatus!="failed")
                              {
                                var phone=adminPhone;
                                if(phone!='')
                                {
                                  // For SMS Notification
                                  var SendAdminMessage="Order No. "+Insertresults.insertId+" has been placed success.";
                                  var SendAdminUrl = SendSMSURL+"?mobile="+SMSusername+"&pass="+SMSpassword+"&senderid="+SMSsenderId+"&to="+phone+"&msg="+SendAdminMessage;
                                  request(SendAdminUrl, function (error, response) {
                                    res.json({ Message:"success",orderguid:orderguid,paymentstatus:paymentstatus});
                                  });
                                }
                              }
                            });
                            res.json({ Message:"success",orderguid:orderguid,paymentstatus:paymentstatus});
                          });
                        });
                    });
                  }
                  else
                  {
                    res.json({ Message:"error",error_message:"Something went wrong. Please try again."});
                  }
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

  //rest api to get Order Detail
  app.post('/orderdetail', function (req, res) {
    
    connection.query('select * from tbl_order where orderguid="'+req.body.orderguid+'"', function (error, results, fields) {
        if (error) throw error;
        if(results.length)
          {
            res.json({ Message:"success",results});
          }
          else
          {
            res.send({Message:"No Orders in List"});
          }
     });
  });

  
  module.exports = app;