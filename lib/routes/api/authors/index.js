
import {Router} from 'express';
import {findAuthor, fetchAuthor, findEntries, fetchEntries, sendAuthor} from './controller';
import cors from 'cors';

/**
 * Create and expose router
 */

const app = Router();
export default app;

/**
 * Define routes
 */

app.get('/:name', cors(), findAuthor, fetchAuthor, findEntries, fetchEntries, findEntries, sendAuthor);
