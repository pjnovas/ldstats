
import _ from 'lodash';
import async from 'async';
import config from 'config';

import deb from 'debug';
const debug = deb('ldstats:server');

import {Author, Entry} from 'lib/models';
import scraper from 'lib/scraper';

function fireErr(res, err){
  if (err) {
    debug('ERROR at /authors/:author ', err);
    return res.status(500).end();
  }
}

export const findAuthor = (req, res, next) => {
  let name = req.params.name;

  Author.findOne({ ldUser: name }, (err, author) => {
    if (err) return fireErr(res, err);
    req.author = author;
    next();
  });
};

export const fetchAuthor = (req, res, next) => {
  let name = req.params.name;

  if (req.author && req.author.ludumFetch >= config.lastLudum){
    // Author data is up to date so go on
    debug('Using existing Author ' + req.author.ldUser);
    return next();
  }

  function updateAndGoOn(err, author){
    if (err) return fireErr(res, err);
    req.author = author;
    next();
  }

  // Scrap Author
  scraper.fetchAuthor(name, (err, _author) => {
    if (err) return fireErr(res, err);

    if (!_author){
      return res.status(404).send({ error: "Author Not Found"});
    }

    if (req.author) {
      req.author.updated_at = Date.now();
      req.author.link = _author.link;
      req.author.ldUser = _author.ldUser;
      req.author.ldUserId = _author.ldUserId;
      req.author.ludumFetch = _author.ludumFetch;
      req.author.ludums = _author.ludums;

      req.author.markModified('ludums');
      return req.author.save(updateAndGoOn);
    }

    return Author.create(_author, updateAndGoOn);
  });

};

export const findEntries = (req, res, next) => {
  if (req.entries){
    return next();
  }

  debug('Filling entries for Author ' + req.author.ldUser);

  Entry.find({ author: req.author._id }).exec((err, entries) => {
    if (err) return fireErr(res, err);
    req.entries = entries;
    next();
  });

};

export const fetchEntries = (req, res, next) => {

  let missingLudums = _.filter(req.author.ludums, ld => {
    return ld !== 36 && !_.find(req.entries, entry => entry.ludum === ld);
  });

  if (!missingLudums.length){
    return next();
  }

  scraper.fetchEntries(req.author, missingLudums, (err, entries) => {
    if (err) return fireErr(res, err);
    Entry.create(entries, (err) => {
      if (err) return fireErr(res, err);
      req.entries = null; // so it re-finds them
      next();
    });

  });

};

export const sendAuthor = (req, res) => {
  req.author = _.omit(req.author.toJSON(), ['_id', 'created_at', 'updated_at', '__v', 'ludumFetch']);

  req.author.entries = _.map(req.entries, entry => {
    return _.omit(entry.toJSON(), ['_id', 'author', '__v', 'created_at', 'updated_at']);
  });

  res.send(req.author);
};
