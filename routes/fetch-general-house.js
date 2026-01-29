const express = require("express");
const { getAllHouses, getHouseById } = require("../controllers/houseController");

const router = express.Router();

// Fetch all houses (for general listing page)
router.get("/", getAllHouses);

// Fetch single house by ID (for details page)
router.get("/:id", getHouseById);

module.exports = router;
