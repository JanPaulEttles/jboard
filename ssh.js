var SSH = require('simple-ssh');


//10.10.10.7
var ssh = new SSH({
    host: '10.103.128.42',
    user: 'attacker',
    pass: 'password'
});

module.exports = {
	addUser: function(username) {
    ssh
      .exec('sudo ./adduser.sh', {
        args: [username],
        out: console.log.bind(console)
      })
      .exec('less /etc/passwd', {
        out: console.log.bind(console)
      })
      .exec('groups', {
        args: [username],
        out: console.log.bind(console)
      })
      .start();
  },
	removeUser: function(username) {
    ssh
      .exec('sudo ./deluser.sh', {
        args: [username],
        out: console.log.bind(console)
      })
      .exec('less /etc/passwd', {
        out: console.log.bind(console)
      })
      .exec('groups', {
        args: [username],
        out: console.log.bind(console)
      })
      .start();
  },
	loggOutUser: function(username) {
    ssh
      .exec('sudo su', {
        out: console.log.bind(console)
      })
      .exec('logout', {
        args: [username],
        out: console.log.bind(console)
      })
      .exec('groups', {
        args: [username],
        out: console.log.bind(console)
      })
      .start();
  },
  help: function() {
		// whatever
	}
};
