var cheerio = require('cheerio')
  , request = require('request')
  , MAL = require("./mal.js")
  , MangaModel = require('../../db/model_manga')
  ;

var api = global.api;

api.mal.manga = {
	id: function(req, res, next) {
        res.type('application/json');

        var id = req.params.id;
        Manga.byId(id, function(err, manga) {
            if (err) {
                return next(err);
            }

            res.send(manga);
        });
    },
    name: function(req, res, next) {
        res.type('application/json');

        var name = req.params.name;
        MAL.contentByName(name, function(err, manga) {
            if (err) {
                return next(err);
            }

            res.send(manga);
        }, Manga);
    },
    search: function(req, res, next) {
        res.type('application/json');

        var name = req.params.name;
        Manga.lookup(name, function(err, mal_id) {
            if (err) {
                return next(err);
            }

            res.send({ "mal_id": mal_id });
        });
    }
}

var Manga = (function() {
	function Manga() {}

	/**
	 * Attempts to find and retrieve a manga from the MAL DB.
	 * This method will usually return almost instantly but sometimes
	 * a cache hit will be incurred and the manga will be fetched from the MAL
	 * DB all over again.
	 * @param  {[Number]}   id - The ID of the manga to fetch
	 * @param  {Function} callback - The callback to be executed with the manga model.
	 */
	Manga.byId = function(id, callback) {
		id = Number(id);

		// Attempt to find it in our DB and return it if we can immediately
		MangaModel.findOne({
			mal_id: id
		}, function(error, results) {
			if (results == null) {
				console.log("Fetching manga from MAL DB with ID #" + id);

				// download and return
				MAL.contentDownload(id, function(object) {

					// Persist to the DB if we need to
					/* Insert the record iff it's not an invalid request */
					if (object['name'] != "Invalid Request") {
						var model = new MangaModel(object);
						model.save();
					}

					callback(null, object);
				}, 'manga', Manga);
			} else {
				callback(null, results);
			}
		});

	};


	/**
	 * Attempts to parse the HTML from the given MAL page and return valid JSON.
	 * @param  {[type]} html - A valid HTML markup
	 */
	Manga.tryParse = function(html) {

		var $ = cheerio.load(html);
		var manga = {};

		manga.name = $('h1').first().contents().filter(function() {
			return this.type !== 'tag';
		}).text();

		// Set the expiry to 7 days; this is how often we evict anime entries from our cache
		var now = new Date();
		manga.expiry = now.setDate(now.getDate() + 7);

		manga.poster = $('.borderClass img').attr('src');

		// Get the summary of the show
		manga.synopsis = $("h2:contains('Synopsis')").parent().text().substring(8);
		// We can grab some stats here
		var type = "Type:";
		manga.type = $(".dark_text:contains('Type:')").parent().text().substring(type.length + 1);

		var status = "Status:";
		var textStatus = $(".dark_text:contains('Status:')").parent().text().substring(status.length + 1);

		manga.status = 0;
        if (textStatus.toLowerCase().indexOf("finished") > -1)
            manga.status = 2;
        else if (textStatus.toLowerCase().indexOf("publishing") > -1)
            manga.status = 1;

		manga.genres = [];
		var genres = "Genres:";
		var englishGenres = $(".dark_text:contains('Genres:')").parent().text().substring(genres.length + 4).split(",");
		for (var genre in englishGenres)
			manga.genres.push(englishGenres[genre].trim());

		manga.malstats = {};

		var rating = "Rating:";
		manga.malstats.rating = $(".dark_text:contains('Rating:')").parent().text().substring(rating.length + 4);

		var rank = "Ranked:";
		manga.malstats.rank = $(".dark_text:contains('Ranked:')").parent().first().contents().filter(function() {
			return this.type !== 'tag';
		}).text().trim().substring(1);

		manga.malstats.score = $(".dark_text:contains('Score:')").parent().first().contents().filter(function() {
			return this.type !== 'tag';
		}).text().trim();

		return manga;

	};

	Manga.lookup = function(name, callback, params) {
        if (params === undefined)
            params = "type=1";

        var that = this;

        request({
            url: 'http://myanimelist.net/manga.php?' + params + '&q=' + encodeURIComponent(name.replace(/[\~\&\:\!\.\*]/g, "")),
            headers: {
                'User-Agent': 'api-team-692e8861471e4de2fd84f6d91d1175c0'
            },
            timeout: 10000
        }, function(err, response, body) {
            if (err) {
                return callback(err);
            }

            var $ = cheerio.load(body.toLowerCase());
            var isresults = $('.normal_header').text().indexOf("search results") != -1;
            var mal_id = -1;

            if (isresults) {
                if (body.indexOf("No titles that matched your query were found.") == -1) {
                    var atag = $("a:contains('" + name.toLowerCase() + "')");
			        atag.each(function(index, element) {
			        	var selector = $(element);

			        	if (selector.text().trim() == name.toLowerCase().trim()) {
			        		atag = selector;
			        	}
			        });

                    var href = atag.attr("href");
                    var offset = "/manga/".length;
                    mal_id = href;
                    if (href !== undefined)
                        mal_id = mal_id.substring(offset, href.indexOf("/", offset));
                }
            } else {
                var doEdit = "javascript:doedit(";
                var idxDoEdit = body.indexOf(doEdit) + doEdit.length;
                mal_id = body.substring(idxDoEdit, body.indexOf(");", idxDoEdit));
            }

            mal_id = new Number(mal_id);
            if (isNaN(mal_id))
                mal_id = -2;

            if (mal_id == -1 && params.length > 0)
                Anime.lookup(name, callback, "");
            else
                callback(null, mal_id);
        });
    };

	return Manga;

})();

// Export the module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Manga;
}