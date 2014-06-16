var request = require('request');
var qs = require('querystring');
var api = global.api;
parseString = require('xml2js').parseString;
var auth = require('basic-auth');

api.mal.list = {};

api.mal.list.fetch = function(req, res, next) {
	res.type('application/json');

	ContentList.fetch(req.params.user, req.params.type, function(err, list) {
		res.send(list);
	});

};


api.mal.list.add = function(req, res, next) {
	res.type('application/json');

	var auth = auth(req);
	ContentList.add(req.params.user, req.params.type, req, req.params.id, function(err, list) {
		res.send(list);
	});

}

api.mal.list.update = function(req, res, next) {
	res.type('application/json');

	var auth = auth(req);
	ContentList.update(req.params.user, req.params.type, req, function(err, list) {
		res.send(list);
	});
}

api.mal.list.delete = function(req, res, next) {
	res.type('application/json');

	var auth = auth(req);
	ContentList.update(req.params.user, req.params.type, req, req.params.id, function(err, list) {
		res.send(list);
	});
}



var ContentList = ( function() {
	function ContentList() {}

	ContentList.fetch = function(user, type, callback) {

		request({
				url: 'http://myanimelist.net/malappinfo.php?u=' + user + "&status=all&type=" + type,
				headers: {
					'User-Agent': 'api-team-692e8861471e4de2fd84f6d91d1175c0'
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

	},




	ContentList.add = function(user, type, req, id, callback) {

	},


	ContentList.update = function(user, type, req, callback) {

	},


	ContentList.delete = function(user, type, req, id, callback) {

	};


	return ContentList;
})();

// Export the module
if (typeof module !== 'undefined' && module.exports) {
	module.exports = ContentList;
}