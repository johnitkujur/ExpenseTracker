const mongoose = require("mongoose");

const enumCategory = ['Food', 'Transportation', 'Bills', 'Investment', 'Others'];

const transactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  category: {
    type: String,
    enum: enumCategory,
    required: true,
  },
  note: {
    type: String,
    trim: true,
  },
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports.transaction = Transaction;
module.exports.enumCategory = enumCategory;
