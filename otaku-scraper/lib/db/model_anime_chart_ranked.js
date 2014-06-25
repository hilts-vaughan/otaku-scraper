/*
	Defines our schema and interactive model for anime titles
	This is a mongoose defined model.
*/
mongoose = require('mongoose');

var animeChartRankedSchema = mongoose.Schema({	
	mal_id: Number,
	rank: Number,
});

var AnimeChartRankedModel = mongoose.model('AnimeChartRankedModel', animeChartRankedSchema);

// Export the module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimeChartRankedModel;
}