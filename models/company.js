const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  skills: {
    type: [String],
    required: true,
  },
  redirectUrl: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
});

const Company = mongoose.model('Company', companySchema);

module.exports = Company;
