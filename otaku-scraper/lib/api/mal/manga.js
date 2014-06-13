cheerio = require('cheerio');
request = require('request');
MangaModel = require('../../db/MangaModel');

var api = global.api
api.mal.manga = {

	id: function(req, res, next) {
		res.type('application/json');

		var id = req.params.id;

		Manga.findById(id, function(err, manga) {
			if (err) {
				return next(err);
			}

			res.send(manga);
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
	Manga.findById = function(id, callback) {

		var that = this;

		// Attempt to find it in our DB and return it if we can immediately
		MangaModel.findOne({
			mal_id: id
		}, function(err, manga) {

			if (manga == null) {
				// download and return
				that._downloadManga(id, function(mangaObject) {

					// Persist to the DB if we need to
					/* Insert the record iff it's not an invalid request */
					if (mangaObject['name'] != "Invalid Request") {
						var mangaModel = new MangaModel(mangaObject);
						mangaModel.save();
					}

					callback(null, mangaObject);
				});
			} else {
				callback(null, manga);
			}

		});

	};


	/**
	 * Fetches a manga from the MAL DB and executes a callback
	 * containing the data. This call is expensive to make and speed
	 * is dependent on the remote server. It is possible to get garbage back.
	 * @param  {[Number]}   id - The ID of the manga to download
	 * @param  {Function} callback - The callback to be executed
	 */
	Manga._downloadManga = function(id, callback) {

		var that = this;
		request({
			url: 'http://myanimelist.net/manga/' + id,
			headers: {
				'User-Agent': 'api-team-692e8861471e4de2fd84f6d91d1175c0'
			},
			timeout: 3000
		}, function(err, response, body) {
			if (err) {
				return callback(err);
			}

			var mangaObject = that._tryParse(body);
			mangaObject['mal_id'] = id;

			callback(mangaObject);
		});
	};


	/**
	 * Attempts to parse the HTML from the given MAL page and return valid JSON.
	 * @param  {[type]} html - A valid HTML markup
	 */
	Manga._tryParse = function(html) {

		var $ = cheerio.load(html);
		var manga = {};

		manga.name = $('h1').first().contents().filter(function() {
			return this.type !== 'tag';
		}).text();

		// Set the expirty to 7 days; this is how often we evict anime entries from our cache
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
		manga.status = textStatus;

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

	return Manga;

})();

module.exports = Manga;