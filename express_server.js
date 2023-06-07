const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

function generateRandomString() {
  let s = '';
  s += Math.random().toString(36).slice(2);
  return s.slice(0, 6);
}

// set ejs as the view engine
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

// route for /urls to render urls ejs template in views folder
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// add GET route to render the urls_new.ejs template
// urls_new has form whose method is set to POST
// The form has one named input, with the name attribute set to longURL
// when the form is submitted, it will make a request to POST /urls, and the body will contain one URL-encoded name-value pair with the name longURL
// data in the input field will be avaialbe to us in the req.body.longURL variable, which we can store in our urlDatabase object
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// add route to render urls_show.ejs template
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

// route that logs the request body and gives a dummy response
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});