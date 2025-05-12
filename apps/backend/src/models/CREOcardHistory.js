const mongoose = require("mongoose");
const CREOcardHistorySchema = new mongoose.Schema(
  {
    personalNumber: {
      type: String,
      required: true,
      match: /^[0-9]{6}$/, // Reštrikcia na 6-miestne osobné číslo
      ref: "CREOcard", // Referencia na model CREOcard
    },
    changeType: {
      type: String,
      required: true, // Typ zmeny je povinný (napr. "pridanie kreditu")
    },
    changeDate: {
      type: Date,
      required: true,
      default: Date.now, // Bežná praktika - predvolený dátum je aktuálny
    },
    reservedRoom: {
      type: String,
      default: null,
      ref: "ReservedRoom", // Referencia na model ReservedRoom
    },
    oldBalance: {
      type: Number,
      default: null, // Starý zostatok môže byť null
    },
    newBalance: {
      type: Number,
      default: null, // Nový zostatok môže byť null
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CREOcardHistory", CREOcardHistorySchema);
