var request = require('request');
var qs = require('querystring');
var api = global.api;
parseString = require('xml2js').parseString;
var auth = require('basic-auth');
var js2xmlparser = require("js2xmlparser");
var _ = require('lodash-node');


maltemplate = {};

/**
 * A hacky template for MAL manga
 */
maltemplate.manga = {
	"chapter": 0,
	"volume": 0,
	"status": "plantoread",
	"score": 0,
	"downloaded_chapters": 0,
	"times_reread": 0,
	"reread_value": 0,
	date_start: "",
	date_finish: "",
	priority: 0,
	enable_discussion: 0,
	enable_rereading: 0,
	comments: "",
	"scan_grou": "",
	"tags": "otakucompanion",
	retail_volumes: 0
};

maltemplate.anime = {
	episode: 0,
	status: 6,
	score: 0,
	downloaded_episodes: 0,
	storage_type: 0,
	storage_value: 0,
	times_rewatched: 0,
	rewatch_value: 0,
	date_start: "",
	date_finish: "",
	priority: 0,
	enable_discussion: 0,
	enable_rereading: 0,
	comments: "",
	fansub_group: "",
	"tags": "otakucompanion"
};


api.mal.list = {};

api.mal.list.fetch = function(req, res, next) {
	res.type('application/json');

	ContentList.fetch(req.params.user, req.params.type, function(err, list) {
		res.send(list);
	});

},


api.mal.list.add = function(req, res, next) {
	res.type('application/json');


	ContentList.add(req.params.user, req.params.type, req, req.params.id, function(err, list) {
		res.send(err);
	});

},

api.mal.list.update = function(req, res, next) {
	res.type('application/json');


	ContentList.update(req.params.user, req.params.type, req, req.params.id, function(err, list) {
		res.send(list);
	});
},

api.mal.list.delete = function(req, res, next) {
	res.type('application/json');

	ContentList.delete(req.params.user, req.params.type, req, req.params.id, function(err, list) {
		res.send(list);
	});
}



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

		var header = req.headers['authorization'] || '', // get the header
			token = header.split(/\s+/).pop() || '', // and the encoded auth token
			auth = new Buffer(token, 'base64').toString(), // convert from base64
			parts = auth.split(/:/), // split on colon
			username = parts[0],
			password = parts[1];

		var x = new Buffer(username + ":" + password).toString('base64');

		//'Authorization': 'Basic ' + header
		var url = "http://myanimelist.net/api/{}list/add/[id].xml".replace("{}", type).replace("[id]", id);
		console.log(url);



		var xmlDoc = "";

		if (type == "manga") {
			xmlDoc = js2xmlparser("entry", maltemplate.manga);
		} else {
			xmlDoc = js2xmlparser("entry", maltemplate.anime);
		}

		request.post(
			url, {

				form: {
					"id": id,
					data: xmlDoc
				},


				headers: {
					'User-Agent': 'api-team-692e8861471e4de2fd84f6d91d1175c0',
					'Authorization': 'Basic ' + x
				}

			},
			function(error, response, body) {
				if (!error && response.statusCode == 200) {
					callback("OK");
				} else {
					callback(error + " " + response.statusCode);
				}
			}
		);



	},


	ContentList.update = function(user, type, req, id, callback) {
		console.log(req.body);

		var n = {}
		if (type == "anime") {
			n = _.extend(_.clone({}), req.body);
		} else {
			n = _.extend(_.clone({}), req.body);
		}

		var header = req.headers['authorization'] || '', // get the header
			token = header.split(/\s+/).pop() || '', // and the encoded auth token
			auth = new Buffer(token, 'base64').toString(), // convert from base64
			parts = auth.split(/:/), // split on colon
			username = parts[0],
			password = parts[1];

		var x = new Buffer(username + ":" + password).toString('base64');

		//'Authorization': 'Basic ' + header
		var url = "http://myanimelist.net/api/{}list/update/[id].xml".replace("{}", type).replace("[id]", id);
		console.log(url);
		console.log(n);



		var xmlDoc = "";
		xmlDoc = js2xmlparser("entry", n);


		request.post(
			url, {

				form: {
					"id": id,
					data: xmlDoc
				},


				headers: {
					'User-Agent': 'api-team-692e8861471e4de2fd84f6d91d1175c0',
					'Authorization': 'Basic ' + x
				}

			},
			function(error, response, body) {
				if (!error && response.statusCode == 200) {
					callback("OK");
				} else {
					callback(error + " " + response.statusCode);
					console.log(body);					
				}
			}
		);




	},


	ContentList.delete = function(user, type, req, id, callback) {

		var header = req.headers['authorization'] || '', // get the header
			token = header.split(/\s+/).pop() || '', // and the encoded auth token
			auth = new Buffer(token, 'base64').toString(), // convert from base64
			parts = auth.split(/:/), // split on colon
			username = parts[0],
			password = parts[1];

		var x = new Buffer(username + ":" + password).toString('base64');

		//'Authorization': 'Basic ' + header
		var url = "http://myanimelist.net/api/{}list/delete/[id].xml".replace("{}", type).replace("[id]", id);


		request.post(
			url, {

				form: {
					"id": id
				},


				headers: {
					'User-Agent': 'api-team-692e8861471e4de2fd84f6d91d1175c0',
					'Authorization': 'Basic ' + x
				}

			},
			function(error, response, body) {
				if (!error && response.statusCode == 200) {
					callback("OK");
				} else {
					callback(error + " " + response.statusCode);
					console.log(body)
				}
			}
		);



	};


	return ContentList;
})();

// Export the module
if (typeof module !== 'undefined' && module.exports) {
	module.exports = ContentList;
}