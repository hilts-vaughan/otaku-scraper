global.api = {
  ref: {},
  anichart: {},
  ann: {},
  mal: {},
};

var api = global.api
  , express = require('express')
  , config = require('./config')
  , Anime = require('./lib/api/mal/anime')
  , AnimeReviews = require('./lib/api/mal/animereviews')
  , notfound = require('./lib/notfound')
  , AniChart = require('./lib/api/anichart/anichart')
  , News = require('./lib/api/mal/news')
  , Manga = require('./lib/api/mal/manga')
  , reference = require('./lib/api/ref')
  ;

// Setup express
var app = express();
if ('test' !== app.get('env')) app.use(express.logger(config.get('logger:format')));
app.use(express.responseTime());
app.use(express.favicon());
app.use(express.json());

// Allow cross origin requests
var cors = require('cors');
app.use(cors());

// Make our db accessible to our router
app.use(function(req, res, next) {
    // Patch the requests incoming
    req.db = db;

    next();
});

// Register API once the database has been opened properly
apiRegister('/mal/anime/id/:id([0-9]+)', api.mal.anime.id);
apiRegister('/mal/anime/id/:id([0-9]+)/reviews', api.mal.anime.reviews.idAll);
apiRegister('/mal/anime/search/:name', api.mal.anime.search);
apiRegister('/mal/anime/name/:name', api.mal.anime.name);
apiRegister('/mal/anime/name/:name/reviews', api.mal.anime.reviews.nameAll);
apiRegister('/mal/manga/id/:id([0-9]+)', api.mal.manga.id);
apiRegister('/mal/manga/name/:name', api.mal.anime.name);
apiRegister('/mal/news/', api.mal.news);

apiRegister('/anichart', api.anichart.current);
apiRegister('/anichart/current', api.anichart.current);
apiRegister('/anichart/spring', api.anichart.spring);
apiRegister('/anichart/summer', api.anichart.summer);
apiRegister('/anichart/fall', api.anichart.fall);
apiRegister('/anichart/winter', api.anichart.winter);
apiRegister('/anichart/tba', api.anichart.tba);
apiRegister('/anichart/spring/:id([0-9]+)', api.anichart.spring);
apiRegister('/anichart/summer/:id([0-9]+)', api.anichart.summer);
apiRegister('/anichart/fall/:id([0-9]+)', api.anichart.fall);
apiRegister('/anichart/winter/:id([0-9]+)', api.anichart.winter);

apiRegister('/ref/status/:code([0-9]+)', api.ref.statusCodes.get);
apiRegister('/ref/anime/type/:code([0-9]+)', api.ref.anime.typeCodes.get);
apiRegister('/ref/anime/rating/:code([0-9]+)', api.ref.anime.ratings.get);


// manga api hook
apiRegister('/mal/manga/id/:id([0-9]+)', api.mal.manga.id);

app.use(notfound());

app.listen(config.get('port'), function() {
    console.log('API server listening on port ' + config.get('port'));
});



// Load up our database stuff we need
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/otaku');

var db = mongoose.connection;
db.on('error', function(err) {
    console.log(err + " while attempting to open the database. Exiting.");
    process.exit(1);
});

db.once('open', function callback() {
    console.log("Registering API routes...")
});


function apiRegister(url, func, version) {
    if (isNaN(version))
        version = 1;

    app.get(url, func);
    console.log(url);
    app.get('/v' + version + url, func);
}

// Export the module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = app;
}