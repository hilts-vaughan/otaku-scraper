var mongoose = require('mongoose')
  , schemaTranslation = require('schema_translation')
  ;

var schemaTranslationPair = mongoose.schema({
	language: String,
	translation: schemaTranslation,
});

/* Module Export */
if (typeof module !== 'undefined' && module.exports) {
	module.exports = schemaTranslationPair;
}