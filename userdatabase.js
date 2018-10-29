'use strict';

var logger = require('./logger');
var midget = require('./midget');
var db = new midget();

var count = 0;
var lineReader = require('readline').createInterface({
	input: require('fs').createReadStream('user.database')
});

lineReader.on('line', function (line) {
  count++;
  var userline = line.split(':::');
  var results = [];
  var resultsline = userline[2].split('::');
  for (var i = 0; i < resultsline.length; i++) {
    var result = resultsline[i].split(':');
    results.push({
      'id' : result[0],
      'result' : result[1]
    });
  }
  module.exports.putUser(populateUser(userline[0], userline[1], results))
});

lineReader.on('close', function (line) {
  logger.trace('inserted ' + count + ' users into the user database');
});


function populateUser(username, attempts, results) {
  return {
    username  : username,
    attempts  : attempts,
    results  : results
  };
}

function createUser(username) {
  return {
    username  : username,
    attempts  : 0,
    results  : createChallenges()
  };
}

function createChallenges() {
  return [
      { "id" : "0", "result" : "0" },
      { "id" : "1", "result" : "0" },
      { "id" : "2", "result" : "0" },
      { "id" : "3", "result" : "0" },
      { "id" : "4", "result" : "0" },
      { "id" : "5", "result" : "0" },
      { "id" : "6", "result" : "0" },
      { "id" : "7", "result" : "0" },
      { "id" : "8", "result" : "0" },
      { "id" : "9", "result" : "0" }
    ];
}

//jan:::0:::0:0::1:0::2:0::3:0::4:0::5:0::6:0::7:0::8:0::9:0


module.exports = {
  getUsernames: function() {
    logger.trace('fetching usernames');
    return db.keys;
  },
	putUser: function(user) {
    logger.debug('storing username : ' + user.username);
    logger.debug('storing username : ' + JSON.stringify(user));
    db.put(user.username, JSON.stringify(user));
  },
 	addUser: function(username) {
    var user = db.get(username);
    if(user === null) {
      module.exports.putUser(createUser(username));
      module.exports.saveDatabase();
    }
  },
 	isUser: function(username) {
    var exists = true;

    if(db.get(username) === null) {
      exists = false;
    }
    return exists;
  },
  deleteUser: function(username) {
    var user = db.get(username);

    if(user !== null) {
      console.log(username + " deleting ****");
      db.del(username);
      module.exports.saveDatabase();
    }
  },
  getUser: function(username) {
    logger.debug('fetching username : ' + username);

    var user = db.get(username);
    if(user === null) {
      logger.debug('username : ' + username + ' not found');
    }
    else {
      logger.debug(user);
    }
	  return JSON.parse(user);
  },
  getUsers: function() {
    logger.debug('fetching users');

    var keys = module.exports.getUsernames();

    var users = [];
    for(var i = 0; i < keys.length; ++i){
      users.push(db.get(keys[i]));
    }
    return users;
  },
  clear: function() {
      var wstream = require('fs').createWriteStream('user.database');
      wstream.write('');
      wstream.end();
  },
  updateAttempt: function(username, level) {
    var user = db.get(username);
    if(user !== null) {


      //update attempts
      user.attempts++;

      //update result
      if(level <= user.results.length) {
        user.results[level] = 1;
      }

      //save db
      module.exports.saveDatabase();
    }
  },
  saveDatabase: function() {

    var keys = db.keys;

    var userline = '';
    for(var i = 0; i < keys.length; ++i) {
      var user = JSON.parse(db.get(keys[i]));

      userline += user.username;
      userline += ':::';
      userline += user.attempts;
      userline += ':::';

      for(var j = 0; j < user.results.length; ++j) {
        userline += user.results[j].id;
        userline += ':';
        userline += user.results[j].result;

        if((j + 1) < user.results.length) {
          userline += '::';
        }
      }
      if((i + 1) < keys.length) {
        userline += '\n';
      }

      var wstream = require('fs').createWriteStream('user.database');
      wstream.write(userline);
      wstream.end();
    }
  },
  help: function() {
		// whatever
	}
};


