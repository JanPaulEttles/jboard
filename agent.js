var shell = require('shelljs');

var express = require('express');
var http = require('http')

var app = express();
app.set('port', 3000);

var server = http.createServer(app).listen(app.get('port'), () => {
  console.log('server running on port ' + app.get('port'))
})

//npm install express
//npm install shelljs


  //this shell script gets the username using whoami
  //curl to https://leaderboard/boobytrap?username=username&flag=0,1,2,3

app.get('/flag', function(req, res) {
  console.log('***** flag: ' + req.query.flag);
  var shellscript = 'not set';

  switch(req.query.flag) {
      case 0: {
        shellscript = './path_to_ur_file';
        break;
      }
      case 1: {
        shellscript = './path_to_ur_file';
        break;
      }
      case 2: {
        shellscript = './path_to_ur_file';
        break;
      }
      case 3: {
        shellscript = './path_to_ur_file';
        break;
      }
      default:
        //nothing;
    }
  shell.exec(shellscript);

});

  //this shell gets the username using whoami
  //curl to https://leaderboard/boobytrap?username=username
app.get('/booby', function(req, res) {
  console.log('***** booby');
  shell.exec('./path_to_ur_file')
});


  //this shell script gets the username using whoami
  //curl to https://leaderboard/boobytrap?username=username&answer=whatevertheanswerisurlencoded
app.get('/winner', function(req, res) {
  console.log('***** winner');
  shell.exec('./path_to_ur_file')
});


