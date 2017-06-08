
import {Router} from 'express';
import {findAuthor, fetchAuthor, findEntries, fetchEntries, serializeAuthor} from './controller';
import {joinUsername} from './newAPI';
import cors from 'cors';

export const sendAuthor = (req, res) => {
  res.send(req.author);
};

/**
 * Create and expose router
 */

const app = Router();
export default app;

/**
 * Define routes
 */

let scrapeOLDAuthor = [
  findAuthor,
  fetchAuthor,
  findEntries,
  fetchEntries,
  findEntries,
  serializeAuthor
]

app.get('/:name/plus/:username', [cors(), ...scrapeOLDAuthor, joinUsername, sendAuthor]);
app.get('/:name', [cors(), ...scrapeOLDAuthor, sendAuthor]);
