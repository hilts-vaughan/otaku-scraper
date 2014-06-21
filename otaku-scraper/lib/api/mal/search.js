var request = require('request');
var qs = require('querystring');
var api = global.api;
parseString = require('xml2js').parseString;
var auth = require('basic-auth');


api.mal.search = function(req, res, next) {
	var type = req.params.type;
	var q = req.query.q;

	var header = req.headers['authorization'] || '', // get the header
		token = header.split(/\s+/).pop() || '', // and the encoded auth token
		auth = new Buffer(token, 'base64').toString(), // convert from base64
		parts = auth.split(/:/), // split on colon
		username = parts[0],
		password = parts[1];

	MALSearch.fetch(q, type, username, password, function(err, results) {
		res.send(results);
	});

}



var MALSearch = (function() {
	function MALSearch() {}

	MALSearch.fetch = function(q, type, u, p, callback) {

		var header = new Buffer(u + ":" + p).toString('base64');

		request({
				url: 'http://myanimelist.net/api/' + type + '/search.xml?q=' + q,
				headers: {
					'User-Agent': 'api-team-692e8861471e4de2fd84f6d91d1175c0',
					'Authorization': 'Basic ' + header
				}
			},
			function(error, response, body) {
				if (!error && response.statusCode == 200) {

					parseString(body, function(err, result) {
						var items = result;
						callback(null, items);
					});


				} else {
					callback(error, null);
				}
			})

	};



	return MALSearch;
})();

// Export the module
if (typeof module !== 'undefined' && module.exports) {
	module.exports = MALSearch;
}