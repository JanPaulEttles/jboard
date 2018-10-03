var express = require('express');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');

var https = require('https')
var fs = require('fs')

var logger = require('./logger');
var headers = require('./headers');

var head = require('./head');
var foot = require('./foot');

var forms = require('./forms');

var userdatabase = require('./userdatabase');

var app = express();
app.set('port', 3000);

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


var queue = [];


function renderQueue() {

  var content = '<div class="column left"><b>Queue</b><br>';
    for (var i = 0; i < queue.length; i++) {
      content += queue[i];
      content += '<br>';
    }
  content += '<br>';
  content += '<br>';
  content += forms.addtoqueue.get();
  content += '</div>';
  return content;
}


function renderLeaderBoard() {

  var content = '<div class="column right"><b>Leader Board</b><br>';
    for (var i = 0; i < queue.length; i++) {
      content += queue[i];
      content += '<br>';
    }
  content += '</div>';
  return content;
}


/**
*	https://localhost.ssl:3000/
*/
app.get('/', function(req, res) {
  logger.info('***** home page');

  sendResponse(req, res, 'hackalot challenge');
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
*	parse add to queue form
*	https://localhost:3000/addtoqueue
*
*/
app.post('/addtoqueue', function(req, res) {
  logger.info('***** post forgotten');

  var content = 'Adding: ' + req.body.username;

  //userdatabase.updateAttempt(req.body.username);
  queue.push(req.body.username);
  //sendResponse(req, res, 'Add Attempt Reponse', content);
  res.redirect('/');
});



function sendResponse(req, res, title) {
  logger.info('***** sendResponse');

  headers.set(res);

  var response = head.get(title);

  response += '<H1>sir hackalot challenge</H1>';
  response += '<div class="row">';
  response += renderQueue();
  response += renderLeaderBoard();
  response += '</div>';

  response += foot.get();

  res.send(response);
}


