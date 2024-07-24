const { assert } = require("chai");

const { getUserByEmail, urlsForUser } = require("../helpers.js");

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const emptyDatabase = {};

// getUserByEmail tests:
describe("Testing helper functions: getUserByEmail", function() {
  it("should return a user with valid email", () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });
  it("should return undefined if email not in database", () => {
    const user = getUserByEmail("none@fake.com", testUsers);
    const expected = undefined;
    assert.equal(user, expected);
  });
  it("should return entire user object when user is found", () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expected = testUsers.userRandomID;
    assert.deepEqual(user, expected);
  });
});

// urlsForUser tests:
describe("Testing helper functions: urlsForUser", () => {
  it("should return an object containing the urls that belong to the specified user", () => {
    const user = "aJ48lW";
    const expected = { b6UTxQ: "https://www.tsn.ca", i3BoGr: "https://www.google.ca" };
    assert.deepEqual(urlsForUser(user, testDatabase), expected);
  });
  it("should return an empty object if the user has no urls", () => {
    const user = "nouser";
    const expected = {};
    assert.deepEqual(urlsForUser(user, testDatabase), expected);
  });
  it("should return an empty object if the url database is empty", () => {
    const user = "aJ48lW";
    const expected = {};
    assert.deepEqual(urlsForUser(user, emptyDatabase), expected);
  });
});