var cheerio = require('cheerio')
  , request = require('request');

var Anime = (function() {
  
  function Anime() {}

  Anime.byId = function(id, callback, db) {
    

    var that = this;
    db.get('anime').findOne({"mal_id": id}, function(err, document) {

      // Feed from cache if we can
      if(!err && document != null)
      {
      console.log('fetch');
      callback(null, JSON.stringify(document) )
      }
    
      // Otherwise, we can try to parse
      else
      {

    
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



    /*
      This method is really fragile; it's subject to page layout changes.
      We should do our best to keep up with breakages
    */

    Anime.tryParse = function(html)
    {
        var $ = cheerio.load(html);
        var anime = {}

        // Extract the name from our DOM
        var name = $('h1').first().contents().filter(function() {
          return this.type !== 'tag';
        }).text();

        anime.name = name;

        // Set the expirty to 7 days; this is how often we evict anime entries from our cache
        var now = new Date();
        anime.expiry = now.setDate(now.getDate() + 7);                

        // Get the poster
        anime.poster = $('.borderClass img').attr('src');
        // Get the summary of the show
        anime.synopsis = $("h2:contains('Synopsis')").parent().text().substring(8);

        // We can grab some stats here
        var type = "Type:";
        anime.type = $(".dark_text:contains('Type:')").parent().text().substring(type.length + 1);

        var status = "Status:";
        anime.status = $(".dark_text:contains('Status:')").parent().text().substring(status.length + 1);

        var genres = "Genres:";
        anime.genres = $(".dark_text:contains('Genres:')").parent().text().substring(genres.length + 4);        

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


  };




  // export our class
  return Anime;
})();

// Export the module
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Anime;
}
