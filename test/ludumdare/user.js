const axios = td.replace('axios')
const LudumDareAPI = require('lib/ludumdare')

describe('LudumDareAPI#user', () => {
  const usersURL = 'http://api.ludumdare.com/vx/node/walk/1/users'
  afterEach(() => td.reset())

  it('should fetch and resolve with a user id', done => {
    let ld = new LudumDareAPI()

    let username = 'test'
    let mockResponse = {
      status: 200,
      data: {
        status: 200,
        caller_id: 0,
        root: 1,
        path: [2, 26],
        extra: [],
        node: 26
      }
    }

    td.when(axios.get(`${usersURL}/${username}`)).thenResolve(mockResponse)

    ld.user(username).then(userId => {
      expect(userId, 'to be', mockResponse.data.node)
      done()
    })
  })

  it('should fetch and reject when user is not found', done => {
    let ld = new LudumDareAPI()

    let username = 'not-found'
    let mockResponse = {
      status: 200,
      data: {
        status: 200,
        caller_id: 0,
        root: 1,
        path: [2],
        extra: [username],
        node: 2
      }
    }

    td.when(axios.get(`${usersURL}/${username}`)).thenResolve(mockResponse)

    ld.user(username).catch(error => {
      expect(error, 'to be an', Error)
      expect(error.status, 'to be', 404)
      expect(error.message, 'to be', 'Username Not Found')
      done()
    })
  })

  it('should send the Axios Rejection on catch', done => {
    let ld = new LudumDareAPI()

    let username = 'some-error'
    let mockResponse = {response: {status: 500, data: {}}}

    td.when(axios.get(`${usersURL}/${username}`)).thenReject(mockResponse)

    ld.user(username).catch(error => {
      expect(error, 'to be', mockResponse)
      done()
    })
  })
})
