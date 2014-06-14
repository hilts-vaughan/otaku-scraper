var api = global.api
  ;

api.ref.statusCodes = {
	STATUS_FUTURE: 0,
	STATUS_CURRENT: 1,
	STATUS_COMPLETED: 2,

	0: "STATUS_FUTURE",
	1: "STATUS_CURRENT",
	2: "STATUS_COMPLETED",

	"STATUS_FUTURE": 0,
	"STATUS_CURRENT": 1,
	"STATUS_COMPLETED": 2,

	get: function(request, response, next) {
		response.type('application/json');

		var code = new Number(request.params.code);
		if (isNaN(code))
			code = -1;

		var literal = api.ref.statusCodes[code];
		if (literal === undefined)
			literal = "UNKNOWN";

		response.send({ "literal": literal });
	}
};

api.ref.anime = {
	typeCodes: {
		TYPE_TV: 0,
		TYPE_OVA: 1,
		TYPE_MOVIE: 2,
		TYPE_SPECIAL: 3,
		TYPE_ONA: 4,
		TYPE_MUSIC: 5,

		0: "TYPE_TV",
		1: "TYPE_OVA",
		2: "TYPE_MOVIE",
		3: "TYPE_SPECIAL",
		4: "TYPE_ONA",
		5: "TYPE_MUSIC",

		"TYPE_TV": 0,
		"TYPE_OVA": 1,
		"TYPE_MOVIE": 2,
		"TYPE_SPECIAL": 3,
		"TYPE_ONA": 4,
		"TYPE_MUSIC": 5,

		get: function(request, response, next) {
			response.type('application/json');

			var code = new Number(request.params.code);
			if (isNaN(code))
				code = -1;

			var literal = api.ref.anime.typeCodes[code];
			if (literal === undefined)
				literal = "UNKNOWN";

			response.send({ "literal": literal });
		}
	},
	ratings: {
		RATING_ALL: 0,
		RATING_CHILDREN: 1,
		RATING_TEENS: 2,
		RATING_MATURE: 3,
		RATING_MILD_NUDITY: 4,
		RATING_HENTAI: 5,

		0: "RATING_ALL",
		1: "RATING_CHILDREN",
		2: "RATING_TEENS",
		3: "RATING_MATURE",
		4: "RATING_MILD_NUDITY",
		5: "RATING_HENTAI",

		"RATING_ALL": 0,
		"RATING_CHILDREN": 1,
		"RATING_TEENS": 2,
		"RATING_MATURE": 3,
		"RATING_MILD_NUDITY": 4,
		"RATING_HENTAI": 5,

		get: function(request, response, next) {
			response.type('application/json');

			var code = new Number(request.params.code);
			if (isNaN(code))
				code = -1;

			var literal = api.ref.anime.ratings[code];
			if (literal === undefined)
				literal = "UNKNOWN";

			response.send({ "literal": literal });
		}
	}
};

// Export the module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = api.ref;
}