// TODO: improve this hardcode into a fetch from the api

// Data fetched by calling https://api.ldjam.com/vx/node/get/[ludum id]
// More info of LD API at https://github.com/pjnovas/ldstats/issues/11#issuecomment-305979066
// For getting stats: https://api.ldjam.com/vx/stats/[ludum id]

const grades = {
  'grade-01': 'Overall',
  'grade-02': 'Fun',
  'grade-03': 'Innovation',
  'grade-04': 'Theme',
  'grade-05': 'Graphics',
  'grade-06': 'Audio',
  'grade-07': 'Humor',
  'grade-08': 'Mood'
};

export default {
  '9405': { ludum: 38, grades },
  '32802': { ludum: 39, grades },
  '49883': { ludum: 40, grades },
  '73256': { ludum: 41, grades },
  '97793': { ludum: 42, grades },
  '120415': { ludum: 43, grades }
}
