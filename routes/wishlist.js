const express = require("express");
const router = express.Router();

const wishlistController = require("../controller/wishlist");

const { isLoggedIn } = require("../middleware");

// Show Wishlist
router.get("/", isLoggedIn, wishlistController.showWishlist);

// Add to Wishlist
router.post("/:listingId", isLoggedIn, wishlistController.addToWishlist);

// Toggle Wishlist (AJAX)
router.post("/toggle/:listingId", isLoggedIn, wishlistController.toggleWishlist);

// Remove from Wishlist
router.delete("/:id", isLoggedIn, wishlistController.removeWishlist);

module.exports = router;