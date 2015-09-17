
/*
 * RESTfull API
 */

/**
 * Module dependencies
 */

import {Router} from 'express';
import authors from './authors';

/**
 * Expose app
 */

const app = Router();
export default app;

/**
 * Mount routers
 */

app.use('/authors', authors);
