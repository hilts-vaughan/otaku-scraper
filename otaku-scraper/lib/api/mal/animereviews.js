var api = global.api
  , cheerio = require('cheerio')
  , request = require('request')
  , Anime = require('../mal/anime.js')
  , AnimeModel = require('../../db/animemodel')
  , ReviewsModel = require('../../db/reviewsmodel')
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

		ReviewsModel.findOne({
			"mal_id": id
		}, function(err, reviews) {
			if (reviews == null) {
				that._downloadReviews(id, function(reviewsObject) {
					callback(null, reviewsObject);
				});
			} else {
				callback(null, reviews);
			}
		});
	};

	AnimeReviews._downloadReviews = function(id, callback) {
		var that = this;

		request({
			url: 'http://myanimelist.net/anime/' + id,
			headers: {
				'User-Agent': 'api-team-692e8861471e4de2fd84f6d91d1175c0'
			},
			timeout: 3000
		}, function(err, response, body) {
			if (err) {
				return callback(err);
			}

			// Now, try and grab reviews URL, then we'll do a parse and scrape
			var $ = cheerio.load(body);
			var reviewURL = $("#horiznav_nav").find('a:contains(Reviews)').first().attr('href');

			request({
				url: reviewURL,
				headers: {
					'User-Agent': 'api-team-692e8861471e4de2fd84f6d91d1175c0'
				},
				timeout: 3000
			}, function(err, response, body) {
				var reviewsList = that._tryParseReviews(body);

				Anime.byId(id, function(err, anime) {
        			var now = new Date();
					var reviewsObject = {
						mal_id: id,
						reviews: reviewsList,

						// Set the expiry to 7 days; this is how often we evict anime entries from our cache
						expiry: now.setDate(now.getDate() + 7)
					};

					/* Insert the record iff it's not an invalid request */
					if (anime['name'] != "Invalid Request") {
						var reviewsModel = new ReviewsModel(reviewsObject);
						reviewsModel.save();
					}

					callback(reviewsObject);
				});
			});
		});
	};

	AnimeReviews._tryParseReviews = function(html) {
        var $ = cheerio.load(html);
        var reviews = [];

        $('.borderDark').each(function(i, elem) {
            var reviewItem = {};
            reviewItem.avatar = $(this).find('.picSurround').find('img').attr('src');
            reviewItem.authour = $(this).find('a').eq(2).text();
            reviewItem.rating = parseInt($(this).find('a').eq(5).parent().text().substring(16));
            reviewItem.body = $(this).find('.spaceit.textReadability').first().html().trim();
            reviewItem.body = reviewItem.body.replace(/(\<br>)/gm, "\n").trim();
            reviewItem.body = reviewItem.body.replace(/<[^>]*>/g, '');

            // Grab the ratings, split
            var ratingsStrings = reviewItem.body.split("\n\t\t");
            ratingsStrings = ratingsStrings.filter(function(e) {
                return e && e != '\t';
            });

            var index;
            for (index = 0; index < ratingsStrings.length; ++index) {
                ratingsStrings[index] = ratingsStrings[index].replace(/(\r\n|\n|\r|\t)/gm, "");
            }
            ratingsStrings.pop();
            
            reviewItem.ratings = {};
            for (index = 0; index < ratingsStrings.length; ++index) {
                reviewItem.ratings[ratingsStrings[index].trim()] = parseInt(ratingsStrings[index + 1]);
                index++;
            }

            var a = reviewItem.body.lastIndexOf('\t');
            reviewItem.body = reviewItem.body.substring(a + 1, reviewItem.body.length - 9);

            reviews.push(reviewItem);
        });

        return reviews;
    };

	// export our class
	return AnimeReviews;
})();

module.exports = AnimeReviews;