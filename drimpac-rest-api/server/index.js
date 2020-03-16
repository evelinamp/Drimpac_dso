'use strict';
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');

const app = express();
const session = require('express-session');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(
  session({
    secret: 'dog vs cat',
    resave: true,
    saveUninitialized: false,
  })
);
const authApi = require('./routes/authAPI');
const drimpacApi = require('./routes/drimpacAPI');
const unitManagementApi = require('./routes/unitManagementAPI');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type,Authorization'
  );
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
})
  .options('*', function (req, res, next) {
    res.end();
  });
app.use(logger('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(cookieParser());
app.use(fileUpload({}));

/* DRIMPAC API */
app.get('/drimpac-aggregator/rest/api/v1/get_EPE', drimpacApi.getEPE);
app.get('/drimpac-dso/rest/api/v1/getmessage', drimpacApi.sendmessage);
app.post('/drimpac-dso/rest/api/v1/sendmessage', drimpacApi.getmessage);
app.get('/drimpac-dso/rest/getCROs', drimpacApi.getCROs);
app.get('/drimpac-dso/rest/getSynchronisationCongestionpoints', drimpacApi.getSynchronisationCongestionpoints);
app.post('/drimpac-dso/rest/api/v1/xml_message', drimpacApi.xmlMessage);

app.post('/drimpac-dso/rest/add_CRO', drimpacApi.addCRO);
app.post('/drimpac-dso/rest/get_CRO', drimpacApi.getCRO);
app.post('/drimpac-dso/rest/add_Congestion', drimpacApi.addCongestion);
app.get('/drimpac-dso/rest/getPrognoses', drimpacApi.getPrognoses);
app.get('/drimpac-dso/rest/getFlexOffer', drimpacApi.getFlexOffer);
app.get('/drimpac-dso/rest/getConfigFile', drimpacApi.getConfigFile);
app.get('/drimpac-dso/rest/commoneferenceupdate', drimpacApi.commoneferenceupdate);
app.get('/drimpac-dso/rest/commoneferencequery', drimpacApi.commoneferencequery);
app.get('/drimpac-dso/rest/connectionforecast', drimpacApi.connectionforecast);
app.get('/drimpac-dso/rest/flexorder', drimpacApi.flexorder);
app.post('/drimpac-dso/rest/flexrequest', drimpacApi.flexrequest);
/* AUTH API */

app.post('/drimpac-dso/rest/api/v1/create_user', authApi.create_user);
app.post('/drimpac-dso/rest/api/v1/update_user', authApi.update_user);
app.post('/drimpac-dso/rest/api/v1/login_with_email_password', authApi.login_with_email_password);
app.post('/drimpac-dso/rest/api/v1/logout', authApi.logout);
app.get('/drimpac-dso/rest/api/v1/get_user_list', authApi.get_user_list);
app.post('/drimpac-dso/rest/api/v1/remove_user', authApi.remove_user);
app.post('/drimpac-dso/rest/forgot', authApi.forgot);
app.post('/drimpac-dso/rest/api/v1/reset', authApi.reset);
app.post('/drimpac-dso/rest/api/v1/refresh', authApi.refresh);
app.get('/drimpac-dso/rest/getAvailiableAggregators', authApi.getAvailiableAggregators);


app.post('/drimpac-dso/rest/add_device', unitManagementApi.addDevice);
app.get('/drimpac-dso/rest/get_devices', unitManagementApi.getDevices);
app.post('/drimpac-dso/rest/edit_device', unitManagementApi.editDevice);
app.post('/drimpac-dso/rest/delete_device', unitManagementApi.deleteDevice);
app.post('/drimpac-dso/rest/dsoPremises', unitManagementApi.dsoPremises);
app.get('/drimpac-dso/rest/getdsoPremises', unitManagementApi.getdsoPremises);
app.get('/drimpac-dso/rest/getDrmsCongestions', unitManagementApi.getDrmsCongestions);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
