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
    responsibility: {
    type: String,
    
  },
  skills: {
    type: [String],
    required: true,
  },
  stipend:{
    type:number,
  },
  qualification: {
    type: String,
    
  },
  bonusQualification: {
    type: String,
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
