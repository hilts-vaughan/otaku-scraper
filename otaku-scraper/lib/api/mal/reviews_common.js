var api = global.api
  , cheerio = require('cheerio')
  , request = require('request')
  ;

var CommonReviews = (function() {
	function CommonReviews() {}

	CommonReviews.validateURL = function(url) {
		url = url.trim();

		if (url.indexOf("http://myanimelist.net") < 0)
			return "http://myanimelist.net" + (url.indexOf("/") == 0 ? "" : "/") + url;

		return url;
	};

	CommonReviews._downloadReviews = function(id, callback, urlType, objectType, modelType) {
		request({
			url: 'http://myanimelist.net/' + urlType + '/' + id,
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
				url: CommonReviews.validateURL(reviewURL),
				headers: {
					'User-Agent': 'api-team-692e8861471e4de2fd84f6d91d1175c0'
				},
				timeout: 3000
			}, function(err, response, body) {
				console.log("Common: " + CommonReviews.validateURL(reviewURL));
				var reviewsList = CommonReviews._tryParseReviews(body);

				objectType.byId(id, function(err, object) {
        			var now = new Date();
					var reviewsObject = {
						mal_id: id,
						reviews: reviewsList,

						// Set the expiry to 7 days; this is how often we evict manga entries from our cache
						expiry: now.setDate(now.getDate() + 7)
					};

					/* Insert the record iff it's not an invalid request */
					if (object['name'] != "Invalid Request") {
						var reviewsModel = new modelType(reviewsObject);
						reviewsModel.save();
					}

					callback(reviewsObject);
				});
			});
		});
	};

	CommonReviews._tryParseReviews = function(html) {
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
	return CommonReviews;
})();

// Export the module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CommonReviews;
}