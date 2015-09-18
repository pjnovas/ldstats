
import _ from 'lodash';
import async from 'async';
import request from 'superagent';
import cheerio from 'cheerio';
import fs from 'fs';

import deb from 'debug';
const debug = deb('ldstats:server');

import config from 'config';
import {Author, Entry} from 'lib/models';

let authorURI = 'http://ludumdare.com/compo/author/';
let entryURI = 'http://ludumdare.com/compo/ludum-dare-{{LD}}/?action=preview&uid={{UID}}';
let rateNames = ['fun', 'theme', 'overall', 'humor', 'graphics', 'audio', 'mood', 'innovation'];

let ldRg = new RegExp(/ludum-dare-(\d+)/);
let uidRg = new RegExp(/uid=(\d+)/);

const fetchAuthor = (author, done) => {
  let uri = authorURI + author;
  debug('Fetch Author ' + uri);

  /*
  //Test Scraper from a File to not stress the site
  fs.readFile('/home/pjnovas/projects/ldstats/test.html', 'utf8', function(err, data) {
    done(null, scrapAuthor(uri, author, data));
  });
  return;
  */

  request.get(uri).end((err, res) => {
    if (err) {
      if (err.status === 404){ return done(); }
      return done(err);
    }

    done(null, scrapAuthor(uri, author, res.text));
  });
};

function scrapAuthor(uri, author, body){
  let data = {
    link: uri,
    ldUser: author,
    ldUserId: null,
    ludumFetch: config.lastLudum,
    ludums: []
  };

  let $ = cheerio.load(body);
  var main = $("#compo2");

  if (!main.length){
    // Not Found
    return null;
  }

  $ = cheerio.load(main.html());

  let entries = $("table").find("td");

  let links = [];
  entries.each(function(i, entry){
    return links.push($("a", this).attr("href"));
  });

  links.forEach(function(link){
    let ld = ldRg.exec(link);

    if(ld && ld.length > 1){
      data.ludums.push(+ld[1]);

      if (!data.ldUserId){
        let uid = uidRg.exec(link);
        if (uid && uid.length > 1){
          data.ldUserId = uid[1];
        }
      }
    }
  });

  return data;
}

const fetchEntries = (author, ludums, done) => {
  let uid = author.ldUserId;
  let authorId = author._id;

  let fetchs = ludums.map(ld => {
    return function(_done){
      let uri = entryURI.replace("{{LD}}", ld).replace("{{UID}}", uid);
      debug('Fetch Entry ' + uri);

      /*
      //Test Scraper from a File to not stress the site
      fs.readFile('/home/pjnovas/projects/ldstats/test_entry.html', 'utf8', function(err, data) {
        _done(null, scrapEntry(uri, authorId, ld, data));
      });
      return;
      */

      request.get(uri).end((err, res) => {
        if (err) return _done(err);
        _done(null, scrapEntry(uri, authorId, ld, res.text));
      });
    };
  });

  async.parallel(fetchs, done);
};

function scrapEntry(uri, authorId, ld, body){
  let entry = {
    link: uri,
    author: authorId,
    ludum: ld,
    title: "",
    ratings: {}
  };

  let $ = cheerio.load(body);
  $ = cheerio.load($("#compo2").html());

  entry.title = $("h2").first().text();
  let ratings = $("h3").first().next("p").find("table");

  ratings.find("tr").each(function(i, _entry){
    let cells = $(this).find("td"),
      name = cells.eq(1).text(),
      rate = cells.eq(2).text();

    if (name.toLowerCase() === "coolness"){
      entry.ratings.coolness = parseInt(rate.replace('%', ''), 10);
      return;
    }

    if (!entry.type){
      entry.type = "compo";
      if (name.toLowerCase().indexOf("jam") > -1){
        entry.type = "jam";
      }
    }

    let pos = cells.eq(0).text();

    let badge = cells.eq(0).find('img');
    if (badge.length){
      let src = badge.eq(0).attr('src');
      ['gold', 'silver', 'bronze'].forEach( (type, i) => {
        if (src.indexOf(type) > -1){
          pos = i+1;
          return false; //break loop
        }
      });
    }
    else {
      pos = parseInt(pos.replace('#', ''), 10) || 0;
    }

    let rating = {
      position: pos,
      rate: parseFloat(rate) || 0
    };

    rateNames.forEach(function(n){
      if (name.toLowerCase().indexOf(n) > -1){
        name = n;
        return false;
      }
    });

    if (!entry.type){
      entry.type = 'unknown';
    }

    entry.ratings[name] = rating;
  });

  return entry;
}

export default {
  fetchAuthor,
  fetchEntries
}
