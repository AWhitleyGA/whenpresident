var mongoose = require('mongoose')

var CandidateSchema = mongoose.Schema({
  name: String,
  year: Number,
})

mongoose.model("Candidate", CandidateSchema)
mongoose.Promise = global.Promise

mongoose.connect("mongodb://localhost/whenpresident")

module.exports = mongoose
