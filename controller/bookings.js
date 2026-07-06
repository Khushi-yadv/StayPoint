const Booking = require("../models/bookings");
const Listing = require("../models/listing");

// Booking Form Open
module.exports.renderBookingForm = async (req, res) => {
    const { listingId } = req.params;
    const listing = await Listing.findById(listingId);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    res.render("bookings/new", {listing,
    hideLayout: true
});
};


// Save Booking
module.exports.createBooking = async (req, res) => {
    const { listingId } = req.params;
    const listing = await Listing.findById(listingId).populate("owner");
    const checkIn = new Date(req.body.checkIn);
    const checkOut = new Date(req.body.checkOut);
    const existingBooking = await Booking.findOne({
    listing: listingId,
    checkIn: {
        $lt: checkOut
    },
    checkOut: {
        $gt: checkIn
    }
});
if (existingBooking) {
    req.flash(
        "error",
        "Property is not available for selected dates."
    );
    return res.redirect(
        "/listings/" + listingId
    );
}
    const nights = Math.ceil(
        (checkOut - checkIn) / (1000 * 60 * 60 * 24)
    );
    const bookingPrice = listing.price * nights;
    const tax = bookingPrice * 0.18;
    const StayPointCharge = 200;
    const totalPrice = bookingPrice + tax + StayPointCharge;
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
    const booking = new Booking({
        listing: listing._id,
        user: req.user._id,
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        checkIn: req.body.checkIn,
        checkOut: req.body.checkOut,
        guests: req.body.guests,
        specialRequest: req.body.specialRequest,
        totalPrice: totalPrice

    });
    await booking.save();
    /*// Listing ko booked mark karo
    listing.isBooked = true;
    //await booking.save();
await listing.save();*/
req.flash("success", "Booking Confirmed Successfully!");
res.render("bookings/confirmed", {
    booking,
    listing,
    totalPrice
});
};

// Show all bookings of current user
module.exports.showBookings = async (req, res) => {

    let bookings = await Booking.find({
        user: req.user._id
    }).populate("listing");
     bookings = bookings.filter(booking => booking.listing);

    res.render("bookings/index", {
        bookings
    });
};


// Cancel booking from My Bookings page
module.exports.cancelBooking = async (req, res) => {
    const booking = await Booking.findById(
        req.params.bookingId
    );
    if (!booking) {
        req.flash("error", "Booking not found.");
        return res.redirect("/bookings");
    }
    if (!booking.user.equals(req.user._id)) {
        req.flash(
            "error",
            "You cannot cancel this booking."
        );
        return res.redirect("/bookings");
    }
    await Booking.findByIdAndDelete(
        req.params.bookingId
    );
    req.flash(
        "success",
        "Booking Cancelled Successfully."
    );
    res.redirect("/bookings");
};

