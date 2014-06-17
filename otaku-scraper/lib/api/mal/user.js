var request = require('request');
var qs = require('querystring');
var api = global.api;
parseString = require('xml2js').parseString;
var auth = require('basic-auth');

/**
 * A route for user authentication. Returns either
 * true or false to the client asking.
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
api.mal.user = function(req, res, next) {

  var header=req.headers['authorization']||'',        // get the header
      token=header.split(/\s+/).pop()||'',            // and the encoded auth token
      auth=new Buffer(token, 'base64').toString(),    // convert from base64
      parts=auth.split(/:/),                          // split on colon
      username=parts[0],
      password=parts[1];


	MALAccount.checkCreds(username, password, function(a, data) {
		res.send(data);
	});

}


var MALAccount = (function() {
	function MALAccount() {}

	MALAccount.checkCreds = function(username, password, callback) {
		var header = new Buffer(username + ":" + password).toString('base64');
		request({
				url: 'http://myanimelist.net/api/account/verify_credentials.xml',
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

	return MALAccount;

})();


module.exports = MALAccount;