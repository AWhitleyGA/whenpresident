var express = require("express");
var parser = require("body-parser");
var hbs = require("express-handlebars");
var mongoose = require("./db/connection");
var Candidate = mongoose.model("Candidate");

var app     = express();
var MongoSession = cmongo(session);
var env;

if(process.env.NODE_ENV !== "production"){
  var env = require("./env.json");
  process.env.session_secret = env.session_secret;
  process.env.t_callback_url = env.t_callback_url;
  process.env.t_consumer_key = env.t_consumer_key;
  process.env.t_consumer_secret = env.t_consumer_secret;
}

var Candidate = mongoose.model("Candidate");

app.set("port", process.env.PORT || 3001);
app.set("view engine", "hbs");
app.engine(".hbs", hbs({
  extname:        ".hbs",
  partialsDir:    "views/",
  layoutsDir:     "views/",
  defaultLayout:  "layout-main"
}));
app.use("/assets", express.static("public"));
app.use(parser.urlencoded({extended: true}));

app.get("/login/twitter", function(req, res){
  var postData = {
    url:    "https://api.twitter.com/oauth/request_token",
    oauth:  {
      callback:         process.env.t_callback_url,
      consumer_key:     process.env.t_consumer_key,
      consumer_secret:  process.env.t_consumer_secret
    }
  };
  request.post(postData, function(err, rawResponse){
    var response = qstring.parse(rawResponse.body);
    var querystring = qstring.stringify({
      oauth_token: response.oauth_token
    });
    req.session.temp_token  = response.oauth_token;
    req.session.temp_secret = response.oauth_token_secret;
    res.redirect("https://api.twitter.com/oauth/authenticate?" + querystring);
  });
});

app.get("/candidates", function(req, res){
  Candidate.find({}).then((candidates) => {
    res.render("candidates-index", {
      candidates: candidates,
    });
  })
});

app.get("/candidates/:name", function(req, res){
  Candidate.findOne({name: req.params.name}).then((candidate) => {
    res.render("candidates-show", {
      candidate: candidate,
    });
  })
});

app.post("/candidates", function(req, res){
  Candidate.create(req.body.candidate).then((candidate) => {
    res.redirect("/candidates/" + candidate.name)
  })
});

app.post("/candidates/:name/delete", function(req, res){
  Candidate.findOneAndRemove({name: req.params.name}).then(() => {
    res.redirect("/candidates")
  })
});

app.post("/candidates/:name", function(req, res){
  Candidate.findOneAndUpdate({name: req.params.name}, req.body.candidate, {new: true}).then((candidate) => {
    res.redirect("/candidates/" + candidate.name)
  })
});

app.get("/api/candidates/:name", function(req, res){
  Candidate.findOne(req.params).then(function(candidate){
    res.json(candidate);
  });
});

app.get("/user", function(req, res){
  res.json(req.session.current_user || {failure: true});
});

app.get("/user/destroy", function(req, res){
  if(req.session.current_user){
    Candidate.findOneAndRemove(req.session.current_user).then(function(){
      req.session.destroy();
      res.redirect("/");
    });
  }else{
    res.redirect("/");
  }
});

app.put("/api/candidates/:name", function(req, res){
  if(req.session.current_user){
    Candidate.findOne(req.params).then(function(candidate){
      if(candidate._id !== req.session.current_user._id){
        res.json({failure: true});
      }else{
        Candidate.update(candidate, req.body, {new: true}).then(function(candidate){
          res.json(candidate);
        });
      }
    });
  }else{
    res.json({failure: true});
  }
});

app.get("/*", function(req, res){
  res.render("layout-main", {layout: false});
});

app.listen(app.get("port"), function(){
  console.log("It's aliiive!");
});
