var api = global.api
  , cheerio = require('cheerio')
  , request = require('request')
  , Anime = require('../mal/anime')
  , AnimeModel = require('../../db/model_anime')
  , AnimeReviewsModel = require('../../db/model_review')('Anime')
  , CommonReviews = require('./reviews_common')
  ;

api.mal.anime.reviews = {
	idAll: function(req, res, next) {
		res.type('application/json');
		var id = req.params.id;

		AnimeReviews.byId(id, function(err, reviews) {
			if (err) {
				return next(err);
			}

			res.send(reviews);
		});
	},
	nameAll: function(req, res, next) {
		res.type('application/json');
		var name = req.params.name;

		AnimeReviews.byName(name, function(err, reviews) {
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
		var that = this;

		id = Number(id);

		AnimeReviewsModel.findOne({
			"mal_id": id
		}, function(err, reviews) {
			if (reviews == null) {
				CommonReviews._downloadReviews(id, function(reviewsObject) {
					callback(null, reviewsObject);
				}, 'anime', Anime, AnimeReviewsModel);
			} else {
				callback(null, reviews);
			}
		});
	};

	AnimeReviews.byName = function(name, callback) {
		var that = this;

		Anime.lookup(name, function(err, mal_id) {
            if (err) {
                return next(err);
            }

            AnimeReviews.byId(mal_id, callback);
        });
	};

	// export our class
	return AnimeReviews;
})();

// Export the module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimeReviews;
}