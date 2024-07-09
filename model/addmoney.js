const mongoose = require('mongoose');

const MoneyAddSchema = new mongoose.Schema({
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

module.exports = mongoose.model('Addmoney', MoneyAddSchema);
