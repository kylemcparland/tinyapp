const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

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

describe('getUserByEmail', function() {
  it('should return a user with valid email', () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });
  it('should return undefined if email not in database', () => {
    const user = getUserByEmail("none@fake.com", testUsers);
    const expected = undefined;
    assert.equal(user, expected);
  });
  it('should return entire user object when user is found', () => {
    const user = getUserByEmail("user@example.com", testUsers);
    const expected = testUsers.userRandomID;
    assert.equal(user, expected);
  });
});