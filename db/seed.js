var mongoose = require('./connection.js')
var seedData = require('./seeds.json')

var Candidate = mongoose.model('Candidate')

Candidate.remove({}).then(() => {
  Candidate.collection.insert(seedData)
    .then(() => process.exit())
}).catch((error) => {
  console.log(error)
})
