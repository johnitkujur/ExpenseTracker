const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Transaction = require("../models/transaction");
const enumCategory = require("../models/transaction").enumCategory;
// TODO: add notification array
// TODO: add unique username 

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) throw new Error("Not valid");
    },
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
  },
  age: {
    type: Number,
    default: 0,
    validate(value) {
      if (value < 0) throw new Error("Age cant be negative");
    },
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

userSchema.pre("remove", async function (next) {
  const user = this;
  await Transaction.deleteMany({ owner: user._id });
  next();
});


userSchema.virtual('transaction', {
  ref: 'Transaction',
  localField: '_id',
  foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.tokens;
  return user;
};

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign(
    {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      enumCategory: enumCategory,
    },
    process.env.JWT_SECRET
  );
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.statics.checkCredential = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Wrong email or password");
  }
  if (!(await bcrypt.compare(password, user.password)))
    throw new Error("Wrong email or password");
  return user;
};

const User = new mongoose.model("User", userSchema);

module.exports = User;
