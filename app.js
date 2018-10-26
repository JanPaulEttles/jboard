var express = require('express');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');

var path = require('path');
var https = require('https')
var fs = require('fs')

var logger = require('./logger');
var headers = require('./headers');

var components = require('./components');

var userdatabase = require('./userdatabase');

var app = express();
app.set('port', 3000);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/static', express.static(path.join(__dirname, 'assets')));
//app.use('/js', express.static(path.join(__dirname, 'assets/js')));
//app.use('/css', express.static(path.join(__dirname, 'assets/css')));

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

app.get('/update', function(req, res) {
  logger.info('***** get ');


  //req.query.username

  //remove from queue
  //update leaderboard

  userdatabase.addAttempt(req.query.username, req.query.step);

  res.redirect('/');
});
















/**
*
*	add to queue
*	https://localhost.ssl:3000/addtoqueue?username=test
*
*/
app.get('/addtoqueue', function(req, res) {
  logger.info('***** add to queue: ' + req.query.username);
  res.send(addToQueue(req.query.username));
});

/**
*
*	remove from queue
*	https://localhost.ssl:3000/removefromqueue?username=test
*
*/
app.get('/removefromqueue', function(req, res) {
  logger.info('***** remove from queue: ' + req.query.username);
  res.send(removeFromQueue(req.query.username));
});

/**
*
*	remove from leaderbaord which also removes from queue
*	https://localhost.ssl:3000/removefromleaderboard?username=test
*
*/
app.get('/removefromleaderboard', function(req, res) {
  logger.info('***** remove from leader board: ' + req.query.username);
  res.send(removeFromLeaderBoard(req.query.username));
});


/**
*
*	get the leaderboard
*	https://localhost.ssl:3000/getleaderboard
*
*/
app.get('/getleaderboard', function(req, res) {
  logger.info('***** get the leader board: ');
  res.send(getLeaderBoard());
});







function sendResponse(req, res, title) {
  logger.info('***** sendResponse');

  headers.set(res);

  var response = components.head.get(title);

  response += components.clock.get();
  response += '<div class="row">';
  response += components.queue.get();
  response += components.leaderboard.get();
  response += '</div>';

  response += components.foot.get();

  res.send(response);
}





function addToQueue(username) {
  logger.info('***** add to queue: ' + username);

  //add them to the queue
  queue.push(username);

  //add a new user to the DB is one does not already exist
  addToLeaderBoard(username);

  return queue;
}

function removeFromQueue(username) {
  logger.info('***** remove from queue: ' + username);

  var index = queue.indexOf(username);
  if (index > -1) {
    queue.splice(index, 1);
  }
  return queue;
}

function getLeaderBoard() {
  logger.info('***** get leader board');

  return userdatabase.getUsers();
}




//not called directly
function addToLeaderBoard(username) {
  logger.info('***** add to leader board: ' + username);

  //add a new user to the DB is one does not already exist
  userdatabase.addUser(username);
}


function removeFromLeaderBoard(username) {
  logger.info('***** remove from leaderboard: removeFromLeaderBoard(username) : ' + username);

  userdatabase.deleteUser(username);

  return removeFromQueue(username);
}






/*

https://localhost.ssl:3000/addtoqueue?username=
https://localhost.ssl:3000/removefromqueue?username=

https://localhost.ssl:3000/updateattempt?username=&step=




*/



