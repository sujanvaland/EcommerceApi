const express = require('express');
const apiRouter = express();
const auth = require('./authentication');
const authenticateToken  = require('./authentication');

apiRouter.use('/login', require('./login'));
apiRouter.use('/user',authenticateToken, require('./users'));
apiRouter.use('/customer',authenticateToken, require('./customer'));
apiRouter.use('/category',authenticateToken, require('./category'));
apiRouter.use('/product',authenticateToken, require('./product'));
apiRouter.use('/order',authenticateToken, require('./order'));
apiRouter.use('/deliverystaff',authenticateToken, require('./deliverystaff'));

apiRouter.use('/appcategory', require('./appcategory'));
apiRouter.use('/appproduct', require('./appproduct'));
apiRouter.use('/account',authenticateToken, require('./account'));
apiRouter.use('/cart',authenticateToken, require('./cart'));

module.exports = apiRouter;