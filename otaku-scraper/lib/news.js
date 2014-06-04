var parseString = require('xml2js').parseString
  , request = require('request')
  ;

var News = (function() {
    function News() {}

    News.fetch = function(callback) {
        request({
            url: 'http://myanimelist.net/rss.php?type=news',
            headers: { 'User-Agent': 'api-team-692e8861471e4de2fd84f6d91d1175c0' },
            timeout: 3000
        }, function(err, response, body) {
            if (err) {            
                return callback(err);
            }

            parseString(body, function(err, result) {
                var news = [];
                var items = result.rss.channel[0].item;

                callback(null, items);
            });
        });
    }

    // export our class
    return News;
})();

// Export the module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = News;
}
