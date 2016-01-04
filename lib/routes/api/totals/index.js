
import _ from 'lodash';
import {Router} from 'express';
import { lastLudum, compo, jam } from 'config';
import cors from 'cors';

const tJam = _.clone(jam).reverse();
const tCompo = _.clone(compo).reverse();

/**
 * Create and expose router
 */

const app = Router();
export default app;

/**
 * Define routes
 */

const sendTotals = (req, res) => {
  res.send({
    lastLudum,
    compo: tCompo,
    jam: tJam
  });
};

const sendTotalsByLD = (req, res) => {
  let ld = +req.params.ld;

  if (isNaN(ld)){
    res.status(406).send({ error: `${req.params.ld} Must be a Ludum Number` });
    return;
  }

  if (ld > lastLudum){
    res.status(404).send({ error: `Ludum #${ld} Not Found .. yet :D`});
    return;
  }

  ld = ld - 1;

  res.send({
    compo: tCompo[ld],
    jam: tJam[ld]
  });
};

app.get('/:ld', cors(), sendTotalsByLD);
app.get('/', cors(), sendTotals);
