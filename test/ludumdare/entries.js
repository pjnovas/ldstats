const axios = td.replace('axios')
const LudumDareAPI = require('lib/ludumdare')

describe('LudumDareAPI#userEntries', () => {
  const entriesURL = userId => `http://api.ludumdare.com/vx/node/feed/${userId}/authors/item/game?limit=12`
  afterEach(() => td.reset())

  it('should fetch and resolve the entries by user', done => {
    let ld = new LudumDareAPI()

    let userId = 123
    let mockResponse = {
      status: 200,
      data: {
        status: 200,
        caller_id: 0,
        root: userId,
        method: ['authors'],
        types: 'item',
        subtypes: 'game',
        offset: 0,
        limit: 10,
        feed: [{
          id: 16102, // entryID
          modified: '2017-05-13T22:47:20Z'
        }, {
          id: 50205, // entryID
          modified: '2018-05-13T22:47:20Z'
        }]
      }
    }

    td.when(axios.get(entriesURL(userId))).thenResolve(mockResponse)

    ld.userEntries(userId).then(entries => {
      expect(entries, 'to be an array')
      expect(entries, 'to equal', [16102, 50205])
      done()
    })
  })
})
