const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const ReservedRoomSchema = new mongoose.Schema(
  {
    roomId: {
      type: Number,
      unique: true, // Auto-incrementované ID
    },
    roomName: {
      type: String,
      required: true, // Názov miestnosti je povinný
    },
    isOccupied: {
      type: Boolean,
      required: true,
      default: false, // Predvolene miestnosť nie je obsadená
    },
  },
  { timestamps: true }
);

// Pridanie autoincrement na `roomId`
ReservedRoomSchema.plugin(AutoIncrement, { inc_field: "roomId" });

module.exports = mongoose.model("ReservedRoom", ReservedRoomSchema);
