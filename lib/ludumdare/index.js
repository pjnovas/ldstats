import axios from 'axios'

const LudumDareById = {
  '9405': {
    ludum: 38,
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
  }
}

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

  parseUser = username => ({data}) => {
    let {path, extra, node} = data

    if (path[0] === node && extra[0] === username) {
      let error = new Error('Username Not Found')
      error.status = 404
      throw error
    }

    return {username, id: node}
  }

  setConfig = response => ({
    config: LudumDareById[response.data.node[0].parent],
    response
  })

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

  user = username => axios
    .get(`${this.getUrl()}/node/walk/1/users/${username}`)
    .then(this.parseUser(username))

  entriesByUser = ({id}) => axios
    .get(`${this.getUrl()}/node/feed/${id}/authors/item/game?limit=12`)
    .then(({data}) => data.feed.map(({id}) => id))

  fulfillEntries = entries => Promise.all(entries.map(this.entry))

  entry = id => axios
    .get(`${this.getUrl()}/node/get/${id}`)
    .then(this.setConfig)
    .then(this.parseEntry)

  static use = options => new LudumDareAPI(options)
}

export default LudumDareAPI
