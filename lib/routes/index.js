/**
 * Routes main router. This router will mount the different parts of the app
 */

/**
 * Module dependencies
 */

import {Router} from 'express';
import api from './api';
import site from './site';

/**
 * Create router
 */

const app = Router();
export default app;

/**
 * Mount app routers
 */

app.use('/api', api);
app.use('/', site);
