const express = require("express");
const ParkingLot = require("../models/parkingLot");
const Parking = require("../models/parking");

const router = express.Router();

router.post("/ParkingLots", async (req, res) => {
  try {
    const { id, capacity } = req.body;
    const parkingLot = new ParkingLot({ id, capacity });
    await parkingLot.save();

    // Extracting necessary fields for the response
    const response = {
      id: parkingLot.id,
      capacity: parkingLot.capacity,
      isActive: parkingLot.isActive,
    };

    res.json({
      isSuccess: true,
      response,
    });
  } catch (error) {
    res.status(500).json({
      isSuccess: false,
      error: {
        reason: error.message,
      },
    });
  }
});

router.post("/Parkings", async (req, res) => {
  try {
    const { parkingLotId, registrationNumber, color } = req.body;
    const parkingLot = await ParkingLot.findOne({ id: parkingLotId });
    if (!parkingLot) {
      return res.status(400).json({
        isSuccess: false,
        error: {
          reason: "Invalid Parking Lot ID",
        },
      });
    }

    const availableSlotIndex = parkingLot.slots.findIndex((slot) => !slot);

    if (availableSlotIndex === -1) {
      return res.status(400).json({
        isSuccess: false,
        error: {
          reason: "Parking lot is full",
        },
      });
    }

    const parking = new Parking({
      parkingLotId,
      registrationNumber,
      color,
      slotNumber: availableSlotIndex + 1,
      status: "PARKED",
    });

    parkingLot.slots[availableSlotIndex] = true;
    await Promise.all([parking.save(), parkingLot.save()]);

    res.json({
      isSuccess: true,
      response: {
        slotNumber: parking.slotNumber,
        status: parking.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      isSuccess: false,
      error: {
        reason: error.message,
      },
    });
  }
});

router.delete("/Parkings", async (req, res) => {
  try {
    const body = req.body;
    const { parkingLotId, registrationNumber } = body;
    console.log(req.body);
    const parkingLot = await ParkingLot.findOne({ id: parkingLotId });
    if (!parkingLot) {
      return res.status(400).json({
        isSuccess: false,
        error: {
          reason: "Invalid Parking Lot ID",
        },
      });
    }

    const parking = await Parking.findOneAndUpdate(
      { parkingLotId, registrationNumber, status: "PARKED" },
      { status: "LEFT" },
      { new: true }
    );

    if (!parking) {
      return res.status(400).json({
        isSuccess: false,
        error: {
          reason: "Car not found or already left",
        },
      });
    }

    parkingLot.slots[parking.slotNumber - 1] = false; // Subtracting 1 to convert to 0-based index
    await Promise.all([parking.save(), parkingLot.save()]);

    res.json({
      isSuccess: true,
      response: {
        slotNumber: parking.slotNumber,
        registrationNumber: parking.registrationNumber,
        status: parking.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      isSuccess: false,
      error: {
        reason: error.message,
      },
    });
  }
});

router.get("/Parkings", async (req, res) => {
  try {
    const { color, parkingLotId } = req.query;
    const registrations = await Parking.find({
      color,
      parkingLotId,
      status: "PARKED",
    }).sort({ _id: 1 });

    if (registrations.length === 0) {
      return res.status(400).json({
        isSuccess: false,
        error: {
          reason: `No car found with color ${color}`,
        },
      });
    }

    res.json({
      isSuccess: true,
      response: {
        registrations: registrations.map(({ color, registrationNumber }) => ({
          color,
          registrationNumber,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      isSuccess: false,
      error: {
        reason: error.message,
      },
    });
  }
});

router.get('/Slots', async (req, res) => {
  try {
    const { color, parkingLotId } = req.query;
    if (!['RED', 'GREEN', 'BLUE', 'BLACK', 'WHITE', 'YELLOW', 'ORANGE'].includes(color)) {
      return res.status(400).json({
        isSuccess: false,
        error: {
          reason: 'Invalid Color'
        }
      });
    }

    const slots = await Parking.find({ color, parkingLotId, status: 'PARKED' }).select('slotNumber color').sort({ slotNumber: 1 });

    res.json({
      isSuccess: true,
      response: {
        slots: slots.map(({ slotNumber, color }) => ({ slotNumber, color }))
      }
    });
  } catch (error) {
    res.status(500).json({
      isSuccess: false,
      error: {
        reason: error.message
      }
    });
  }
});


module.exports = router;
