var express = require('express'),
  app = express(),
  port = process.env.PORT || 8000;
var reload = require('reload');

var watch = require('watch');

app.use(express.static(__dirname + '/public/html')); // our static html + media files
app.use('/css', express.static(__dirname + '/public/css')); // our css
app.use('/js.3p', express.static(__dirname + '/public/js.3p')); // 3rd party js, all stolen
app.use('/vendor', express.static(__dirname + '/public/vendor')); // 3rd party libs
app.use('/js', express.static(__dirname + '/public/js')); // our javascript code

reloadServer=reload(app);


app.listen(port, function () {
  console.log('...running');
  watch.watchTree(__dirname + '/public', {interval:1}, function (f, curr, prev) {
    // Fire server-side reload event
    reloadServer.reload();
  });

});

console.log('LEDFLIX server will start on port: ' + port);
