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
	status: Number,
	episodes: Number,
	genres: [],
	malstats: Object,
	mal_id: Number,
	publishDate: Date,
	chapters: Number
});

var MangaModel = mongoose.model('MangaModel', mangaSchema);

// Export the module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MangaModel;
}