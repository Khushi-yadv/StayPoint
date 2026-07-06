const Listing=require("../models/listing");
const Booking = require("../models/bookings");
const Wishlist = require("../models/wishlist");
const axios=require("axios");

//new

module.exports.renderNewForm = async (req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing=async (req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
            path: "author",
        },
    })
    .populate("owner");

    const booking = await Booking.findOne({
    listing: listing._id,
}).populate("user");

    if(!listing){
         req.flash("error","Listing you requested does not exit!");
         res.redirect("/listings");
        }else{
            console.log(listing);
    let isWishlisted = false;

if (req.user) {

    const wishlist = await Wishlist.findOne({
        user: req.user._id,
        listing: listing._id
    });

    if (wishlist) {
        isWishlisted = true;
    }

}

res.render("listings/show.ejs", {
    listing,
    booking,
    isWishlisted,
    currUser: req.user
});
    }
};


module.exports.createListing= async (req,res,next)=>{
        const geoResponse=await axios.get("https://nominatim.openstreetmap.org/search",{
            params: {
                q: req.body.listing.location,
                format: "json",
                limit: 1
            },
            headers: {
                "User-Agent": "gharjaisaghar/1.0(khushiydav12@gmail.com)"
            }
        });
        let lat=null;
        let lon=null;
        if(geoResponse.data&&geoResponse.data.length>0){
            lat=geoResponse.data[0].lat;
            lon=geoResponse.data[0].lon;
        }
        if(!lat||!lon){
            req.flash("error","Could not find location.Please enter a valid location");
            return res.redirect("/listings/new");
        }
        const newListing=new Listing({...req.body.listing,geometry:{
            type:"Point",
            coordinates:[lon,lat],
        },
        owner: req.user._id,
        image: {
            url:req.file.path,
            filename:req.file.filename
        }
    });
        const listing = await newListing.save();
        console.log(listing);
        req.flash("success","New Listing Created!");
        res.redirect("/listings");
};


module.exports.renderEditForm=async (req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    if(!listing){
         req.flash("error","Listing you requested does not exit!");
         res.redirect("/listings");
        }
    let originalImageUrl=listing.image.url;
    originalImageUrl=originalImageUrl.replace("/upload","/upload/h_300,w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
};

module.exports.bookListing = async (req, res) => {

    req.flash(
        "success",
        "Listing booked successfully!"
    );

    res.redirect(
        `/listings/${req.params.id}`
    );
};

module.exports.index = async (req, res) => {

    const { category, search } = req.query;

    let filter = {};

    if (category) {
        filter.category = category;
    }

    if (search) {
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } },
            { country: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } }
        ];
    }

    const allListings = await Listing.find(filter);

    const bookings = await Booking.find({})
        .populate("user")
        .populate("listing");

    let wishlistIds = [];

    if (req.user) {

        const wishlist = await Wishlist.find({
            user: req.user._id
        });

        wishlistIds = wishlist.map(item => item.listing.toString());

    }

    res.render("listings/index.ejs", {
        allListings,
        search,
        bookings,
        wishlistIds
    });

};


module.exports.updateListing=async (req,res)=>{
    let {id}=req.params;
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});

    if(typeof req.file !=="undefined"){
    let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    }
    await listing.save();
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteListing=async(req,res)=>{
    let {id}=req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
     req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};