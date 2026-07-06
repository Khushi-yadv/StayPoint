const express = require("express");
const router = express.Router();

const chatbotController =
    require("../controller/chatbot");

// chatbot page
router.get(
    "/",
    chatbotController.chatPage
);

// chatbot API
router.post(
    "/ask",
    chatbotController.askQuestion
);

module.exports = router;