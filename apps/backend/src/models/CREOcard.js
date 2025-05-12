const mongoose = require("mongoose");

const CREOcardSchema = new mongoose.Schema(
  {
    personalNumber: {
      type: String,
      required: true,
      unique: true,
      match: /^[0-9]{6}$/, // Reštrikcia na 6-miestne osobné číslo
      ref: "User", // Referencia na model User
    },
    balance: {
      type: Number,
      required: true,
      default: 0, // Predvolený zostatok
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CREOcard", CREOcardSchema);
