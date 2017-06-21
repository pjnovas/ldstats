const axios = td.replace('axios')
const LudumDareAPI = require('lib/ludumdare')

describe('LudumDareAPI#entry', () => {
  const entryURL = 'http://api.ludumdare.com/vx/node/get'
  afterEach(() => td.reset())

  it('should fetch and resolve an entry by id', done => {
    let ld = new LudumDareAPI()

    let entryId = 1000
    let mockResponse = {
      status: 200,
      data: {
        'status': 200,
        'caller_id': 29,
        'cached': [],
        'node': [{
          'id': 16102,
          'parent': 9405,
          'superparent': 9,
          'author': 26,
          'type': 'item',
          'subtype': 'game',
          'subsubtype': 'compo',
          'published': '2017-04-24T01:33:09Z',
          'created': '2017-04-21T21:37:33Z',
          'modified': '2017-05-13T22:47:20Z',
          'version': 82714,
          'slug': 'escape-the-world-1',
          'name': 'Escape The World',
          'body': 'bla bla',
          'meta': {
            'cover': '///content/a1/z/336c.png'
          },
          'link': {
            'author': [26]
          },
          'path': '/events/ludum-dare/38/escape-the-world-1',
          'parents': [1, 5, 9, 9405],
          'love': 0,
          'notes': 37,
          'notes-timestamp': '2017-05-19T15:01:53Z',
          'grade': {
            'grade-01': 30,
            'grade-02': 30,
            'grade-03': 30,
            'grade-04': 30,
            'grade-05': 30,
            'grade-06': 30,
            'grade-07': 26,
            'grade-08': 26
          },
          'magic': {
            'grade': 29,
            'given': 34.375,
            'feedback': 39,
            'smart': 35.139601392067,
            'cool': 110.80065755349,
            'grade-01-average': 3.357,
            'grade-01-result': 254,
            'grade-02-average': 3.786,
            'grade-02-result': 68,
            'grade-03-average': 3.214,
            'grade-03-result': 247,
            'grade-04-average': 2.607,
            'grade-04-result': 475,
            'grade-05-average': 2.536,
            'grade-05-result': 474,
            'grade-06-average': 3.071,
            'grade-06-result': 224,
            'grade-07-average': 2.125,
            'grade-07-result': 371,
            'grade-08-average': 2.75,
            'grade-08-result': 399
          }
        }]
      }
    }

    td.when(axios.get(`${entryURL}/${entryId}`)).thenResolve(mockResponse)

    ld.entry(entryId).then(entry => {
      expect(entry, 'to equal', {
        ludum: 38,
        title: 'Escape The World',
        type: 'compo',
        link: 'https://ldjam.com/events/ludum-dare/38/escape-the-world-1',
        coolness: 111,
        scores: {
          overall: 3.357,
          fun: 3.786,
          innovation: 3.214,
          theme: 2.607,
          graphics: 2.536,
          audio: 3.071,
          humor: 2.125,
          mood: 2.75
        },
        ranking: {
          overall: 254,
          fun: 68,
          innovation: 247,
          theme: 475,
          graphics: 474,
          audio: 224,
          humor: 371,
          mood: 399
        }
      })

      done()
    })
  })
})
