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
	malstats: Object,
	mal_id: Number,
	airDate: Date
});

var AnimeModel = mongoose.model('AnimeModel', animeSchema);

// Export the module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimeModel;
}