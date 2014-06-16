var AniChart = require('../api/anichart/anichart');
var Anime = require('../api/mal/anime');
var Manga = require('../api/mal/manga');

var CronJob = require('cron').CronJob;

// models
var ChartModel = require('../db/model_chart');
var AnimeModel = require('../db/model_anime');
var MangaModel = require('../db/model_manga');


var CronTasks = (function() {

	function CronTasks() {}


	/**
	 * Setups cron tasks using the cron module to periodically perform tasks.
	 * Typically, this is used to bust caches on the server-side where needed.
	 */
	CronTasks.setupTasks = function() {

		// Force some scans on startup to make sure the data is as most up to date as we can afford
		// WARNING: IF THE SERVER HAS NOT BEEN STARTED IN A REALLY LONG TIME, THIS MIGHT BE A BAD IDEA
		this._scanManga();
		this._scanAnime();


		var that = this;
		// 30 23 * * * => 11:30 PM daily
		var job = new CronJob('30 23 * * *', function() {
			that._resetAnichart();
		}, function() {

		}, true);


		// 15 * * * * => 15th minute of every hour, every day
		var sweep = new CronJob('15 * * * *', function() {
			that._scanManga();
			that._scanAnime();
		}, function() {

		}, true)


	},


	/**
	 * This is a task that runs periodically that will reset and reobtain various season data
	 * from AniChart. This prevents data from going stale.
	 */
	CronTasks._resetAnichart = function() {

		// Evict all entries
		var evict = ['winter', 'spring', 'fall', 'summer', 'tba'];

		evict.forEach(function(item) {

			// We're going to evict each item slowly
			ChartModel.findOne({
				"season": item
			}, function(err, chartItem) {

				// If we found something, evict it and retry
				if (chartItem != null) {
					chartItem.remove();

					// Go fetch
					AniChart.fetch(item, function() {
						console.log("Refreshed anichart - season " + item + " successfully.");
					});
				}
			})

		});

	},


	/**
	 * This is a task that when run will scan all anime entries in the cached database and ensure
	 * no entries are stale. All entries that are deemed to be stale will be evicted and freshly populated.
	 * This prevents stale data from being served up too often.
	 */
	CronTasks._scanAnime = function() {

		AnimeModel.find({}, function(err, animeCollection) {

			var today = new Date();

			// check expiry on every item
			animeCollection.forEach(function(anime) {

				// if it's eviction time...
				if(today > anime.expiry) {
					console.log(anime.name + ' was evicted for being in the cache too long.')
					anime.remove();

					// Fetch a new copy
					Anime.byId(anime.mal_id, function() {
						console.log(anime.name + ' was refreshed succesfully.');
					});

				}

			});

		});


	},


	/**
	 * This is a task that when run, will scan all managa in the cached database and ensure
	 * no entries are stale. Manga that is found to be stale will be evicted over time.
	 * @return {[type]} [description]
	 */
	CronTasks._scanManga = function() {

		MangaModel.find({}, function(err, mangaCollection) {

			var today = new Date();

			// check expiry on every item
			mangaCollection.forEach(function(manga) {				

				// if it's eviction time...
				if(today > manga.expiry) {
					console.log(manga.name + ' was evicted for being in the cache too long.')
					manga.remove();

					// Fetch a new copy
					Manga.byId(manga.mal_id, function() {
						console.log(manga.name + ' was refreshed succesfully.');
					});

				}

			});

		});

	} // end _scanManga


	return CronTasks;
})();

module.exports = CronTasks;