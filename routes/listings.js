const express  = require("express");
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {listingSchema} = require("../Schema.js");
const router = express.Router();
const {isLoggedIn,isOwner,validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

router.route("/")
  .get(wrapAsync (listingController.index))
  .post( 
    isLoggedIn,
    upload.single("listing[image]"), 
    validateListing,
    wrapAsync (listingController.createListing));
 
//New Route
router.get("/new",isLoggedIn,listingController.renderNewForm);  

router.get("/search",isLoggedIn,wrapAsync(listingController.search));
router
  .route("/:id")
  .get(isLoggedIn, wrapAsync (listingController.showListing))
  .put(isLoggedIn,  upload.single("listing[image]"), validateListing,isOwner  ,wrapAsync (listingController.updateListing))
  .delete(isLoggedIn,isOwner, wrapAsync (listingController.destroyListing));

//Edit Route
router.get("/:id/edit" ,isLoggedIn ,isOwner, wrapAsync (listingController.renderEditForm));



module.exports = router;