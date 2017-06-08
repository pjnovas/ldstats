/* eslint-disable no-console */

import {preSave as entryPreSave} from 'lib/models/entry'
import Ludumdare from 'lib/ludumdare'
const ld = Ludumdare.use({ssl: true, version: 'x'})

const getUsernameURL = username => `https://ldjam.com/users/${username}`

// Ugly proxy to reuse calculations from the model
// TODO: Create new calculations
const setEntriesCalcs = entries => Promise.all(
  entries.map(entry => new Promise((resolve, reject) => {
    entryPreSave.call(entry, () => resolve(entry), reject)
  }))
)

export const joinUsername = (req, res, next) => {
  let username = req.params.username

  ld.user(username)
    .then(id => {
      req.author.plus = {id, username, link: getUsernameURL(username)}
      return id
    })
    .then(ld.userEntries)
    .then(ld.fulfillEntries)
    .then(setEntriesCalcs)
    .then(entries => {
      req.author.ludums = [...entries.map(e => e.ludum), ...req.author.ludums]
      req.author.entries = [...entries, ...req.author.entries]
      next()
    })
    .catch(error => {
      if (error.status === 404) {
        return res.status(404).send({
          code: 2404, // username not found from new LD API
          error: `<${username}> not found. It should exists at ${getUsernameURL(username)}`
        })
      }

      console.log(error)
      return res.status(500).send({
        code: 9999, // Unhandled
        error: `oh! I failed to fetch user ${username} from new LD API, please issue me at https://github.com/pjnovas/ldstats/issues`
      })
    })
}
