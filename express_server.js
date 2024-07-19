const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

// FUNCTION TO CREATE NEW URLS:
const generateRandomString = function() {
  let randomString = "";

  while (randomString.length < 6) {
    const ASCIICharIndex = Math.floor(Math.random() * (122 - 48) + 48);
    const randomChar = String.fromCharCode(ASCIICharIndex);
    randomString += randomChar
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

// FULL URLS DATABASE PAGE:
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// SUBMIT NEW URL:
app.post("/urls", (req, res) => {
  //handle url already existing in database (recursion?) if (!urlDatabase[generatedShortURL]) { continue }
  const submittedLongURL = req.body.longURL;

  if (submittedLongURL.includes("http://") || submittedLongURL.includes("https://")) {
    const generatedShortURL = generateRandomString();
    urlDatabase[generatedShortURL] = submittedLongURL;
    res.redirect(200, "/urls/" + generatedShortURL);
  } else {
    res.send("Invalid URL. Please include 'http://' or 'https://'")
  }

});

// URL SUBMIT PAGE:
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// SPECIFIC URL DATABASE PAGE (REDIRECT / LOOKUP):
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;

  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL];
    const templateVars = { id: shortURL, longURL: longURL };
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
  res.redirect(308, longURL);
} else {
  res.send("URL does not exist within database.")
}

});

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