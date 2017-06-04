import LudumDareAPI from 'lib/ludumdare'

describe('LudumDareAPI#constructor', () =>{
  it('should have defaults', () => {
    let ld = new LudumDareAPI()
    expect(ld.ssl, 'to be false')
    expect(ld.version, 'to be', 'x')
  })

  it('should allow to set an LudumDareAPI options', () => {
    let ld = LudumDareAPI.use({
      ssl: true,
      version: 1
    })

    expect(ld, 'to be a', LudumDareAPI)
    expect(ld.ssl, 'to be true')
    expect(ld.version, 'to be', 1)
  })
})

describe('LudumDareAPI#getUrl', () =>{
  it('should return a base url using current properties', () => {
    let ld = new LudumDareAPI({ssl: true, version: 'x'})
    expect(ld.getUrl(), 'to be', 'https://api.ldjam.com/vx')

    ld = new LudumDareAPI({ssl: false, version: 1})
    expect(ld.getUrl(), 'to be', 'http://api.ldjam.com/v1')
  })
})
