/* eslint-disable no-console */

// Reactivate test for testing integration with the real api

const LudumDareAPI = require('lib/ludumdare')

xdescribe('LudumDareAPI#integration', () => {
  it('should fetch ludum dares by username', done => {
    let ld = new LudumDareAPI()

    ld.user('pjnovas')
      .then(ld.userEntries)
      .then(ld.fulfillEntries)
      .then(console.log)
      .then(done)
      .catch(console.log)
  })
})
