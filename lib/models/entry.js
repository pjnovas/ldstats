
/**
 * Entry Schema
 */

import {Schema} from 'mongoose';
const ObjectId = Schema.ObjectId;

const EntrySchema = {
  'author':       { type: ObjectId, required: true, ref: 'Author' },
  'ludum':        { type: Number, required: true },

  'title':        { type: String },
  'type':         { type: String, enum: ['compo', 'jam', 'unknown'], default: 'unknown' },
  'ratings':      { type: Schema.Types.Mixed },
  'link':         { type: String },

  'created_at':   { type: Date, default: Date.now }
};

export default EntrySchema;
