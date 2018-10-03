'use strict';


module.exports = {
	set: function(res) {
	  res.setHeader('Content-Type', 'text/html; charset=utf-8');
	  res.setHeader('X-XSS-Protection', '0'); //ERR_BLOCKED_BY_XSS_AUDITOR
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  },
	help: function() {
		// whatever
	}
};
