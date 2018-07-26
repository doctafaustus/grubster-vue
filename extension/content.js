if (window.location.hostname === 'grubster.herokuapp.com' ||
	window.location.hostname === 'www.grubster.com' ||
	window.location.hostname === 'localhost') {

	setTimeout(function() {
		var sub = document.querySelector('#sub').textContent.trim();
		console.log('[Extension] sub', sub);
	  chrome.storage.sync.set({'sub': sub}, function() {
	    console.log('sub saved');
	  });
	}, 1500);
}



// Receive message from extension
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

	// Extract recipe
	if (request.rsAction === 'extract') {

		// Generate response data
		var response = {
			title: $('title:first').text().trim().replace(/\s([|\-—:>•·~\[,]+|(by|from|recipe)?)\s.*/ig, ''),
			url: window.location.href,
			host: window.location.hostname.replace(/^www\./, ''),
			images: getImages(),
		};

		// Send response to popup.js
		sendResponse(response);
	}

	if (request.rsAction === 'refresh') {
		console.log('[Extension] Forcing manual favorite refresh');
	  document.dispatchEvent(new CustomEvent('favorite_refresh'));
	}
});




function getImages() {

	// Get all images on the page and sort them by dimension
	var imagesArray = [];
	$('img').each(function() {
		var $this = $(this);

		var src = $this[0].src;
		if (!src || src.indexOf('data:image/gif;base64') > -1) {
			return;
		}

		if (/\.svg$/.test(src)) {
			return;
		}

		var dimensions = parseFloat($this.width()) * parseFloat($this.height());
		imagesArray.push({ image: $this, dimensions: dimensions, src: src });
	});
	imagesArray.sort(function(a, b) {
		return b.dimensions - a.dimensions;
	});
	console.log('[Extension]', imagesArray);

	// Push up to the first four images into a new array
	var featureImages = [];
	for (var i = 0; i < 4; i++) {
		if (imagesArray[i]) {
			featureImages.push(imagesArray[i].src);
		}
	}

	// If there's a meta image (and it doesn't already exist in the feature array) then add it to our feature array
	var metaImage = $('meta[property="og:image"]').attr('content');
	if (metaImage && featureImages.indexOf(metaImage) === -1) {
		featureImages.unshift(metaImage);
		if (featureImages.length === 5) {
			featureImages.pop();
		}
	}

	return featureImages;
}