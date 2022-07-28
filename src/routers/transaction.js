const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Transaction = require("../models/transaction").transaction;

router.post("/transaction", auth, async (req, res) => {
  const transaction = new Transaction(req.body);
  transaction.owner = req.user._id;
  try {
    await transaction.save();
    res.status(201).send(transaction);
  } catch (e) {
    res.status(400).send(e.message);
  }
});


router.get("/transaction", auth, async (req, res) => {
  try {
    //const transactions = await Transaction.find({ owner: req.user._id });
    const match = {};

    const {limit = "0", skip = "0"} = req.query;
    await req.user.populate({
      path: 'transaction',
      options: {
        limit: parseInt(limit),
        skip: parseInt(skip)
      }
    });
    //console.log(req.user);
    res.status(200).send(req.user.transaction);
    // res.send(transactions);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get("/transaction/all", auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ owner: req.user._id });
    var result = [];
    transactions.forEach((transaction) => {
      if (
        result.find((dup) => dup.category === transaction.category) ===
        undefined
      )
        result.push({ category: transaction.category, amount: 0 });
      var index = result.findIndex(
        (temp) => temp.category === transaction.category
      );
      result[index].amount += transaction.amount;
    });
    res.send(result);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

router.get("/transaction/:category", auth, async (req, res) => {
  console.log(req.params.category);
  try {
    const transaction = await Transaction.find({
      owner: req.user._id,
      category: req.params.category,
    });
    if (!transaction.length) {
      return res
        .status(404)
        .send(`no transaction of ${req.params.category} category`);
    }
    res.send(transaction);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.patch("/transaction/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  try {
    const transaction = await Transaction.findOne({
      owner: req.user._id,
      _id: req.params.id,
    });
    if (!transaction) {
      return res.status(404).send("No such transaction");
    }
    updates.forEach((update) => (transaction[update] = req.body[update]));
    await transaction.save();
    res.send(transaction);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.delete("/transaction/:id", auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndRemove({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!transaction) {
      return res.status(404).send("No such transaction");
    }
    res.send(transaction);
  } catch (e) {
    res.status(500).send(e.message);
  }
});

module.exports = router;
