/*
	Defines our schema and interactive model for chart data.
	This is a mongoose defined model.
*/
mongoose = require('mongoose');

var mangaSchema = mongoose.Schema({
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
	status: String,
	episodes: Number,
	genres: [],
	malstats: Object,
	mal_id: Number
});

var MangaModel = mongoose.model('manga', mangaSchema);

module.exports = MangaModel;