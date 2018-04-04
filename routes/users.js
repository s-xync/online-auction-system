const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

// Register
router.get('/register', function(req, res){
  res.render('register');
});

// Login
router.get('/login', function(req, res){
  res.render('login');
});

// Register User
router.post('/register', function(req, res){
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var username = req.body.username;
  var email = req.body.email;
  var password = req.body.password;
  var password2 = req.body.password2;
  var imageurl=req.body.imageurl;

  // Validation
  req.checkBody('firstname', 'First Name is required').notEmpty();
  req.checkBody('lastname', 'Last Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();

  if(errors){
    res.render('register',{
      errors:errors
    });
  } else {
    var newUser = new User({
      firstname: firstname,
      lastname: lastname,
      email:String(email).toLowerCase(),
      username: String(username).toLowerCase(),
      password: password,
      imageurl: imageurl
    });

    User.createUser(newUser, function(err, user){
      if(err){
        console.log(err);
        req.flash('error_msg', err.name);
        res.redirect('/users/register');
      }else{
        console.log(user);
      }
    });
    req.flash('success_msg', 'You are registered and can now login');
    res.redirect('/users/login');
  }
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserByUsername(username, function(err, user){
      if(err){
        console.log(err);
        req.flash('error_msg', err.name);
        res.redirect('/users/login');
      }else{
        if(!user){
          return done(null, false, {message: 'Unknown User'});
        }
        User.comparePassword(password, user.password, function(err, isMatch){
          if(err){
            console.log(err);
            req.flash('error_msg', err.name);
            res.redirect('/users/login');
          }else{
            if(isMatch){
              return done(null, user);
            } else {
              return done(null, false, {message: 'Invalid password'});
            }
          }
        });
      }
    });
  }));

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
      done(err, user);
    });
  });

  router.post('/login',passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),function(req, res){
    res.redirect('/');
  });

  router.get('/logout', function(req, res){
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
  });

  router.get('/profile',ensureAuthenticated,function(req,res){
    var id=req.user._id;
    request.get('http://localhost:3000/auctions/api/soldby'+id,(err,response,body)=>{
      if(response.statusCode==200){
        var soldAuctions=JSON.parse(body);
      }else{
        console.log(err);
        req.flash('error_msg', err.name);
        res.redirect('/');
      }
    });
    request.get('http://localhost:3000/auctions/api/boughtby'+id,(err,response,body)=>{
      if(response.statusCode==200){
        var boughtAuctions=JSON.parse(body);
      }else{
        console.log(err);
        req.flash('error_msg', err.name);
        res.redirect('/');
      }
    });
    res.render('profile',{user:req.user,soldAuctions:soldAuctions,boughtAuctions:boughtAuctions});
  });

  request.post('/addmoney',ensureAuthenticated,(req,res)=>{
    var userid=req.user._id;
    var amount=parseInt(req.body.amount);
    if(!isNan(amount) && amount>0){
      User.findById(userid,function(err,user){
        if(err){
          console.log(err);
          req.flash('error_msg', err.name);
          res.redirect('/');
        }
        if(user){
          user.balance=user.balance+amount;
          user.save(function(err){
            if(err){
              console.log(err);
              req.flash('error_msg', err.name);
              res.redirect('/');
            }else{
              req.flash('success_msg', 'Money added');
              res.redirect('/users/profile');
            }
          });
        }else{
          req.flash('error_msg','Unknown User');
      		res.redirect('/users/login');
        }
      });
    }else{
      req.flash('error_msg','Check the amount');
  		res.redirect('/users/profile');
    }
  });

  function ensureAuthenticated(req, res, next){
  	if(req.isAuthenticated()){
  		return next();
  	} else {
  		//req.flash('error_msg','You are not logged in');
  		res.redirect('/users/login');
  	}
  }
  module.exports = router;