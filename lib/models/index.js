/**
 * Database connection and models definition. It takes care of the app data
 */

/**
 * Module dependencies
 */

import mongoose from 'mongoose';
import {db} from 'config';

import authorSchema from './author';
import entrySchema, { preSave as entryPreSave } from './entry';

/**
 * Module scope constants
 */

const {Schema} = mongoose;

/*
 * DB Connection
 */

mongoose.connect(db.url || (`mongodb://${db.host}/${db.name}`));

/*
 * Models declaration
 */

const AuthorSchema = new Schema(authorSchema);

const EntrySchema = new Schema(entrySchema);
EntrySchema.pre('save', entryPreSave);

export const Author =  mongoose.model('Author', AuthorSchema);
export const Entry =  mongoose.model('Entry', EntrySchema);
