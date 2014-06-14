var api = global.api,
	cheerio = require('cheerio'),
	request = require('request'),
	Anime = require('../mal/anime.js');
AnimeModel = require('../../db/animemodel');

api.mal.anime.reviews = {
	all: function(req, res, next) {

		res.type('application/json');

		var id = req.params.id;

		AnimeReviews.byId(id, function(err, reviews) {
			if (err) {
				return next(err);
			}

			res.send(reviews);
		});


	}
};


var AnimeReviews = (function() {
	function AnimeReviews() {}

	AnimeReviews.byId = function(id, callback) {

		AnimeModel.findOne({
			"mal_id": id
		}, function(err, reviews) {

			if(reviews == null)
				reviews = {};

			callback(null, reviews.reviews);

		});


	};

	// export our class
	return AnimeReviews;
})();

module.exports = AnimeReviews;