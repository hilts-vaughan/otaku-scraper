var cheerio = require('cheerio')
  , request = require('request')
  , AnimeModel = require('../../db/model_anime')
  ;

var MAL = (function() {
    function MAL() {}

    MAL.contentByName = function(name, callback, objectType) {
        objectType.lookup(name, function(err, mal_id) {
            if (err) {
                return callback(err);
            }

            objectType.byId(mal_id, callback);
        });
    };

    MAL._contentDownload = function(id, callback, urlType, objectType) {
        request({
            url: 'http://myanimelist.net/' + urlType + '/' + id,
            headers: {
                'User-Agent': 'api-team-692e8861471e4de2fd84f6d91d1175c0'
            },
            timeout: 3000
        }, function(error, response, body) {
            if (error) {
                return callback(error);
            }
            
            var object = objectType._tryParse(body);
            object['mal_id'] = id;

            callback(object);
        });
    };

    // export our class
    return MAL;
})();

// Export the module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MAL;
}