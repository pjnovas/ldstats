
/**
 * Non-api related routes
 */

import {Router} from 'express';
import {appStack, setAuthor, setUsername} from './controllers';

/**
 * Create and expose router
 */

 const app = Router();
 export default app;

/**
 * Define routes
 */

// Home ----------------------------
app.get('/', appStack);
app.get('/none/only/:username', setUsername, appStack);
app.get('/:author/:username', setAuthor, setUsername, appStack);
app.get('/:author', setAuthor, appStack);
