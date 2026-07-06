const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const wishlistSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
        required: true
    }
}, {
    timestamps: true
});
module.exports = mongoose.model("Wishlist", wishlistSchema);