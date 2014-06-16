var request = require('request');
var qs = require('querystring');
var api = global.api;


api.mal.list = function(req, res, next) {
	res.type('application/json');

	ContentList.fetch(req.params.user, req.params.type, function(err, list) {
		res.send(list);
	});

};


var ContentList = (function() {
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
					callback(null, body);
				} else {
					callback(error, null);
				}
			})

	};


	return ContentList;
})();

// Export the module
if (typeof module !== 'undefined' && module.exports) {
	module.exports = ContentList;
}