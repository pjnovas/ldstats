import deb from 'debug'

import {compact} from 'lodash';

import axios from 'axios'

const debug = deb('ldstats:new-api')

class LudumDareAPI {
  ssl = false
  version = 'x'

  constructor(options) {
    if (options) {
      this.ssl = options.ssl || this.ssl
      this.version = options.version || this.version
    }
  }
  
  getUrl = () => `${this.ssl ? 'https' : 'http'}://api.ldjam.com/v${this.version}`
  getLDId = response => response.data.node[0].parent
  getLDName = id => axios
    .get(`${this.getUrl()}/node/get/${id}`)
    .then(({data}) => parseInt(data.node[0].slug));
  //make sure the ludum dare competition is not finished
  getLDFinished = id => axios
    .get(`${this.getUrl()}/node/get/${id}`)
    .then(({data}) => data.node[0].meta['event-finished'])

  parseUser = username => ({data}) => {
    let {path, extra, node} = data

    if (path[0] === node && extra[0] === username) {
      let error = new Error('Username Not Found')
      error.status = 404
      throw error
    }

    return node // user id
  }

  setConfig = response => axios
    //gets what this ludum dare is called
    .all([this.getLDName(this.getLDId(response))])
    .then(data => ({
      config: {
        ludum: data[0],
        //grades are always like this, for every ludum dare
        grades: {
          'grade-01': 'Overall',
          'grade-02': 'Fun',
          'grade-03': 'Innovation',
          'grade-04': 'Theme',
          'grade-05': 'Graphics',
          'grade-06': 'Audio',
          'grade-07': 'Humor',
          'grade-08': 'Mood'
        }
      },
      response
    }));
  
  parseEntry = ({response, config}) => {
    let {ludum, grades} = config
    let [entry] = response.data.node

    let {scores, ranking} = Object.keys(grades).reduce((result, key) => {
      let category = grades[key].toLowerCase()
      result.scores[category] = entry.magic[`${key}-average`]
      result.ranking[category] = entry.magic[`${key}-result`]
      return result
    }, {
      scores: {},
      ranking: {}
    })

    return {
      ludum,
      title: entry.name,
      type: entry.subsubtype,
      link: `https://ldjam.com${entry.path}`,
      coolness: Math.round(entry.magic.cool),
      scores,
      ranking
    }
  }

  // resolves a user id from a username
  user = username => axios
    .get(`${this.getUrl()}/node/walk/1/users/${username}`)
    .then(this.parseUser(username))

  // resolves an array of id entries from a user id
  userEntries = userId => axios
    .get(`${this.getUrl()}/node/feed/${userId}/authors/item/game?limit=12`)
    .then(({data}) => data.feed.map(entry => entry.id))

  // hidratates an array of entries ids with entry data
  fulfillEntries = entries => Promise.all(entries.map(this.entry)).then(result => compact(result))

  // resolves an entry by id
  entry = id => axios
    .get(`${this.getUrl()}/node/get/${id}`)
    //if it is not finished, then the ratings won't be available yet
    .then(res => this.getLDFinished(this.getLDId(res)) ? res : Promise.reject(new Error('UNFINSHED-LUDUM-DARE')))
    .then(this.setConfig)
    .then(this.parseEntry)
    .catch(error => {
      if (error.message === 'UNFINSHED-LUDUM-DARE') {
        debug('Unfinished Ludum Dare');
        return;
      }

      return Promise.reject(error);
    })

  static use = options => new LudumDareAPI(options)
}

export default LudumDareAPI
