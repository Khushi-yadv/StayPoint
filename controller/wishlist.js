const Wishlist = require("../models/wishlist");
const Listing = require("../models/listing");

// Add to Wishlist
module.exports.addToWishlist = async (req, res) => {
    try {
        const { listingId } = req.params;
        const userId = req.user._id;
        const existing = await Wishlist.findOne({
            user: userId,
            listing: listingId
        });
        if (existing) {
            req.flash("error", "Listing already exists in Wishlist.");
            return res.redirect(`/listings/${listingId}`);
        }
        const wishlist = new Wishlist({
            user: userId,
            listing: listingId
        });
        await wishlist.save();
        req.flash("success", "Added to Wishlist ❤️");
        res.redirect(`/listings/${listingId}`);
    } catch (err) {
        console.log(err);
        req.flash("error", "Something went wrong.");
        res.redirect("back");
    }
};

// Show Wishlist
module.exports.showWishlist = async (req, res) => {

    try {
        const wishlist = await Wishlist.find({
            user: req.user._id
        }).populate("listing");
        res.render("wishlist/index", {
            wishlist
        });
    } catch (err) {
        console.log(err);
        req.flash("error", "Unable to load Wishlist.");
        res.redirect("/listings");
    }
};

// Remove from Wishlist
module.exports.removeWishlist = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await Wishlist.findById(id);
        if (!item) {
            req.flash("error", "Wishlist item not found.");
            return res.redirect("/wishlist");
        }
        if (!item.user.equals(req.user._id)) {
            req.flash("error", "Unauthorized!");
            return res.redirect("/wishlist");
        }
        await Wishlist.findByIdAndDelete(id);
        req.flash("success", "Removed from Wishlist.");
        res.redirect("/wishlist");
    } catch (err) {
        console.log(err);
        req.flash("error", "Something went wrong.");
        res.redirect("/wishlist");
    }
};

// Toggle Wishlist (AJAX)

module.exports.toggleWishlist = async (req, res) => {
    try {
        const { listingId } = req.params;
        const userId = req.user._id;
        const existing = await Wishlist.findOne({
            user: userId,
            listing: listingId
        });
        if (existing) {
            await Wishlist.findByIdAndDelete(existing._id);
            return res.json({
                success: true,
                action: "removed"
            });
        }
        const wishlist = new Wishlist({
            user: userId,
            listing: listingId
        });
        await wishlist.save();
        res.json({
            success: true,
            action: "added"
        });
    }
    catch (err) {
        console.log(err);
        res.json({
            success: false
        });
    }
};