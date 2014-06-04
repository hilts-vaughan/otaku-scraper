var express = require('express')
  , config = require('./config')
  , Anime = require('./lib/anime')
  , notfound = require('./lib/notfound')
  , AnimeChart = require('./lib/animechart')
  . News = require('./lib/news')
  ;

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/otaku');

var app = express();
if ('test' !== app.get('env')) app.use(express.logger(config.get('logger:format')));
app.use(express.responseTime());
app.use(express.favicon());
app.use(express.json());

// Make our db accessible to our router
app.use(function(req, res, next) {
    req.db = db;
    next();
});

var api = {};

api.mal = {
    anime: {
        id: function(req, res, next) {
            res.type('application/json');

            var db = req.db;
            var id = req.params.id;

            Anime.byId(id, function(err, anime) {
                if (err) {
                    return next(err);
                }
                
                res.send(anime);
            }, db);
        },
        name: function(req, res, next) {
            res.type('application/json');

            var db = req.db;
            var name = req.params.name;

            Anime.lookup(name, function(err, anime) {
                if (err) {
                    return next(err);
                }

                res.send(anime);
            }, db);
        }
    },
    news: function(req, res, next) {
        res.type('application/json');
        
        News.fetch(function(err, news) {
            res.send(news);
        });
    }
};

api.anichart = function(req, res, next) {
    res.type('application/json');

    var db = req.db;

    AnimeChart.fetch(function(err, chart) {
        res.send(chart)
    }, db);
};

app.get('/v1/mal/anime/id/:id([0-9]+)', api.mal.anime.id);
app.get('/v1/mal/anime/name/:name', api.mal.anime.name);
app.get('/v1/mal/news/', api.mal.news);
app.get('/v1/anichart/', api.anichart);

app.get('/mal/anime/id/:id([0-9]+)', api.mal.anime.id);
app.get('/mal/anime/name/:name', api.mal.anime.name);
app.get('/mal/news/', api.mal.news);
app.get('/anichart/', api.anichart);

app.use(notfound());

app.listen(config.get('port'), function() {
    console.log('API server listening on port ' + config.get('port'));
});

module.exports = app;
