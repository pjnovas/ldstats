
import express from 'express';
import path from 'path';
import favicon from 'serve-favicon';
import logger from 'morgan';
import bodyParser from 'body-parser';

import config from 'config';

import deb from 'debug';
const debug = deb('ldstats:server');

import _ from 'lib/models';
import routes from 'lib/routes';
import viewEngine from './viewEngine';

const staticsMaxAge = 365 * 24 * 60 * 60 * 1000; // 1 Year in ms

const app = express();

debug('Setting Last Ludum Dare to ' + config.lastLudum);

// view engine setup
app.set('config', config);
app.set('views', 'views');

app.engine('hbs', viewEngine);
app.set('view engine', 'hbs');

app.use(favicon('public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public', { maxAge: staticsMaxAge }));

/*
 * Route handlers.
 * The main app is in charge only of mounting the routers.
 */

app.use('/', routes);

// catch 404 and forward to error handler
app.use( (req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  //res.redirect('/notfound');
  res.status(404);
  res.end();
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use( (err, req, res, next) => {
    console.dir(err);
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use( (err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


export default app;
