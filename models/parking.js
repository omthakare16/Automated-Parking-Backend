const mongoose = require("mongoose");
const parkingSchema = new mongoose.Schema({
  parkingLotId: {
    type: String,
    required: true,
    validate: /^[0-9a-fA-F]{24}$/, // Hexadecimal string of length 24
  },
  registrationNumber: {
    type: String,
    required: true,
    validate: /^[A-Z0-9]{9}$/, // Example: MH12A1234
  },
  color: {
    type: String,
    enum: ["RED", "GREEN", "BLUE", "BLACK", "WHITE", "YELLOW", "ORANGE"],
  },
  slotNumber: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["PARKED", "LEFT"],
    default: "PARKED",
  },
});

module.exports = mongoose.model("Parking", parkingSchema);
