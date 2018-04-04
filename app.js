const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');

// Connect to mongodb using mongoose orm
mongoose.connect('mongodb://localhost/auctionaway');
var db=mongoose.connection;

// Mini Apps
var routes = require('./routes/index');
var users = require('./routes/users');
var auctions=require('./routes/auctions');

// Init App
var app = express();

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Routes to Mini Apps
app.use('/', routes);
app.use('/users', users);
app.use('/auctions',auctions);

// Set Port
app.set('port', (process.env.PORT || 3000));

app.listen(app.get('port'), function(){
	console.log('Server started on port '+app.get('port'));
});


// Auction=require('./models/auction');
// User=require('./models/user');
//
//
// //api end-points
// app.get('/api/allauctions', (req, res) => {
//   Auction.getAllAuctions((err, auctions) => {
//     if(err){
//       console.log(err);
//       res.status(500).send({error:{name:err.name,message:err._message}});
//     }else{
//       res.json(auctions);
//     }
//   });
// });
//
// app.get('/api/notoverauctions', (req, res) => {
//   Auction.getNotOverAuctions((err, auctions) => {
//     if(err){
//       console.log(err);
//       res.status(500).send({error:{name:err.name,message:err._message}});
//     }else{
//       res.json(auctions);
//     }
//   });
// });
//
// app.get('/api/getauction/:_id', (req, res) => {
//   var id=req.params._id;
//   Auction.getAuctionById(id, (err, auction) => {
//     if(err){
//       console.log(err);
//       res.status(500).send({error:{name:err.name,message:err._message}});
//     }else{
//       res.json(auction);
//     }
//   });
// });
//
// app.post('/api/addauction', (req, res) => {
//   var auction=req.body;
//   //TODO have to add code to create imageurl from uploaded image
//   Auction.addAuction(auction, (err, auction) => {
//     if(err){
//       console.log(err);
//       res.status(500).send({error:{name:err.name,message:err._message}});
//     }else{
//       res.json(auction);
//     }
//   });
// });
//
// app.delete('/api/removeauction/:_id', (req, res) => {
//   var id=req.params._id;
//   Auction.removeAuction(id, (err, auction) => {
//     if(err){
//       console.log(err);
//       res.status(500).send({error:{name:err.name,message:err._message}});
//     }else{
//       res.json(auction);
//     }
//   });
// });
//
// app.post('/api/register',(req, res) => {
//   var userinput=req.body;
//   //TODO have to add code to create imageurl from uploaded image
//   User.register(userinput, (err, user) => {
//     if(err){
//       console.log(err);
//       res.status(500).send({error:{name:err.name,message:err._message}});
//     }else{
//       res.json(user);
//     }
//   });
// });
//
// app.post('/api/login',(req, res) => {
//   var userinput=req.body;
//   User.login(userinput, (user, err, loginres) => {
//     if(user){
//       if(err){
//         console.log(err);
//         res.status(500).send({error:{name:err.name,message:err._message}});
//       }else{
//         if(loginres){
//           res.json(user);
//         }else{
//           res.status(401).send({error:{name:"Authentication Error",message:"Check Email/Password"}});
//         }
//       }
//     }else{
//       res.status(401).send({error:{name:"Authentication Error",message:"Check Email/Password"}});
//     }
//   });
// });
//
// //pages
// app.get('/', function(req, res) {
//   res.sendFile(path.join(__dirname +'/public'+ '/index.html'));
// });
//
//
// app.get('/signin', function(req, res) {
//   res.sendFile(path.join(__dirname +'/public'+ '/signin.html'));
// });
//
// app.get('/auction', function(req, res) {
//   res.sendFile(path.join(__dirname +'/public'+ '/auction.html'));
// });
//
// app.get('/itemdetails', function(req, res) {
//   res.sendFile(path.join(__dirname +'/public'+ '/itemdetails.html'));
// });
//
// app.get('/additem', function(req, res) {
//   res.sendFile(path.join(__dirname +'/public'+ '/additem.html'));
// });
//
// app.get('/profile', function(req, res) {
//   res.sendFile(path.join(__dirname +'/public'+ '/profile.html'));
// });
