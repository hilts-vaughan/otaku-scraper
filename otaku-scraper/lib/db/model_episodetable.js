var mongoose = require('mongoose')
  ;

var schemaTableEpisode = mongoose.Schema({
	num_entries: Number
}, { collection: 'table_episode' });

var ModelTableEpisode = mongoose.model('ModelTableEpisode', schemaTableEpisode);

/* Module Export */
if (typeof module !== 'undefined' && module.exports) {
	module.exports = ModelTableEpisode;
}