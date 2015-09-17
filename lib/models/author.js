
/**
 * Author Schema
 */

import {Schema} from 'mongoose';
const ObjectId = Schema.ObjectId;

const AuthorSchema = {
  'ldUser':       { type: String, required: true },
  'ldUserId':     { type: String, required: true },

  'ludums':       { type: [Number] },
  'ludumFetch':   { type: Number },
  'link':         { type: String },

  'created_at':   { type: Date, default: Date.now },
  'updated_at':   { type: Date, default: Date.now }
};

export default AuthorSchema;
