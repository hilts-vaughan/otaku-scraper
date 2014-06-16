var api = global.api
  , cheerio = require('cheerio')
  , request = require('request')
  , Manga = require('../mal/manga')
  , MangaModel = require('../../db/model_manga')
  , MangaReviewsModel = require('../../db/model_review')('Manga')
  , CommonReviews = require('./reviews_common')
  ;

api.mal.manga.reviews = {
	idAll: function(req, res, next) {
		res.type('application/json');
		var id = req.params.id;

		MangaReviews.byId(id, function(err, reviews) {
			if (err) {
				return next(err);
			}

			res.send(reviews);
		});
	},
	nameAll: function(req, res, next) {
		res.type('application/json');
		var name = req.params.name;

		CommonReviews.byName(name, function(err, reviews) {
			if (err) {
				return next(err);
			}

			res.send(reviews);
		}, Manga, MangaReviews);
	}
};


var MangaReviews = (function() {
	function MangaReviews() {}

	MangaReviews.byId = function(id, callback) {
		var that = this;

		id = Number(id);

		MangaReviewsModel.findOne({
			"mal_id": id
		}, function(err, reviews) {
			if (reviews == null) {
				console.log("debug");
				CommonReviews.downloadReviews(id, function(reviewsObject) {
					callback(null, reviewsObject);
				}, 'manga', Manga, MangaReviewsModel);
			} else {
				callback(null, reviews);
			}
		});
	};

	MangaReviews.byName = function(name, callback) {
		var that = this;

		Manga.lookup(name, function(err, mal_id) {
            if (err) {
                return next(err);
            }

            MangaReviews.byId(mal_id, callback);
        });
	};

	// export our class
	return MangaReviews;
})();

// Export the module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MangaReviews;
}