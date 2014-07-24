/**
 * AnimeController
 *
 * @module      :: Controller
 * @description	:: A basic controller 
 */

module.exports = {


	find: function(req, res) {

		var id = req.param('id');

		if (!id) {
			res.send(405);
		} else {

			Anime.findOne(id).done(function(err, anime) {

				if (!anime) {
					res.notFound();
					return;
				}

				if (err) {
					sails.log.error("The following error occured while trying to fetch anime: " + err);
					res.send(500);
				}


				res.json(anime);
			});


		}

	},

	create: function(req, res, next) {

		// action nor support
		res.send(405);

	},

	destroy: function(req, res) {
		res.send(405);
	},

	update: function(req, res) {
		res.send(405);
	},



	/**
	 * Overrides for the settings in `config/controllers.js`
	 * (specific to AnimeController)
	 */
	_config: {}


};