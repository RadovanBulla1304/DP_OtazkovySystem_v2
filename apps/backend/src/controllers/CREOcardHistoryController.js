const CREOcardHistory = require("../models/CREOcardHistory");
const { body, validationResult } = require("express-validator");
const { throwError } = require("../util/universal");

// Pridanie novej histórie CREO karty
exports.addCREOcardHistory = [
  body("personalNumber")
    .isLength({ min: 6, max: 6 })
    .withMessage("Invalid personal number"),
  body("changeType").isString().withMessage("Change type must be a string"),
  body("changeDate")
    .isISO8601()
    .withMessage("Change date must be a valid date"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      personalNumber,
      changeType,
      changeDate,
      roomId,
      oldBalance,
      newBalance,
    } = req.body;

    try {
      const newHistory = new CREOcardHistory({
        personalNumber,
        changeType,
        changeDate,
        roomId: roomId || null,
        oldBalance: oldBalance || null,
        newBalance: newBalance || null,
      });
      await newHistory.save();
      res.status(201).json(newHistory);
    } catch (err) {
      throwError(`Error adding CREOcardHistory: ${err.message}`, 500);
    }
  },
];

// Získanie histórie CREO karty podľa personalNumber
exports.getCREOcardHistory = async (req, res) => {
  const { personalNumber } = req.params;

  try {
    const history = await CREOcardHistory.find({ personalNumber });
    res.status(200).json(history);
  } catch (err) {
    throwError(`Error fetching CREOcardHistory: ${err.message}`, 500);
  }
};
