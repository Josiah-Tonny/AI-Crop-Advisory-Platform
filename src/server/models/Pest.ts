const mongoose = require('mongoose');

const pestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  scientificName: {
    type: String,
    required: true,
    trim: true
  },
  affectedCrops: [{
    type: String,
    required: true,
    trim: true
  }],
  symptoms: [{
    type: String,
    required: true
  }],
  prevention: [{
    type: String,
    required: true
  }],
  treatment: [{
    type: String,
    required: true
  }],
  image: {
    type: String,
    required: false
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  description: {
    type: String,
    required: false
  },
  seasonalPrevalence: [{
    season: {
      type: String,
      enum: ['Spring', 'Summer', 'Autumn', 'Winter', 'Wet Season', 'Dry Season'],
    },
    prevalence: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
pestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Pest = mongoose.model('Pest', pestSchema);

module.exports = Pest;
