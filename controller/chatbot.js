const Listing = require("../models/listing");
const Booking = require("../models/bookings");

module.exports.chatPage = (req, res) => {
    res.render("chatbot/index");
};
module.exports.askQuestion = async (req, res) => {
    console.log("BODY:", req.body);
    const message = req.body.message.toLowerCase();
    // SHOW MY BOOKINGS
if (
    message.includes("show my bookings") ||
    message.includes("my bookings") ||
    message.includes("show bookings")
) {
    // login check
    if (!req.user) {
        return res.json({
            reply:
            "Please login first to view your bookings."
        });
    }
    const bookings =await Booking.find({
        user: req.user._id
    }).populate("listing");
    if (bookings.length === 0) {
        return res.json({
            reply:
            "You don't have any bookings."
        });
    }
    let response ="📋 Your Active Bookings:<br><br>";
    bookings.forEach((booking) => {
    // Agar listing exist karti hai tabhi show karo
    if (booking.listing) {
        response += `
        🏠 ${booking.listing.title}<br>
        📍 ${booking.listing.location}<br>
        📅 Check-in:
        ${booking.checkIn.toDateString()}<br>
        📅 Check-out:
        ${booking.checkOut.toDateString()}<br><br>
        `;
    }
});
if (response === "📋 Your Active Bookings:<br><br>") {
    response += "No valid bookings found.";
}
    return res.json({
        reply: response
    });
}

//-----Booking count-------//

if (
    message.includes("how many bookings") ||
    message.includes("booking count")
) {
    if (!req.user) {
        return res.json({
            reply: "Please login first."
        });
    }
    const count = await Booking.countDocuments({
        user: req.user._id
    });
    return res.json({
        reply: `You currently have ${count} active bookings.`
    });
}

// ----- Cancel Booking ----- //

if (message.includes("cancel my")) {

    if (!req.user) {
        return res.json({
            reply: "Please login first."
        });
    }
    const bookings = await Booking.find({
        user: req.user._id
    }).populate("listing");
    const matchedBookings = bookings.filter(
        b =>
            b.listing &&
            message.includes(
                b.listing.location.toLowerCase()
            )
    );
    if (matchedBookings.length === 0) {
        return res.json({
            reply: "Booking not found."
        });
    }
    const specificBooking = matchedBookings.find((b) => {
       const day =b.checkIn.getDate().toString();
        const month =b.checkIn
            .toLocaleString(
                "default",
                { month: "short" }
            )
            .toLowerCase();
        return (
            message.includes(day) &&
            message.includes(month)
        );
    });
const hasDate =/\d+/.test(message) &&
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(message);
if (hasDate && !specificBooking) {
    return res.json({
        reply: "Booking not found for the specified date."
    });
}
    // specific booking mil gayi
    if (specificBooking) {

        await Booking.findByIdAndDelete(
            specificBooking._id
        );

        return res.json({
            reply:
            `Your booking for ${
                specificBooking.listing.location
            } on ${
                specificBooking.checkIn.toDateString()
            } has been cancelled successfully.`
        });
    }

    // agar same location ki multiple bookings hain
    if (matchedBookings.length > 1) {
        let response =
            `You have multiple bookings for ${matchedBookings[0].listing.location}:<br><br>`;
        matchedBookings.forEach((b) => {
            response +=
                `• ${b.checkIn.toDateString()} - ${b.checkOut.toDateString()}<br>`;
        });
        response +=
            `<br>Please specify the booking date.<br><br>
            Example:<br>
            cancel my ${
                matchedBookings[0]
                .listing
                .location
                .toLowerCase()
            } booking ${
                matchedBookings[0]
                .checkIn
                .getDate()
            } ${
                matchedBookings[0]
                .checkIn
                .toLocaleString(
                    'default',
                    { month:'short' }
                )
                .toLowerCase()
            }`;
        return res.json({
            reply: response
        });
    }

    // agar sirf ek booking hai
    const booking = matchedBookings[0];

    await Booking.findByIdAndDelete(
        booking._id
    );

    return res.json({
        reply:
        `Your booking for ${
            booking.listing.location
        } has been cancelled successfully.`
    });
}


    // BOOKING SUPPORT

if (message.includes("cancel")) {
    return res.json({
        reply:
        `There are two ways to cancel your booking:<br><br>
        <b>Option 1:</b> Open My Bookings and click the
        Cancel Booking button.<br><br>
        <b>Option 2:</b> Use the chatbot command:<br>
        cancel my [location] booking<br><br>
        Example:<br>
        cancel my goa booking<br><br>
        If you have multiple bookings for the same location, specify the date:<br>
        cancel my goa booking 7 jul`
    });
}
    if (message.includes("booking history")) {
        return res.json({
            reply:
                "You can view your booking history from your profile section."
        });
    }
    if (message.includes("contact")) {
        return res.json({
            reply:
                "You can contact the property owner from the property details page."
        });
    }

    // PROPERTY SEARCH

    let filter = {};

    if (message.includes("goa")) {
        filter.location = {
            $regex: "goa",
            $options: "i"
        };
    }
    if (message.includes("villa")) {
        filter.category = "Villa";
    }
    const price = message.match(/\d+/);
    if (price) {
        filter.price = {
            $lte: Number(price[0])
        };
    }
    const listings = await Listing.find(filter).limit(3);
    if (listings.length > 0) {
        let answer = "Recommended stays:<br><br>";
        listings.forEach((listing) => {
            answer += `
                🏠 ${listing.title}<br>
                📍 ${listing.location}<br>
                💰 ₹${listing.price}/night<br><br>
            `;
        });
        return res.json({
            reply: answer
        });
    }
    return res.json({
        reply:
            "Sorry, I couldn't find matching properties."
    });
};