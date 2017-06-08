
import async from 'async';
import request from 'superagent';
import cheerio from 'cheerio';

import deb from 'debug';
const debug = deb('ldstats:server');

import config from 'config';

let authorURI = 'http://ludumdare.com/compo/author/';
let entryURI = 'http://ludumdare.com/compo/ludum-dare-{{LD}}/?action=preview&uid={{UID}}';
let rateNames = ['fun', 'theme', 'overall', 'humor', 'graphics', 'audio', 'mood', 'innovation'];

let ldRg = new RegExp(/ludum-dare-(\d+)\//);
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
  var main = $('#compo2');

  if (!main.length){
    // Not Found
    return null;
  }

  $ = cheerio.load(main.html());

  let entries = $('table').find('td');

  let links = [];
  entries.each(function(){
    return links.push($('a', this).attr('href'));
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
      let uri = entryURI.replace('{{LD}}', ld).replace('{{UID}}', uid);
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
    title: '',
    coolness: 0,
    scores: {},
    ranking: {}
  };

  let $ = cheerio.load(body);
  $ = cheerio.load($('#compo2').html());

  entry.title = $('h2').first().text();
  let ratings = $('h3').first().next('p').find('table');

  ratings.find('tr').each(function(){
    let cells = $(this).find('td'),
      name = cells.eq(1).text(),
      rate = cells.eq(2).text();

    if (name.toLowerCase() === 'coolness'){
      entry.coolness = parseInt(rate.replace('%', ''), 10);
      return;
    }

    if (!entry.type){
      entry.type = 'compo';
      if (name.toLowerCase().indexOf('jam') > -1){
        entry.type = 'jam';
      }
    }

    let position = cells.eq(0).text();

    let badge = cells.eq(0).find('img');
    if (badge.length){
      let src = badge.eq(0).attr('src');
      ['gold', 'silver', 'bronze'].forEach( (type, i) => {
        if (src.indexOf(type) > -1){
          position = i+1;
          return false; //break loop
        }
      });
    }
    else {
      position = parseInt(position.replace('#', ''), 10) || 0;
    }

    rateNames.forEach(function(n){
      if (name.toLowerCase().indexOf(n) > -1){
        name = n;
        return false;
      }
    });

    if (!entry.type){
      entry.type = 'unknown';
    }

    entry.scores[name] = parseFloat(rate) || 0;
    entry.ranking[name] = position;
  });

  return entry;
}

export default {
  fetchAuthor,
  fetchEntries
}
