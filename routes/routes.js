const express = require('express');
const apiRouter = express();
const auth = require('./authentication');
const authenticateToken  = require('./authentication');

apiRouter.use('/login', require('./login'));
apiRouter.use('/user',authenticateToken, require('./users'));
apiRouter.use('/customer',authenticateToken, require('./customer'));
apiRouter.use('/category', require('./category'));

module.exports = apiRouter;