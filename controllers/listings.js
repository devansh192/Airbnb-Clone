const Listing = require("../models/listing"); 
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({})
        //console.log(res);
        res.render("listings/index.ejs", {allListings});
}

module.exports.renderNewForm = (req, res,) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({path: "reviews", populate: {
        path: "author",
        },
    })
    .populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested for does not exist !");
        res.redirect("/listings");
    }
    //console.log(listing);
     res.render("listings/show.ejs", {listing});
} 


module.exports.createListing = async (req, res, next) => {
    let geoData =  await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
    }).send();
    //console.log(response.body.features[0].goemetry);
    //res.send("done!");
    //console.log("GEODATA 👉", JSON.stringify(geoData.body, null, 2));
        let url = req.file.path;
        let filename = req.file.filename;
        const newListing = new Listing(req.body.listing);
        newListing.geometry = {
            type: "Point", // vvvvvvvvvvimp as mongoose thinks it as type type nesting
            coordinates: geoData.body.features[0].geometry.coordinates
        };
        //newListing.geometry = geoData.body.features[0].goemetry;
        newListing.owner = req.user._id;
        newListing.image = {url, filename};
        //console.log("BEFORE SAVE 👉", newListing.geometry);

        await newListing.save();
        //console.log(savedListing);
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
    }


module.exports.renderEditForm = async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist !");
        res.redirect("/listings");
    }
    // reconfigure the pixels of image being rendered
    let originalImageUrl = listing.image.url;
    originalImageUrl  = originalImageUrl.replace("/upload", "/upload/fw_250");
    res.render("listings/edit.ejs", {listing, originalImageUrl});
}


module.exports.updateListing = async(req, res) => { 
    let {id} = req.params;
    // normalize image if empty
    // if (!req.body.listing.image || !req.body.listing.image.url) {
    // req.body.listing.image = {};
    // } 
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    if(typeof req.file !== "undefined"){ // if user has given file then only it will be saved 
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
    }
    req.flash("success", "Listing Updated!"); 
    res.redirect(`/listings/${id}`); 
}


module.exports.destroyListing = async (req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
     req.flash("success", "Listing Deleted!"); 
    res.redirect("/listings");
}
