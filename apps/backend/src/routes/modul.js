const express = require("express");
const {
    createModul,
    getAllModuls,
    getModulById,
    getModulsBySubject,
    editModul,
    deleteModul
} = require("../controllers/modulController");

const router = express.Router();

router.post("/", createModul);
router.get("/", getAllModuls);
router.get("/:id", getModulById);
router.get("/subject/:subjectId", getModulsBySubject);
router.put("/:id", editModul);
router.delete("/:id", deleteModul);

module.exports = router;