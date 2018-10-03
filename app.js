/*
npm install express
npm install body-parser
npm install cookie-parser
npm install js-sizeof
*/


var express = require('express');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');

var https = require('https')
var fs = require('fs');


var logger = require('./logger');
var headers = require('./headers');

var head = require('./head');
var foot = require('./foot');

var forms = require('./forms');
var utils = require('./utils');

var userdatabase = require('./userdatabase');

var app = express();
app.set('port', 3000);
//app.use(express.static(__dirname + '/'));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


var httpsOptions = {
  key: fs.readFileSync('./ca/server-key.pem'),
  cert: fs.readFileSync('./ca/server-crt.pem'),
  ca: fs.readFileSync('./ca/ca-crt.pem'),
  requestCert: true,
  rejectUnauthorized: false
}

//	crl: fs.readFileSync('./ca/ca-crl.pem'),
//    rejectUnauthorized: true

var server = https.createServer(httpsOptions, app).listen(app.get('port'), () => {
  logger.info('server running on port ' + app.get('port'))
})



/**
*	https://localhost.ssl:3000/
*/
app.get('/', function(req, res) {
  logger.info('***** home page');

  var content = '<b>YAVA :: Queue</b>';
  content += '<b>Leader Board</b>';
  content +=   getForm(req, res, 'Add Attempt Form', forms.addattemptform);

  sendResponse(req, res, 'Home Page', content);
});

/**
* reset everything - todo
*	https://localhost.ssl:3000/nuke
*/
app.get('/nuke', function(req, res) {
  logger.info('***** get nuke BOOOOOOM!!!');

  //clear queue
  //clear leaderboard

  res.redirect('/');
});


/**
*
*	parse add attempt form
*	https://localhost:3000/addattempt
*
*/
app.post('/addattempt', function(req, res) {
  logger.info('***** post forgotten');

  var content = 'Adding: ' + req.body.username;

  userdatabase.addAttempt(req.body.username);

  sendResponse(req, res, 'Add Attempt Reponse', content);
});




/**
*	https://localhost.ssl:3000/addattemptform
*/
app.get('/addattemptform', function(req, res) {
  getForm(req, res, 'Add Attempt Form', forms.addattemptform);
});

function getForm(req, res, title, form) {
  logger.trace('***** fetch form: ' + title);

  sendResponse(req, res, title, form.get());
}


function sendResponse(req, res, title, content) {
  logger.info('***** sendResponse');

  headers.set(res);

  var response = head.get(title);

  response += '<br><br><div id="content">';
  response += content;
  response += '<div>';

  response += foot.get();

  res.send(response);
}

