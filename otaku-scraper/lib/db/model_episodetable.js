var mongoose = require('mongoose')
  ;

var schemaTableAnime = mongoose.Schema({
	num_entries: Number
}, { collection: 'table_episode' });

var ModelTableEpisode = mongoose.model('ModelTableEpisode', schemaTableAnime);

/* Module Export */
if (typeof module !== 'undefined' && module.exports) {
	module.exports = ModelTableEpisode;
}