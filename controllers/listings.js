const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = (async (req,res) => {
    const allListings = await Listing.find({});
    res.render("./listings/index.ejs",{allListings}); 
});

module.exports.renderNewForm = (req,res) =>{
    res.render("./listings/new.ejs");
}

module.exports.showListing = async (req,res) => {
    let {id} = req.params;
    let listing = await Listing.findById(id)
    .populate({
        path :"review",
        populate : {
            path : "author",
        },
    })
    .populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("./listings/show.ejs",{listing});
}

module.exports.createListing = async (req,res,next) => {
    let coordinates =await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
      })
        .send();
    let url = req.file.path;
    let filename = req.file.filename;
    let newListings = new Listing(req.body.listing);
    console.log(newListings);
    newListings.owner = req.user._id;
    newListings.image = {url,filename};
    newListings.geometry = coordinates.body.features[0].geometry;
    await newListings.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");

}

module.exports.renderEditForm = async (req,res) =>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
     req.flash("error","Listing you requested for does not exist!");
     res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = listing.image.url.replace("/upload","/upload/w_250");
    res.render("./listings/edit.ejs", {listing,originalImageUrl} );
}

module.exports.updateListing = async (req,res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});

    if(typeof req.file != "undefined"){
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url,filename};
        await listing.save();
    }
    req.flash("success","Listing Updated");
    res.redirect(`/listings/${id}`);
}

module.exports.search = async (req,res) => {
    console.log(req.query.q);
    let input = req.query.q.trim().replace(/\s+/g, " ");
    console.log(input);
    if (input == "" || input == " ") {
        req.flash("error", "Search value empty !!!");
        res.redirect("/listings");
      }
    
      let data = input.split("");
      let element = "";
      let flag = false;
      for (let index = 0; index < data.length; index++) {
        if (index == 0 || flag) {
          element = element + data[index].toUpperCase();
        } else {
          element = element + data[index].toLowerCase();
        }
        flag = data[index] == " ";
      }
      console.log(element);
      let allListings = await Listing.find({
        location: { $regex: element, $options: "i" },
      });
      if (allListings.length != 0) {
        res.locals.success = "Listings searched by Location";
        res.render("listings/index.ejs", { allListings });
        return;
      }
    
      if (allListings.length == 0) {
        allListings = await Listing.find({
          country: { $regex: element, $options: "i" },
        }).sort({ _id: -1 });
        if (allListings.length != 0) {
          res.locals.success = "Listings searched by Location";
          res.render("listings/index.ejs", { allListings });
          return;
        }
      }
      if (allListings.length == 0) {
        req.flash("error", "Your Destination is not found !!!");
        res.redirect("/listings");
      }
};

module.exports.destroyListing = async (req,res) =>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted");
    res.redirect("/listings");
}