if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
  
const express = require("express");
const app = express();
const mongoose = require("mongoose"); 
const path = require("path");
const methodOverride = require("method-override");
const { render } = require("ejs");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;

main().catch(err => console.log(err)); 

main().then((res) => {
    console.log("Connected to DB");
})
.catch((err) => {
    console.log(err);
})
async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true})); // to parse data 
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public"))); 

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600, 
});

store.on("error", (err)=> {
    console.log("ERROR IN MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
    }
};

// app.get("/", (req, res) => {
//     res.send("Hi I am root");
// })



app.use(session(sessionOptions));
app.use(flash()); // comes before routes as we need to print flash message

// middlewares for doing authentication in web app
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); // store user data in session
passport.deserializeUser(User.deserializeUser()); // remove user data in session

//middleware for flash messages
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    console.log(res.locals.success);
    next();
})

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "deltastudent",
//     });

//     let registeredUser = await User.register(fakeUser, "helloworld"); // register new user instance with a given password 
//     res.send(registeredUser);  
// })



// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Delhi",
//         country: "Bharat"
//     })
//     await sampleListing.save() ;
//     console.log("Sample was saved");
//     res.send("Successful testing"); 
// });



 

// to use all routes of listings from another file in routes folder
app.use("/listings", listingRouter); 

// to use review routes
app.use("/listings/:id/reviews", reviewRouter );
//to use user login , signup routes
app.use("/", userRouter);




// when any route could not handle error then this will handle for all routes
app.use((req, res ,next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

//error handling middleware
app.use((err, req, res, next) => {
    let {statusCode = 500, message = "Something went wrong!"} = err;
    res.status(statusCode).render("listings/error.ejs", {message}); 
    //res.status(statusCode).send(message); 
    
})


app.listen(8080, () => {
    console.log("Server is listening on port 8080");
})