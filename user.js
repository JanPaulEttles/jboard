// user.js

// constructor function for the User class
function User(username, challenges) {
    this.username = username;
    this.attempts = 0;
}

// now we export the class, so other modules can create User objects
module.exports = {
    User: User
}