// DATABASE + FUNCTIONS:
const { users, urlDatabase } = require("./database");
const {
  generateRandomString,
  checkDatabaseForURL,
  getUserByEmail,
  urlsForUser
} = require("./helpers");
const PORT = 8080;

// MIDDLEWARE + FRAMEWORK:
const express = require("express");
const cookieSession = require("cookie-session");
const methodOverride = require("method-override");
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);

// APP:
const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ["superSecretKey", "megaSecretKey"]
}));

/* ------------------------------------------------------- */

// => START SERVER:
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});


// => HOMEPAGE:
app.get("/", (req, res) => {
  return res.redirect(302, "/register");
});


// => REGISTER PAGE:
app.get("/register", (req, res) => {
  const currentUser = req.session.user_id;

  // Already logged in. Redirect...
  if (currentUser) {
    return res.redirect(302, "/urls/");
  }

  // Render register page...
  const templateVars = {
    urls: urlDatabase,
    user: users[currentUser]
  };

  return res.render("register", templateVars);
});


// => REGISTER POST:
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  // Error handling...
  if (!email) {
    return res.status(400).send("Email address field is blank.");
  }
  if (!password) {
    return res.status(400).send("Password field is blank.");
  }
  if (getUserByEmail(email, users)) {
    return res.status(400).send("Email already exists in database.");
  }

  // Success! Generate new user...
  const assignUserID = generateRandomString(6);
  const hashedPassword = bcrypt.hashSync(password, salt);

  users[assignUserID] = {
    id: assignUserID,
    email: email.toLowerCase(),
    password: hashedPassword
  };

  // Log into new account using encrypted cookie...
  req.session.user_id = assignUserID;
  return res.redirect(302, "/urls/");
});


// => LOGIN PAGE:
app.get("/login", (req, res) => {
  const currentUser = req.session.user_id;

  // Already logged in. Redirect...
  if (currentUser) {
    res.redirect(302, "/urls/");
  }

  // Render login page...
  const templateVars = {
    urls: urlDatabase,
    user: users[currentUser]
  };

  return res.render("login", templateVars);
});


// => LOGIN POST:
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const foundUser = getUserByEmail(email, users);

  // Error handling...
  if (!foundUser) {
    return res.status(403).send("Email does not exist in database.");
  }
  if (!bcrypt.compareSync(password, foundUser.password)) {
    return res.status(403).send("Incorrect password for this account.");
  }

  // Success! Log into your account...
  req.session.user_id = foundUser.id;
  return res.redirect(302, "/urls/");
});


// => LOGOUT POST:
app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect(302, "/login");
});


// => URL DATABASE PAGE:
app.get("/urls", (req, res) => {
  const currentUser = req.session.user_id;
  const userDatabase = urlsForUser(currentUser, urlDatabase);

  // Not logged in. Redirect...
  if (!currentUser) {
    return res.status(401).send("You must log in before accessing this page.");
  }

  // Render urls page...
  const templateVars = {
    urls: userDatabase,
    user: users[currentUser]
  };

  return res.render("urls_index", templateVars);
});


// => URL SUBMIT PAGE:
app.get("/urls/new", (req, res) => {
  const currentUser = req.session.user_id;

  // Error handling...
  if (!currentUser) {
    return res.redirect(302, "/login");
  }

  // Render urls/new page...
  const templateVars = {
    urls: urlDatabase,
    user: users[currentUser]
  };

  return res.render("urls_new", templateVars);
});


// => URL SUBMIT POST:
app.post("/urls", (req, res) => {
  const currentUser = req.session.user_id;
  const longURL = req.body.longURL;

  // Not logged in...
  if (!currentUser) {
    return res.status(401).send("Only registered users can shorten URLs.");
  }

  // Generate URL object and add to database...
  if (longURL.includes("http://") || longURL.includes("https://")) {
    const shortURL = generateRandomString(3);

    urlDatabase[shortURL] = {
      longURL: longURL,
      userID: currentUser,
      uniqueVisitors: [],
      visitList: []
    };

    return res.redirect(302, "/urls/" + shortURL);
  } else {
    return res.send("Invalid URL. Please include 'http://' or 'https://'");
  }
});


