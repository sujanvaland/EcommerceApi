const express = require('express');
const apiRouter = express();
const auth = require('./authentication');
const authenticateToken  = require('./authentication');

apiRouter.use('/login', require('./login'));
apiRouter.use('/user',authenticateToken, require('./users'));
apiRouter.use('/customer',authenticateToken, require('./customer'));
apiRouter.use('/category',authenticateToken, require('./category'));
apiRouter.use('/product',authenticateToken, require('./product'));
apiRouter.use('/deliverystaff',authenticateToken, require('./deliverystaff'));

apiRouter.use('/appcategory', require('./appcategory'));
apiRouter.use('/appproduct', require('./appproduct'));

module.exports = apiRouter;