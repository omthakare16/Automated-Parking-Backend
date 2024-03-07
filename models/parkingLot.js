const mongoose = require("mongoose");
const parkingLotSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    validate: /^[0-9a-fA-F]{24}$/, // Hexadecimal string of length 24
  },
  capacity: {
    type: Number,
    required: true,
    min: 0,
    max: 2000,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  slots: {
    type: [Boolean],
  },
});

parkingLotSchema.pre("save", function (next) {
  if (!this.slots || this.slots.length !== this.capacity) {
    this.slots = Array.from({ length: this.capacity }, () => false);
  }
  next();
});

module.exports = mongoose.model("ParkingLot", parkingLotSchema);
