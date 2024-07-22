const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

// FUNCTION TO CREATE NEW URLS:
const generateRandomString = function () {
  let randomString = "";
  const strLibrary =
    [
      "a", "b", "c", "d", "e", "f", "g",
      "h", "i", "j", "k", "l", "m", "n",
      "o", "p", "q", "r", "s", "t", "u",
      "v", "w", "x", "y", "z", "A", "B",
      "C", "D", "E", "F", "G", "H", "I",
      "J", "K", "L", "M", "N", "O", "P",
      "Q", "R", "S", "T", "U", "V", "W",
      "X", "Y", "Z", "1", "2", "3", "4",
      "5", "6", "7", "8", "9", "0", "!"
    ];

  while (randomString.length < 6) {
    const libraryIndex = Math.floor(Math.random() * 62);
    randomString += strLibrary[libraryIndex];
  }

  return randomString;
};

// DATABASE OBJECT:
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// HOMEPAGE:
app.get("/", (req, res) => {
  res.send("Welcome to the homepage!");
});

// REGISTER PAGE:
app.get("/register", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"] 
  };
  res.render("register", templateVars);
})

// REGISTER POST:
app.post("/register", (req, res) => {
  console.log(req.body);
  // req.body = { email: 'kyle@yahoo.ca', password: '123' }
})

// LOGIN:
app.post("/login", (req, res) => {
  // edge case: handle empty username field
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect(302, "/urls/");
})

// LOGOUT:
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect(302, "/urls/")
})

// FULL URLS DATABASE PAGE:
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"] 
  };
  res.render("urls_index", templateVars);
});

// SUBMIT NEW URL:
app.post("/urls", (req, res) => {
  //handle url already existing in database (recursion?) if (!urlDatabase[generatedShortURL]) { continue }
  const submittedLongURL = req.body.longURL;

  if (submittedLongURL.includes("http://") || submittedLongURL.includes("https://")) {
    const generatedShortURL = generateRandomString();
    urlDatabase[generatedShortURL] = submittedLongURL;
    res.redirect(302, "/urls/" + generatedShortURL);
  } else {
    res.send("Invalid URL. Please include 'http://' or 'https://'")
  }

});

// URL SUBMIT PAGE:
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"] 
  };
  res.render("urls_new", templateVars);
});

// POST-SUBMIT SPECIFIC URL DATABASE PAGE (REDIRECT / LOOKUP):
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;

  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL];
    const templateVars = { 
      id: shortURL, 
      longURL: longURL,
      urls: urlDatabase,
      username: req.cookies["username"] 
    };
    res.render("urls_show", templateVars);
  } else {
    res.send("URL does not exist within database.")
  }

});

// REDIRECT TO URL USING SHORT URL:
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;

  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL];
    res.redirect(302, longURL);
  } else {
    res.send("URL does not exist within database.")
  }

});

// EDIT URL IN DATABASE:
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newURL = req.body.newURL;

  if (newURL.includes("http://") || newURL.includes("https://")) {
    urlDatabase[shortURL] = newURL;
    res.redirect(302, "/urls/");
  } else {
    res.send("Invalid URL. Please include 'http://' or 'https://'")
  }

})

// DELETE FROM DATABASE:
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect(302, "/urls/");
})

// JSON API REQUEST:
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// START SERVER:
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });


// Edge cases:
//localhost:8080/urls/RANDOMSTRING => Shouldn't bring up a urls page
//localhost:8080/u/RANDOMSTRING => Shouldn't throw an error, it should return info

//Feedback suggestions:
//Refactor generateRandomString to store characters in a string instead of an array