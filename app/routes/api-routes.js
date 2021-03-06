// *********************************************************************************
// api-routes.js - this file offers a set of routes for sending users to the various html pages based on api request they make
// *********************************************************************************

// Dependencies
// =============================================================
var path = require("path");
var writeUserToDb = require("../../lib/createUser.js");
var Users = require("../models/users.js");
var Game = require("../models/game.js");
var bodyParser = require('body-parser');
const bcrypt = require("bcryptjs");

// Routes
// =============================================================
module.exports = function(app) {

  app.use(bodyParser.json()); 
  app.use(bodyParser.urlencoded({ extended: true })); 
  
  app.post("/api/new_user", function(req, res) {
    writeUserToDb(req.body.firstName, req.body.lastName, req.body.email, req.body.password, res);
  });

  app.post("/api/sign", function(req, res) {
    Users.findOne({
        where: {
          email: req.body.email,
        }      
        }).then(function(result) {
          if (! result) {
            var messageData = {msg: "Authentication Failed!"};
            res.render("signin", {message: messageData}); 
            return;
          }
      
          bcrypt.compare(req.body.password, result.password, function(err, authenticated) {            
            if (authenticated) {
              req.session.user = req.body.email;
              res.redirect("/");
            }
            else {
              var messageData = {msg: "Authentication Failed!"};
              res.render("signin", {message: messageData}); 
            }
          });
        })
  });

  app.get("/api/users", function(req, res) {
    Users.findAll({}).then(function(results) {
      res.render("signin");
    });
  });

  app.post("/api/sign_out", function(req, res) {
    if (req.session.user) {
      req.session.user = null;
    }
    var messageData = {msg: "Successfully logged out"};
    res.render("signin", {message: messageData}); 
  });
  
  app.post("/api/add_score/:game", function(req, res) {

    Game.findOne({
      where: {
        email: req.body.email,
      }
    }).then(function(result) {
      let newScore = parseInt(result.score) + parseInt(req.body.inputScore);
        Game.update(
          {
            score: newScore,
          },
          {
            where: {
              email: req.body.email,
            }
          }
          )
          .then(function() {
            res.redirect("/");
          });
      });
    });
};





