/*
	Defines our schema and interactive model for anime titles
	This is a mongoose defined model.
*/
mongoose = require('mongoose');

var animeSchema = mongoose.Schema({
	name: String,
	expiry: Date,
	titles: {
		english: [],
		synonyms: [],
		japanese: []
	},
	poster: String,
	synopsis: String,
	type: String,
	status: Number,
	episodes: Number,
	genres: [],
	"malstats": {
		rating: String,
		rank: Number,
		score: Number
	},
	mal_id: Number
});

var AnimeModel = mongoose.model('AnimeModel', animeSchema);

module.exports = AnimeModel;