const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const { generateRandomString, findUserObj, findEmail, urlsForUser} = require('./helpers');

// set ejs as the view engine
app.set("view engine", "ejs");

// global urls object
const urlDatabase = {
  b2xVn2: { 
    longURL: "http://www.lighthouselabs.ca",
    userID: "b2xVn2",
  },
  sm5xK9: {
    longURL: "http://www.google.com",
    userID: "sm5xK9",
  },
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
  if (id) {
    res.redirect("/urls");
  } else {
    res.render("registration", templateVars);
  }
});

// render login page if user logged in
app.get("/login", (req, res) => {
  var id = req.cookies["username"];
  const templateVars = { user: users[id] };
  if (id) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});


// route for /urls to render urls ejs template in views folder
app.get("/urls", (req, res) => {
  var id = req.cookies["username"];
  if (id) {
    const templateVars = { urls: urlDatabase[id], user: users[id] };
    res.render("urls_index", templateVars);
  }
});

// get route to render the urls_new.ejs template
app.get("/urls/new", (req, res) => {
  var id = req.cookies["username"];
  const templateVars = { user: users[id] };
  if (!id) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

// add route to render urls_show.ejs template
app.get("/urls/:id", (req, res) => {
  var id = req.cookies["username"];
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: users[id] };
  if (!id) {
    return res.status(400).send('Please Login or Register');
  } else {
    res.render("urls_show", templateVars);
  }
});


// //edit / show tiny url
// app.get("/urls/:shortURL", (req, res) => {
//   if (!req.session["userID"]) {
//     res.status(400).send("400 error ! Please Login or Register");
//   } else if (!urlDatabase[req.params.shortURL]) {
//     res.status(404).send("404 not found! This URL doesn't exist");
//   } else if (urlDatabase[req.params.shortURL].userID === req.session["userID"]) {
//     const templateVars = {
//       shortURL: req.params.shortURL,
//       longURL: urlDatabase[req.params.shortURL].longURL,
//       user: users[req.session["userID"]]
//     };
//     res.render("urls_show", templateVars);
//   } else if (urlDatabase[req.params.shortURL].userID !== req.session["userID"]) {
//     res.status(403).send("403 error ! This is not your URL");
//   } else {
//     res.status(400).send("400 error ! Please Login");
//   }
// });


// Redirect any request to "/u/:id" to its longURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// route that genearte short id and adds to urlDatabase, longURL must start with http://, if user is logged in
app.post("/urls", (req, res) => {
  var id = req.cookies["username"];
  if (!id) {
    return res.status(400).send('Only logged in users can shorten urls.')
  } else {
    const id = generateRandomString();
    urlDatabase[id] = { longURL: req.body.longURL, userID: id }
    res.redirect(`/urls/${id}`);
  }
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
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
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
        password: bcrypt.hashSync(req.body.password, 10),
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
