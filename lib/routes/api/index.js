
/*
 * RESTfull API
 */

/**
 * Module dependencies
 */

import {Router} from 'express';

import authors from './authors';
import totals from './totals';

import {render} from 'lib/routes/helpers';

/**
 * Expose app
 */

const app = Router();
export default app;

/**
 * Mount routers
 */

app.use('/authors', authors);
app.use('/totals', totals);

app.use('/', render('api', {
  title: 'Ludum Dare Stats - API Docs',
  description: 'API Stats for Ludum Dare',
  url: 'http://ldstats.info'
}));
