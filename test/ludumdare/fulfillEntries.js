const LudumDareAPI = require('lib/ludumdare')
const {noop} = require('lodash')

describe('LudumDareAPI#fulfillEntries', () => {
  afterEach(() => td.reset())

  it('should fetch and resolve the entries by user', done => {
    let ld = new LudumDareAPI()
    let entryIds = [1, 2, 3]

    ld.entry = td.func()

    td.when(ld.entry(1), {ignoreExtraArgs: true}).thenResolve(noop())
    td.when(ld.entry(2), {ignoreExtraArgs: true}).thenResolve({entry: 2})
    td.when(ld.entry(3), {ignoreExtraArgs: true}).thenResolve({entry: 3})

    ld.fulfillEntries(entryIds).then(entries => {
      expect(entries, 'to be an array')
      expect(entries, 'to equal', [
        {entry: 2},
        {entry: 3}
      ])

      done()
    })
  })
})
