var cheerio = require('cheerio')
  , request = require('request')
  ;

var Anime = (function() {
    function Anime() {}

    Anime.byId = function(id, callback, db) {
        var that = this;
        db.get('anime').findOne({"mal_id": id}, function(err, document) {
            // Feed from cache if we can
            if(!err && document != null) {
                console.log('fetch');
                callback(null, JSON.stringify(document));
            }

            // Otherwise, we can try to parse
            else {
                request({
                    url: 'http://myanimelist.net/anime/'+id,
                    headers: { 'User-Agent': 'api-team-692e8861471e4de2fd84f6d91d1175c0' },
                    timeout: 3000
                }, function(err, response, body) {
                    if (err) {            
                        return callback(err);
                    }

                    var animeObject = that.tryParse(body);
                    animeObject['mal_id'] = id;

                    // Insert this anime record
                    db.get('anime').insert(animeObject);

                    callback(null, animeObject);
                });

            } // end else

        });

    };

    /*
      This method is really fragile; it's subject to page layout changes.
      We should do our best to keep up with breakages
    */
    Anime.tryParse = function(html) {
        var $ = cheerio.load(html);
        var anime = {};

        // Extract the name from our DOM
        var name = $('h1').first().contents().filter(function() {
            return this.type !== 'tag';
        }).text();

        anime.name = name;

        // Set the expirty to 7 days; this is how often we evict anime entries from our cache
        var now = new Date();
        anime.expiry = now.setDate(now.getDate() + 7);

        // Grab Alternative Titles (English, Synonyms, Japanese)
        anime.titles = {};
        anime.titles.english = [];
        anime.titles.synonyms = [];
        anime.titles.japanese = [];

        var altEnglish = "English:";
        var englishTitles = $(".dark_text:contains('English:')").parent().text().substring(altEnglish.length + 1).split(",");
        for (var title in englishTitles)
            anime.titles.english.push(englishTitles[title].trim());

        var altSynonyms = "Synonyms:";
        var synonymTitles = $(".dark_text:contains('Synonyms:')").parent().text().substring(altSynonyms.length + 1).split(",");
        for (var title in synonymTitles)
            anime.titles.synonyms.push(synonymTitles[title].trim());

        var altJapanese = "Japanese:";
        var japaneseTitles = $(".dark_text:contains('Japanese:')").parent().text().substring(altJapanese.length + 1).split(",");
        for (var title in japaneseTitles)
            anime.titles.japanese.push(japaneseTitles[title].trim());

        // Get the poster
        anime.poster = $('.borderClass img').attr('src');

        // Get the summary of the show
        anime.synopsis = $("h2:contains('Synopsis')").parent().text().substring(8);

        // We can grab some stats here
        var type = "Type:";
        anime.type = $(".dark_text:contains('Type:')").parent().text().substring(type.length + 1);

        var status = "Status:";
        anime.status = $(".dark_text:contains('Status:')").parent().text().substring(status.length + 1);

        anime.genres = []

        var genres = "Genres:";
        var englishGenres = $(".dark_text:contains('Genres:')").parent().text().substring(genres.length + 4).split(",");        
        for(var genre in englishGenres)
            anime.genres.push(englishGenres[genre].trim());

        var rating = "Rating:";
        anime.rating =  $(".dark_text:contains('Rating:')").parent().text().substring(rating.length + 4);

        var rank = "Ranked:";
        anime.rank =  $(".dark_text:contains('Ranked:')").parent().text().substring(rank.length + 2);

        anime.score =  $(".dark_text:contains('Score:')").parent().first().contents().filter(function() {
            return this.type !== 'tag';
        }).text().trim();

        var episodes = "Episodes:";
        anime.episodes =  $(".dark_text:contains('Episodes:')").parent().text().substring(episodes.length + 1).replace(/(\r\n|\n|\r|\t)/gm,"");        

        return anime;
    };

    Anime.lookup = function(name, callback, db, params) {
        if (params === undefined)
            params = "type=1";

        var that = this;

        request({
            url: 'http://myanimelist.net/anime.php?'+params+'&q='+encodeURIComponent(name.replace(/[\~\&\:\!\.\*]/g, "")),
            headers: { 'User-Agent': 'api-team-692e8861471e4de2fd84f6d91d1175c0' },
            timeout: 10000
        }, function(err, response, body) {
            if (err) {            
                return callback(err);
            }

            var $ = cheerio.load(body.toLowerCase());
            var isresults = $('.normal_header').text().indexOf("search results") != -1;
            var mal_id = -1;

            if (isresults) {
                if (body.indexOf("No titles that matched your query were found.") == -1) {
                    var atag = $("a:contains('" + name.toLowerCase() + "')");
                    var href = atag.attr("href");
                    var offset = "/anime/".length;
                    mal_id = href;
                    if (href !== undefined)
                        mal_id = mal_id.substring(offset, href.indexOf("/", offset));
                }
            } else {
                var doEdit = "javascript:doedit(";
                var idxDoEdit = body.indexOf(doEdit) + doEdit.length;
                mal_id = body.substring(idxDoEdit, body.indexOf(");", idxDoEdit));
            }

            mal_id = new Number(mal_id);
            if (isNaN(mal_id))
                mal_id = -2;

            if (mal_id == -1 && params.length > 0)
                Anime.lookup(name, callback, db, "");
            else
                callback(null, { "mal_id": mal_id });
        });
    };

    // export our class
    return Anime;
})();

// Export the module
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Anime;
}
