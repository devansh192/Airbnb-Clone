const express = require("express");
const router = express.Router({mergeParams: true}); // merge params for parent file app.js to acess child file review.js
const wrapAsync = require("../utils/wrapAsync.js"); 
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview } = require("../middleware.js");
const {isLoggedIn} = require("../middleware.js"); 
const {isReviewAuthor} = require("../middleware.js"); 

const reviewController = require("../controllers/reviews.js");
 
// Reviews Post Route
router.post("/", isLoggedIn, validateReview, 
    wrapAsync(reviewController.createReview)
);

// Review Delete route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, 
    wrapAsync(reviewController.destroyReview));

module.exports = router;

