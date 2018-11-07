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
var ssh = require('./ssh');

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
var events = {
  clock : 'stopped',
  queue : 'reload',
  leaderboard : 'reload',
  winner : 'nope'
};


/**
*	https://localhost.ssl:3000/
*/
app.get('/', function(req, res) {
  logger.info('***** home page');
  events.winner = 'nope';
  sendResponse(req, res, 'Sir Hackalot Challenge');
});

/**
*	https://localhost.ssl:3000/heartbeat
*/
app.get('/heartbeat', function(req, res) {
  logger.info('***** heartbeart');
  res.send(events);
});


/**
*	add to queue
*	https://localhost.ssl:3000/addtoqueue?username=test
*/
app.get('/addtoqueue', function(req, res) {
  logger.info('***** add to queue: ' + req.query.username);
  res.sendStatus(addToQueue(req.query.username));
});

/**
*	remove from queue
*	https://localhost.ssl:3000/removefromqueue?username=test
*/
app.get('/removefromqueue', function(req, res) {
  logger.info('***** remove from queue: ' + req.query.username);
  res.sendStatus(removeFromQueue(req.query.username));
});

function addToQueue(username) {
  logger.info('***** add to queue: ' + username);

  //add them to the queue
  queue.push(username);
  events.queue = 'reload';

  //add a new user to the DB is one does not already exist - may not need to reload this if the user wasn't added
  //create a user on the attacker machine also
  addUser(username);
  events.leaderboard = 'reload';

  //if the clock is stopped, then we must not have a user active.  we may as well start this user off
  if(events.clock === 'stopped') {
    events.clock = 'prepare';
  }
  return 200;
}

function removeFromQueue(username) {
  logger.info('***** remove from queue: ' + username);

  var index = queue.indexOf(username);
  if (index > -1) {
    queue.splice(index, 1);
  }
  events.queue = 'reload';
  return 200;
}





/**
*	get the queue
*	https://localhost.ssl:3000/getqueue
*/
app.get('/getqueue', function(req, res) {
  logger.info('***** get the queue');
  res.send(getQueue());
});

function getQueue() {
  logger.info('***** get queue');
  events.queue = 'nothing';
  return queue;
}








/**
*	remove from leaderbaord which also removes from queue
*	https://localhost.ssl:3000/removefromleaderboard?username=test
*/
app.get('/removefromleaderboard', function(req, res) {
  logger.info('***** remove from leader board: ' + req.query.username);
  res.sendStatus(removeFromLeaderBoard(req.query.username));
});

/**
*	get the leaderboard
*	https://localhost.ssl:3000/getleaderboard
*/
app.get('/getleaderboard', function(req, res) {
  logger.info('***** get the leader board: ');
  res.send(getLeaderBoard());
});

function getLeaderBoard() {
  logger.info('***** get leaderboard');
  events.leaderboard = 'nothing';
  return userdatabase.getUsers();
}


function removeFromLeaderBoard(username) {
  logger.info('***** remove from leaderboard: removeFromLeaderBoard(username) : ' + username);

  userdatabase.deleteUser(username);
  events.leaderboard = 'reload';

  removeFromQueue(username);
  events.queue = 'reload';
  return 200;
}




//not called directly
function addUser(username) {
  logger.info('***** add to leader board: ' + username);

  if(!userdatabase.isUser(username)) {
    //add a new user to the DB is one does not already exist
    userdatabase.addUser(username);
    ssh.addUser(username);
  }
}





/**
*	send the response
*/
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





/**
*	https://localhost.ssl:3000/timerprepare
*/
app.get('/timerpreparing', function(req, res) {
  logger.info('***** timerpreparing');
  events.clock = 'preparing';
  res.sendStatus(200);
});

/**
*	https://localhost.ssl:3000/timerrunning
*/
app.get('/timerrunning', function(req, res) {
  logger.info('***** timerrunning');
  events.clock = 'running';
  res.sendStatus(200);
});


/**
*	https://localhost.ssl:3000/timerrunning
*/
app.get('/timerstopped', function(req, res) {
  logger.info('***** timerstopped');

  if(events.clock === 'preparing') {
    events.clock = 'start';
  }
  else
  if(events.clock === 'running') {
    events.clock = 'stop';
  }
  res.sendStatus(200);
});


/**
*	https://localhost.ssl:3000/flagcaptured?username=username&flag=0
*/
app.get('/flagcaptured', function(req, res) {
  logger.info('***** flag capture:' + req.query.username + '  ' + req.query.flag);
  res.sendStatus(flagCaptured(req.query.username, req.query.flag));
});


function flagCaptured(username, flag) {
  userdatabase.updateResult(username, flag);
  events.leaderboard = 'reload';
  return 200;
}


/**
*	https://localhost.ssl:3000/winnerwinner?username=username&answer=whatever the answer is
*/
app.get('/winnerwinner', function(req, res) {
  logger.info('***** winnerwinner:' + req.query.username + '  ' + req.query.answer);
  res.sendStatus(winnerWinner(req.query.username, req.query.answer));
});


function winnerWinner(username, answer) {

  var finalflag = 'Until they become conscious they will never rebel, and until after they have rebelled they cannot become conscious - George Orwell, 1984';
  if(answer === finalflag) {
    events.winner = 'chicken';
  }
  return 200;
}

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
* doesn't need any parameters, it does not assume that the current person in the queue trigger the trap
*	https://localhost.ssl:3000/boobytrap?username=username
*
*/
app.get('/boobytrap', function(req, res) {
  logger.info('***** booby trap: ' + req.query.username);

  //set attempts to attempts++
  userdatabase.incrementAttempts(req.query.username);

  //remove them from the queue
  removeFromQueue(req.query.username);

  //reload the leaderbaord
  events.leaderboard = 'reload';

});

/**
*	https://localhost.ssl:3000/timesup
*/
app.get('/timesup', function(req, res) {
  logger.info('***** times up');

  userdatabase.incrementAttempts(queue[0]);

  //remove them from the queue
  removeFromQueue(queue[0]);
  events.leaderboard = 'reload';

  //if there is someone in the queue, then give them a moment to log in
  if(queue.length > 0) {
    events.clock = 'prepare';
  }
  else {
    events.clock = 'stopped';
  }

  //reset the timer
  res.sendStatus(200);
});



/*
curl --insecure 'https://localhost.ssl:3000/winnerwinner?username=joe&answer=Until%20they%20become%20conscious%20they%20will%20never%20rebel%2C%20and%20until%20after%20they%20have%20rebelled%20they%20cannot%20become%20conscious%20-%20George%20Orwell%2C%201984'
curl --insecure 'https://localhost.ssl:3000/winnerwinner?username=joe&answer=Until they become conscious they will never rebel, and until after they have rebelled they cannot become conscious - George Orwell, 1984'
curl --insecure 'https://localhost.ssl:3000/flagcaptured?username=username&flag=0'
curl --insecure 'https://localhost.ssl:3000/addtoqueue?username=username'
curl --insecure 'https://localhost.ssl:3000/removefromqueue?username=username'
curl --insecure 'https://localhost.ssl:3000/boobytrap?username=username'
curl --insecure 'https://localhost.ssl:3000/boobytrap?username=username'
curl --insecure 'https://localhost.ssl:3000/removefromleaderboard?username=username'
curl --insecure 'https://localhost.ssl:3000/getleaderboard'

https://localhost.ssl:3000/removefromqueue?username=

https://localhost.ssl:3000/updateattempt?username=&step=
*/

