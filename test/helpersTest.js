const { assert } = require('chai');

const { findUserObj } = require('../helpers.js');

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

describe('findUserObj', function() {
  it('should return a user with valid email', function() {
    const user = findUserObj("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });
});

describe('findUserObj', function() {
  it('should return undefined with invalid email', function() {
    const user = findUserObj("user3@example.com", testUsers);
    const expectedresult = undefined;
    assert.equal(user, expectedresult);
  });
});