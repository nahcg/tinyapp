const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const { generateRandomString, findUserObj, findEmail } = require('./helpers');

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
app.get("/register", (req, res) => {
  var id = req.cookies["username"];
  const templateVars = { user: users[id] };
  res.render("registration", templateVars);
});

// render login page
app.get("/login", (req, res) => {
  var id = req.cookies["username"];
  const templateVars = { user: users[id] };
  res.render("login", templateVars);
});

// route for /urls to render urls ejs template in views folder
app.get("/urls", (req, res) => {
  var id = req.cookies["username"];
  const templateVars = { urls: urlDatabase, user: users[id] };
  res.render("urls_index", templateVars);
});

// get route to render the urls_new.ejs template
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
  const user = findUserObj(req.body.email, users);
  if (user && (req.body.password === user.password)) {
    res.cookie("username", user.id);
    res.redirect('/urls');
  } else {
    return res.status(403).send('Please enter the correct username and password.');
  }
});

// logout endpoint, clears cookie
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

// add registration info to users object
app.post("/register", (req, res) => {
  if (req.body.email && req.body.password) {
    if (!findEmail(req.body.email, users)) {
      const id = generateRandomString();
      users[id] = {
        id,
        email: req.body.email,
        password: req.body.password
      };
      res.cookie("username", id);
      res.redirect("/urls");
    } else {
      return res.status(400).send('Email already registered');
    }
  } else {
    return res.status(400).send('Empty username or password');
  }
});
