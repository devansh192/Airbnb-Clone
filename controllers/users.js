const User = require("../models/user"); 

module.exports.renderSignUpForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signup = async(req, res) => {
    try{
    let {username, email, password} =  req.body;
    const newUser = new User({email, username});
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    //after signup redirect to login
    req.login(registeredUser, (err) => {
        if(err){
            return next(err);
        }
        req.flash("success", "Welcome to WanderLust!");
        res.redirect("/listings"); 
    })
    
    }catch(err){
        if (err.name === "UserExistsError") {
            req.flash("error", "A user is already registered with this username.");
        } else {
            req.flash("error", err.message);
        }
        res.redirect("/signup");
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
}

module.exports.login = async(req, res) => {
            req.flash("success", "Welcome back to WanderLust!");
            //redirect user to that url where it wanted to go before login
            let redirectUrl = res.locals.redirectUrl || "/listings";
            res.redirect(redirectUrl); 
};

module.exports.logout = (req, res, next) => {
     req.logOut((err) => { // since req.logout outputs a callback 
        if(err){ // if there is error then next MW is called
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");  
     })
};