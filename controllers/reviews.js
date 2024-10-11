const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

module.exports.createReview = async (req,res) =>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.review.push(newReview);
    await newReview.save();
    await listing.save();
    console.log(newReview);
    req.flash("success","New Review Created!");
    res.redirect(`/listings/${listing.id}`);
}

module.exports.destroyReview = async(req,res) =>{
    let {id,revId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull : {review : revId}});
    await Review.findByIdAndDelete(revId);
    req.flash("success","Review Deleted");
    res.redirect(`/listings/${id}`);
}