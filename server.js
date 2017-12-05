var express = require('express'),
  app = express(),
  port = process.env.PORT || 8888;

app.use(express.static(__dirname + '/public/html')); // static html
app.use('/css', express.static(__dirname + '/public/css')); // css
app.use('/js.3p', express.static(__dirname + '/public/js.3p')); // 3rd party js, all stolen
app.use('/vendor', express.static(__dirname + '/public/vendor')); // 3rd party libs

app.listen(port, function () {
  console.log('...running');
});

console.log('LEDFLIX server will start on port: ' + port);