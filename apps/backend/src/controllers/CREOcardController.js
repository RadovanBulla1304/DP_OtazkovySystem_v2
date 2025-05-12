const CREOcard = require("../models/CREOcard");
const { body, validationResult } = require("express-validator");
const { throwError } = require("../util/universal");

// Pridanie novej CREO karty
exports.addCREOcard = [
  body("personalNumber")
    .isLength({ min: 6, max: 6 })
    .withMessage("Invalid personal number"),
  body("balance").isNumeric().withMessage("Balance must be a number"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { personalNumber, balance } = req.body;

    try {
      const newCREOcard = new CREOcard({ personalNumber, balance });
      await newCREOcard.save();
      res.status(201).json(newCREOcard);
    } catch (err) {
      throwError(`Error adding CREOcard: ${err.message}`, 500);
    }
  },
];

// Získanie všetkých CREO kariet
exports.getCREOcards = async (req, res) => {
  try {
    const cards = await CREOcard.find();
    res.status(200).json(cards);
  } catch (err) {
    throwError(`Error fetching CREOcards: ${err.message}`, 500);
  }
};
