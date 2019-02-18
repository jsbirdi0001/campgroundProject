var express               = require("express"),
    app                   = express(),
    bodyParser            = require("body-parser"),
    mongoose              = require("mongoose"),
    Campgrounds           = require("./models/campgrounds"),
    Comments              = require("./models/comments"),
    seedDB                = require("./seeds"),
    passport              = require("passport"),
    localStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    User                  = require("./models/user.js")
    

seedDB();


mongoose.connect("mongodb://localhost/yelp_camp_v1");


// Campgrounds.create(
//     {name:"Beauty", url:"https://jsbirdi0001.github.io/blog/Images/img7.jpg"},function(err, created){
//         if(err){
//             console.log(err)
//         } else{
//             console.log(created);
//         }
//     })

app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(require("express-session")({
    secret: "My name is Khan",
    resave: false,
    saveUninitialized: false
    
}));
passport.use(new localStrategy(User.authenticate()));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});


app.get("/",isLoggedIn,function(req,res){
    res.redirect("/campgrounds");
})
app.get("/campgrounds",isLoggedIn,function(req,res){
    Campgrounds.find({},function(err,all){
        if(err){
            console.log(err)
        } else{
            res.render("campgrounds",{post:all})
        }
    })
    
})



app.post("/campgrounds",isLoggedIn,function(req,res){
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.description;
    var obj = {name: name, url: image, description: desc};
    
    Campgrounds.create(obj,function(err,created){
        if(err){
            console.log(err)
        } else {
            console.log(created)
        }
    })
    res.redirect("/campgrounds");
})

app.get("/campgrounds/new",isLoggedIn,function(req,res){
    res.render("newcampgrounds");
})



app.get("/campground/:id",isLoggedIn,function(req,res){
    Campgrounds.findById(req.params.id).populate("comments").exec(function(err, found){
        if(err){
            console.log(err);
        } else{
            res.render("show",{post:found})
        }
    })
})


app.get("/campgrounds/:id/comment/new",isLoggedIn,function(req,res){
    Campgrounds.findById(req.params.id,function(err,found){
        if(err){
            console.log(err);
        } else{
            res.render("comment/newComment",{post:found});
        }
    })
    
})
app.post("/campgrounds/:id/comments",isLoggedIn,function(req,res){
    var author = req.body.author;
    var comment = req.body.comment;
    var obj = {text: comment, author: author};
    Campgrounds.findById(req.params.id,function(err, found){
        if(err){
            console.log(err);
        } else{
            Comments.create(obj,function(err,comment){
                if(err){
                    console.log(err);
                } else{
                    found.comments.push(comment);
                    found.save();
                    res.redirect("/campground/" + req.params.id);
                }
            })
        }
    })
})


// Auth Routes
app.get("/login",function(req, res){
    res.render("login");
})
app.get("/register",function(req, res){
    res.render("register");
})
app.post("/register", function(req,res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, created){
        if(err){
            console.log(err);
            res.render("register");
        } else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/campgrounds");
            })
        }
    } )
})

app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req, res){
});
app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/")
})


function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}







app.listen(process.env.PORT, process.env.IP, function(){
    console.log("YelpCamp has been Started");
})