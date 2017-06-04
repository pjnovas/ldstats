const LudumDareAPI = require('lib/ludumdare')

describe('LudumDareAPI#integration', () => {
  it('should fetch ludum dares by username', done => {
    let ld = new LudumDareAPI()

    ld.user('pjnovas')
      .then(ld.entriesByUser)
      .then(ld.fulfillEntries)
      .then(console.log) // eslint-disable-line no-console
      .then(done)
  })
})
