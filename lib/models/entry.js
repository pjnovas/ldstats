
/**
 * Entry Schema
 */

import _ from 'lodash';
import {Schema} from 'mongoose';
const ObjectId = Schema.ObjectId;

import deb from 'debug';
const debug = deb('ldstats:server');

import {jam, compo} from 'config';

const tJam = _.clone(jam).reverse();
const tCompo = _.clone(compo).reverse();

const EntrySchema = {
  'author':       { type: ObjectId, required: true, ref: 'Author' },
  'ludum':        { type: Number, required: true },

  'title':        { type: String },
  'type':         { type: String, enum: ['compo', 'jam', 'unknown'], default: 'unknown' },
  'link':         { type: String },

  'coolness':     { type: Number },
  'scores':       { type: Schema.Types.Mixed },
  'ranking':      { type: Schema.Types.Mixed },
  'percents':     { type: Schema.Types.Mixed },

  'created_at':   { type: Date, default: Date.now }
};

export default EntrySchema;

export function preSave(next, done) {

  try {

    // Calculate Score average
    let len = 0, avg = 0;
    for (let category in this.scores){
      let value = this.scores[category];
      if (value) {
        len++;
        avg += value;
      }
    }

    this.scores.average = 0;
    if (avg && len) {
      this.scores.average = parseFloat((avg / len).toFixed(2));
    }

    // Set Total Entries
    switch (this.type){
      case 'compo':
        this.ranking.total = tCompo[this.ludum-1];
        break;
      case 'jam':
        this.ranking.total = tJam[this.ludum-1];
        break;
      default:
        this.ranking.total = 0;
        break;
    }

    // Calculate Percents
    if (this.ranking.total > 0) {
      this.percents = {};

      for (let category in this.ranking){
        if (category === "total") continue;

        let pos = this.ranking[category];
        if (pos) {
          let per = (pos * 100 ) / this.ranking.total;
          this.percents[category] = parseFloat(per.toFixed(1));
        }
      }
    }
  } catch(e){
    debug('EntryPreSave ', e);
    return done(e);
  }

  next();
}
