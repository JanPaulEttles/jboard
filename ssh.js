var SSH = require('simple-ssh');

var ssh = new SSH({
    host: '10.103.128.42',
    user: 'attacker',
    pass: 'password'
});

module.exports = {
	addUser: function(username) {
    ssh
      .exec('sudo ./adduser-noargs.sh', {
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
	help: function() {
		// whatever
	}
};
