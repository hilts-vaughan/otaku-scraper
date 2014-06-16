var ExpiryHelper = (function() {

	function ExpiryHelper() {}

	/**
	 * A small helper that is designed to compute when a particular item should expire in the cache.
	 * It uses a heustric modeled and based on the air date to attempt to reduce hits for no reason.
	 *
	 * Older items have no need to be updated nearly as often as they will rarely (if at all) change.
	 * 
	 * @param  {[Date]} startDate The date this particular piece of content started. 
	 * @return {[Date]}           A date which matches the acceptable expiry time
	 */
	ExpiryHelper.getExpiryDate = function(startDate) {

		oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
		var today = new Date();
		var diffDays = Math.round(Math.abs((today.getTime() - startDate.getTime()) / (oneDay)));

		// We make some quick checks here for dates
		if(diffDays < 1) {
			return today.setDate(today.getDate() + 7);
		}
		else if(diffDays < 7) {

		}
		else {

		}

	}


	return ExpiryHelper;
})();

module.exports = ExpiryHelper;