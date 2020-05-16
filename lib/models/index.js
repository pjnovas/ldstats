/**
 * Database connection and models definition. It takes care of the app data
 */

/**
 * Module dependencies
 */

import mongoose from "mongoose";

import authorSchema from "./author";
import entrySchema, { preSave as entryPreSave } from "./entry";

mongoose.Promise = require("bluebird");

/**
 * Module scope constants
 */

const { Schema } = mongoose;

/*
 * DB Connection
 */

mongoose.connect(process.env.MONGO_URL);

/*
 * Models declaration
 */

const AuthorSchema = new Schema(authorSchema);

const EntrySchema = new Schema(entrySchema);
EntrySchema.pre("save", entryPreSave);

export const Author = mongoose.model("Author", AuthorSchema);
export const Entry = mongoose.model("Entry", EntrySchema);
