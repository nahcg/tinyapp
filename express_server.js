const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
app.use(cookieParser());

function generateRandomString() {
  let s = '';
  s += Math.random().toString(36).slice(2);
  return s.slice(0, 6);
}

// set ejs as the view engine
app.set("view engine", "ejs");

// global urls object
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// global users object
const users = { };

// middleware from body-parser library that converts the request body from a Buffer into string that can be read
app.use(express.urlencoded({ extended: true }));

// registers a handler on the root path, "/".
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// add additional endpoints
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// sending HTML in response
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// render registration page
app.get("/urls/register", (req, res) => {
  var id = req.cookies["username"];
  const templateVars = { user: users[id] };
  res.render("registration", templateVars);
});

// route for /urls to render urls ejs template in views folder
app.get("/urls", (req, res) => {
  var id = req.cookies["username"];
  const templateVars = { urls: urlDatabase, user: users[id] };
  res.render("urls_index", templateVars);
});

// add GET route to render the urls_new.ejs template
// urls_new has form whose method is set to POST
// The form has one named input, with the name attribute set to longURL
// when the form is submitted, it will make a request to POST /urls, and the body will contain one URL-encoded name-value pair with the name longURL
// data in the input field will be avaialbe to us in the req.body.longURL variable, which we can store in our urlDatabase object
app.get("/urls/new", (req, res) => {
  var id = req.cookies["username"];
  const templateVars = { user: users[id] };
  res.render("urls_new", templateVars);
});

// add route to render urls_show.ejs template
app.get("/urls/:id", (req, res) => {
  var id = req.cookies["username"];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[id] };
  res.render("urls_show", templateVars);
});

// Redirect any request to "/u/:id" to its longURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// route that genearte short id and adds to urlDatabase, longURL must start with http://
app.post("/urls", (req, res) => {
  const id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

// deletes url
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// update url
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.updateURL;
  res.redirect("/urls");
});

// set name of cookie to username in login page
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

// logout endpoint, clears cookie
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

// add registration info to users object
app.post("/register", (req, res) => {
  let id = generateRandomString();
  users[id] = { id: id };
  users[id].email = req.body.email;
  users[id].password = req.body.password;
  res.cookie("username", id);
  res.redirect("/urls");
});