// => URL EDIT/VIEW PAGE:
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const currentUser = req.session.user_id;

  // Error handling...
  if (!checkDatabaseForURL(shortURL, urlDatabase)) {
    return res.status(404).send("URL does not exist within database.");
  }
  if (!currentUser) {
    return res.status(401).send("Please login before attempting to access this page.");
  }

  const compareUser = urlDatabase[shortURL].userID;
  if (compareUser !== currentUser) {
    return res.status(401).send("Current user cannot access this page.");
  }

  // Success! Render urls/:id page...
  const { longURL, visitList, uniqueVisitors } = urlDatabase[shortURL];
  const templateVars = {
    id: shortURL,
    longURL,
    urls: urlDatabase,
    uniqueVisitors: uniqueVisitors.length,
    visitList,
    user: users[currentUser]
  };

  return res.render("urls_show", templateVars);
});


// => URL EDIT POST (PUT):
app.put("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const currentUser = req.session.user_id;
  const newURL = req.body.newURL;

  // Error handling...
  if (!checkDatabaseForURL(shortURL, urlDatabase)) {
    return res.status(404).send("URL does not exist within database.");
  }
  if (!currentUser) {
    return res.status(401).send("Please login before attempting to access this page.");
  }

  const compareUser = urlDatabase[shortURL].userID;
  if (compareUser !== currentUser) {
    return res.status(401).send("Current user cannot access this page.");
  }

  // Success! Edit url...
  if (newURL.includes("http://") || newURL.includes("https://")) {
    urlDatabase[shortURL].longURL = newURL;
    return res.redirect(302, "/urls/");
  } else {
    return res.send("Invalid URL. Please include 'http://' or 'https://'");
  }
});


// => DELETE URL FROM DATABASE:
app.delete("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const currentUser = req.session.user_id;

  // Error handling...
  if (!checkDatabaseForURL(shortURL, urlDatabase)) {
    return res.status(404).send("URL does not exist within database.");
  }
  if (!currentUser) {
    return res.status(401).send("Please login before attempting to perform this action.");
  }

  const compareUser = urlDatabase[shortURL].userID;
  if (compareUser !== currentUser) {
    return res.status(401).send("Current user cannot perform this action.");
  }

  // Success! Delete url...
  delete urlDatabase[shortURL];
  return res.redirect(302, "/urls/");
});


// => URL REDIRECT:
app.get("/u/:id", (req, res) => {
  const urlDB = urlDatabase[req.params.id];

  // Incorrect URL...
  if (!urlDB) {
    return res.status(401).send("URL does not exist within database.");
  }

  // Assign unique visitor_id if none already assigned...
  let visitorID = req.session.visitor_id;
  if (!visitorID) {
    req.session.visitor_id = generateRandomString(6);
    visitorID = req.session.visitor_id;
  }

  // Add visitor_id to uniqueVisitors array if not already in there...
  const visitorDB = urlDB.uniqueVisitors;
  if (!visitorDB.includes(visitorID)) {
    visitorDB.push(visitorID);
  }

  // Track each individual visitor with a timestamp...
  const urlVisits = urlDB.visitList;
  urlVisits.push(`${visitorID} - ${new Date()}`);

  // Finally, redirect...
  const longURL = urlDB.longURL;
  return res.redirect(302, longURL);
});


// JSON API REQUEST:
app.get("/urls.json", (req, res) => {
  return res.json(urlDatabase);
});


//handle url already existing in database (recursion?) if (!urlDatabase[generatedShortURL]) { continue }

// does generate random string account for existing IDs? 
// => check for if ID exists before returning

//on server restart, if a browser has a cookie from a previous iteration of the server, none of the links work

//strLibrary by using the charCodeAt
//For example, in your /register route, you could check to see if the email and password fields are not only present, 
//but also meet certain criteria (e.g., the email is in a valid format, the password is a certain length, etc.).

//You could write more comments for specific lines in the code to aid readability and understandability.