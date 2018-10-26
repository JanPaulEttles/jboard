'use strict';

var logger = require('./logger');

var fragment = '';

var count = 0;
var lineReader = require('readline').createInterface({
	input: require('fs').createReadStream('head.template')
});

lineReader.on('line', function (line) {
  count++;
  fragment += line;
  fragment += '\n';
});
lineReader.on('close', function (line) {
  logger.trace('read ' + count + ' lines for head template');
});

module.exports = {
	get: function(title) {
    return fragment.replace('{title}', title);
  },
	help: function() {
		// whatever
	}
};
