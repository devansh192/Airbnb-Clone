const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn} = require("../middleware.js"); // curly braces important
const {isOwner} = require("../middleware.js");
const {validateListing} = require("../middleware.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});

const listingController = require("../controllers/listings.js"); 

// combine routes for simplicity using router.route
router.route("/")
.get(wrapAsync(listingController.index)) // index route
.post(isLoggedIn, upload.single('listing[image][url]'),
    validateListing,  //validates if data is according to schema 
    wrapAsync(listingController.createListing)
);

// new route is before show route as server will think /new as an id which is
// in the show route link /:id
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
.get(wrapAsync(listingController.showListing)) // show route 
.put(isLoggedIn, isOwner, upload.single('listing[image][url]'),
 validateListing, // update route
    wrapAsync(listingController.updateListing) 
)
.delete(isLoggedIn, isOwner,  // delete route 
    wrapAsync(listingController.destroyListing)
);

// edit route
router.get("/:id/edit", isLoggedIn, isOwner, 
    wrapAsync(listingController.renderEditForm)
);

module.exports = router;