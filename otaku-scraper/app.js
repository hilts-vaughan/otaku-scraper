var express = require('express')
  , config = require('./config')
  , Anime = require('./lib/anime')
  , notfound = require('./lib/notfound');

News = require('./lib/news');

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/otaku');


var app = express();
if ('test' !== app.get('env')) app.use(express.logger(config.get('logger:format')));
app.use(express.responseTime());
app.use(express.favicon());
app.use(express.json());


// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});


app.get('/v2/anime/:id', function(req, res, next) {
  res.type('application/json');

  var db = req.db;
  var id = req.params.id;
  if (!/^\d+$/.test(id)) {
    return res.send(404, { 'error': 'not-found' });
  }

  Anime.byId(id, function(err, anime) {
    if (err) return next(err);
    res.send(anime);
  }, db);
});


app.get('/v2/news/', function(req, res, next)
{
    res.type('application/json');
    
    News.fetch(function(err, news)
    {
        res.send(news);
    });


});



app.use(notfound());

app.listen(config.get('port'), function() {
  console.log('API server listening on port ' + config.get('port'));
});

module.exports = app;
