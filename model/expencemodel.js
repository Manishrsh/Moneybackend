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
          type: Date,
          default: Date.now, // Automatically sets the current date and time
        // You can use this field to store dates in ISO format
      }
   
});

module.exports = mongoose.model('Expence', ExpenceSchema);
