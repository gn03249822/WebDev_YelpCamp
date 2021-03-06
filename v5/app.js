var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    Campground  = require("./models/campground"),
    seedDB      = require("./seeds"),
    Comment     = require("./models/comment");
   
   
//CONFIG
mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended:true}));
//tell express to serve the public directory
app.use(express.static(__dirname+"/public"));
app.set("view engine", "ejs");
//generate the seeding data
seedDB();


//LANDING PAGE
app.get("/", function(req,res){
    
    res.render("landing");
});



//INDEX ROUTE
app.get("/campgrounds", function(req, res){
    //GET all campgrounds from the database
    Campground.find({},function(err,allCampgrounds){
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/index", {campgrounds:allCampgrounds});
        }
    });
  
}); 

//NEW ROUTE
app.get("/campgrounds/new", function(req,res){
    res.render("campgrounds/new");
});

//CREATE ROUTE
app.post("/campgrounds", function(req, res){
    //get data from the form and add to campgrounds array
    var name = req.body.name;
    var image = req.body.image;
    var des = req.body.description;
    var newCampground = {name:name, image:image, description:des};
    
    //add the newly created campground to the database
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        }else{
            //yes we do have two campgrounds routes, but for redirect,
            //the default route is to the GET request
            res.redirect("/campgrounds");   
        }
    });
});


//SHOW ROUTE
app.get("/campgrounds/:id", function(req, res){
    
    //find the campground with the id
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        }else{
           // console.log(foundCampground);
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
    
});

//=====================
//  COMMENTS ROUTES
//=====================

//NEW ROUTE
app.get("/campgrounds/:id/comments/new", function(req,res){
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            console.log(err);
        }else{
            res.render("comments/new", {campground:campground}); //pass in the data campground to our template
        }
    });
    
});

//CREATE ROUTE
app.post("/campgrounds/:id/comments", function(req, res){
    //look up campground using ID
    Campground.findById(req.params.id,function(err,campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        }else{
             //create new comment
            Comment.create(req.body.comment,function(err, comment){
                if(err){
                    console.log(err);
                }else{
                    //connect new comment to campground
                    campground.comments.push(comment);
                    campground.save();
                    //redirect to the SHOW page
                    res.redirect("/campgrounds/"+campground._id);
                }
            });
        }
    });
});
app.listen(process.env.PORT, process.env.IP, function(){

    console.log("The Yelp Camp server has started！");
});
