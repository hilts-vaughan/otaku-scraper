var ModelAnime = require('./model_anime')
  , ModelAnimeTable = require('./model_animetable')
  , ModelEpisode = require('./model_episode')
  , ModelEpisodeTable = require('./model_episodetable')
  ;

var AnimeDB = {
	function AnimeDB() {}

	AnimeDB.byID = function(id, callback, options) {
		options = checkOptions(options);
		id = Number(id);

		ModelAnime.findOne({
			'id': id
		}, function(error, result) {
			if (!error && result != null) {
				return callback(result);
			}

			return callback(null);
		});
	};

	AnimeDB.byTitle = function(title, callback, options) {
		options = checkOptions(options);


	};

	AnimeDB.checkOptions = function(options) {
		if (options === undefined || options == null) {
			return {
				type: -1,
				status: -1,
				tag: null,
				producer: -1,
				rated: -1,
				airing_start: null,
				airing_end: null,
			};
		}

		if (options.['type'] === undefined || options.['type'] == null)
			options.['type'] = -1;

		if (options.['status'] === undefined || options.['status'] == null)
			options.['status'] = -1;

		if (options.['tag'] === undefined)
			options.['tag'] = null;

		if (options.['producer'] === undefined || options.['producer'] == null)
			options.['producer'] = -1;

		if (options.['rated'] === undefined || options.['rated'] == null)
			options.['rated'] = -1;

		if (options.['airing_start'] === undefined)
			options.['airing_start'] = null;

		if (options.['airing_end'] === undefined)
			options.['airing_end'] = null;

		return options;
	};
};

/* Module Export */
if (typeof module !== 'undefined' && module.exports) {
	module.exports = AnimeDB;
}