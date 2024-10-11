const express  = require("express");
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const router = express.Router({mergeParams : true});
const Review = require("../models/review.js");
const {validateReview,isLoggedIn,isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");
const ExpressError = require("../utils/ExpressError.js");

//Review
router.post("/",isLoggedIn,validateReview,wrapAsync (reviewController.createReview));

//Delete review route
router.delete("/:revId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview));

module.exports = router;