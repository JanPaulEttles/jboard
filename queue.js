'use strict';

var logger = require('./logger');

var fragment = '';

var count = 0;
var lineReader = require('readline').createInterface({
	input: require('fs').createReadStream('queue.template')
});

lineReader.on('line', function (line) {
  count++;
  fragment += line;
  fragment += '\n';
});
lineReader.on('close', function (line) {
  logger.trace('read ' + count + ' lines for queue.template');
});

module.exports = {
	get: function() {
    return fragment;
  },
	help: function() {
		// whatever
	}
};
