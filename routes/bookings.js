const express = require("express");
const router = express.Router();
const Booking = require("../models/bookings");
const Listing = require("../models/listing");

const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn } = require("../middleware");

const bookingController = require("../controller/bookings");

// Show all bookings
router.get(
    "/",
    isLoggedIn,
    wrapAsync(bookingController.showBookings)
);

// Booking Form Open
router.get(
    "/:listingId",
    isLoggedIn,
    wrapAsync(bookingController.renderBookingForm)
);

// Booking Save
router.post(
    "/:listingId",
    isLoggedIn,
    wrapAsync(bookingController.createBooking)
);

// Cancel from My Bookings page
router.delete(
    "/cancel/:bookingId",
    isLoggedIn,
    wrapAsync(bookingController.cancelBooking)
);

module.exports = router;