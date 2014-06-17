 global.api = {
   ref: {},
   anichart: {},
   ann: {},
   mal: {},
 };

 var api = global.api,
   express = require('express'),
   config = require('./config'),
   notfound = require('./lib/notfound'),
   Anime = require('./lib/api/mal/anime'),
   Manga = require('./lib/api/mal/manga'),
   AnimeReviews = require('./lib/api/mal/reviews_anime'),
   MangaReviews = require('./lib/api/mal/reviews_manga'),
   AniChart = require('./lib/api/anichart/anichart'),
   News = require('./lib/api/mal/news'),
   reference = require('./lib/api/ref');
   CronTasks = require('./lib/cron/cron_tasks');
   ContentList = require('./lib/api/mal/list_content')
   MALAccount = require('./lib/api/mal/user');

 /* Setup expressjs */
 var app = express();
 if ('test' !== app.get('env')) app.use(express.logger(config.get('logger:format')));
 app.use(express.responseTime());
 app.use(express.favicon());
 app.use(express.json());

 /* Allow cross origin requests */
 var cors = require('cors');
 app.use(cors());

 /* Make our db accessible to our router */
 app.use(function(request, response, next) {
   // Patch the requests incoming
   request.db = db;

   next();
 });


 /*
  * Register API Hooks
  */

 /* MAL Anime */
 apiRegister('/mal/anime/search/:name', api.mal.anime.search);
 apiRegister('/mal/anime/id/:id([0-9]+)', api.mal.anime.id);
 apiRegister('/mal/anime/name/:name', api.mal.anime.name);

 /* MAL Anime Reviews */
 apiRegister('/mal/anime/id/:id([0-9]+)/reviews', api.mal.anime.reviews.idAll);
 apiRegister('/mal/anime/name/:name/reviews', api.mal.anime.reviews.nameAll);

 /* MAL Manga */
 apiRegister('/mal/manga/search/:name', api.mal.manga.search);
 apiRegister('/mal/manga/id/:id([0-9]+)', api.mal.manga.id);
 apiRegister('/mal/manga/name/:name', api.mal.manga.name);

 /* MAL Manga Reviews */
 apiRegister('/mal/manga/id/:id([0-9]+)/reviews', api.mal.manga.reviews.idAll);
 apiRegister('/mal/manga/name/:name/reviews', api.mal.manga.reviews.nameAll);

 /* MAL News */
 apiRegister('/mal/news/', api.mal.news);

 apiRegister('/mal/user/', api.mal.user);

// MAL listings for users
apiRegister('/mal/list/fetch/:type/:user', api.mal.list.fetch);
apiRegister('/mal/list/add/:type/:user/:id', api.mal.list.add);
apiRegister('/mal/list/remove/:type/:user/:id', api.mal.list.delete);
apiRegister('/mal/list/update/:type/:user/:id', api.mal.list.update);

 /* AniChart Seasonal */
 apiRegister('/anichart', api.anichart.current);
 apiRegister('/anichart/current', api.anichart.current);
 apiRegister('/anichart/spring', api.anichart.spring);
 apiRegister('/anichart/summer', api.anichart.summer);
 apiRegister('/anichart/fall', api.anichart.fall);
 apiRegister('/anichart/winter', api.anichart.winter);
 apiRegister('/anichart/tba', api.anichart.tba);



 /* AniChart Yearly Archive */
 apiRegister('/anichart/spring/:id([0-9]+)', api.anichart.spring);
 apiRegister('/anichart/summer/:id([0-9]+)', api.anichart.summer);
 apiRegister('/anichart/fall/:id([0-9]+)', api.anichart.fall);
 apiRegister('/anichart/winter/:id([0-9]+)', api.anichart.winter);

 /* API Reference */
 apiRegister('/ref/status/:code([0-9]+)', api.ref.statusCodes.get);
 apiRegister('/ref/anime/type/:code([0-9]+)', api.ref.anime.typeCodes.get);
 apiRegister('/ref/anime/rating/:code([0-9]+)', api.ref.anime.ratings.get);

 /* 404 */
 app.use(notfound());

 /* Listen on our port */
 app.listen(config.get('port'), function() {
   console.log('API server listening on port ' + config.get('port'));
 });

 /* Load up our database */
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

 /* API Registration "macro" */
 function apiRegister(url, func, version) {
   if (isNaN(version))
     version = 1;

   app.get(url, func);
   console.log(url);
   app.get('/v' + version + url, func);
 }


 // Setup cron
CronTasks.setupTasks();


 // Export the module
 if (typeof module !== 'undefined' && module.exports) {
   module.exports = app;
 }