const mongoose = require('mongoose');

const ExpenceSchema = new mongoose.Schema({
    amount: {
        type: String,
        required: true,
    },
    though: {
        type: String,
        required: true,
    },
    createdAt: {
        type: String,
        required: true,
      }
   
});

module.exports = mongoose.model('Expence', ExpenceSchema);
