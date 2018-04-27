// When popup.us opens, send message to content script to extract recipe data
// On response, populate the extension form with the returned data
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {rsAction: 'extract'}, function(response) {
    console.info('Response', response);

    // Populate input from response data
    $('#recipe-title').val(response.title);
    $('#recipe-url').val(response.url);

    // Handle images
    var imageSlides = '';
    for (var i = 0; i < response.images.length; i++) {
    	imageSlides += '<li class="slide"><img src="' + response.images[i] + '"></li>';
    }
    $('#images').append(imageSlides).find('li').first().addClass('current');

  });
});


// Send recipe to Recipe Saver
$('#submit-recipe').click(function() {

	console.log('submitting recipe!');

	$.ajax({
		type: 'POST',
	  url: 'http://127.0.0.1:3000/api/extension',
	  contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
	  data: { 
      title: $('#recipe-title').val(),
      url: $('#recipe-url').val(),
      image: $('#images .current img').attr('src'),
      mealType: $('#meal-type-category').val(),
      foodType: $('#food-category').val(),
      dietCategory: $('#diet-category').val(),
    },
	  success: function(data) {
	  	console.log('Sent!');
	  },
	  error: function(jqXHR) {
	  	console.log('error');
	  }
	});
});


var counter = 0;
function navigate(direction) {
	$('.current').removeClass('current');

	var $slides = $('.slide');
	var slideLength = $slides.length;

	// Previous
	if (direction === 'prev') {
		counter--;

		// If counter is -1, then set it to the length of the slide amount -1 (so it's now the index of the last slide)
		if (counter === -1) {
			counter = slideLength - 1;
		}
	}

	// Next
	if (direction === 'next') {
		counter++;

		// If the counter is set to the length of the slide amount, then set it to 0 (so it's now the first slide)
		if (counter === slideLength) {
			counter = 0;
		}
	}

	$slides.eq(counter).addClass('current');
	
}

// Image selection
$('#prev').click(function() {
	navigate('prev');
});
$('#next').click(function() {
	navigate('next');
});

//https://christianheilmann.com/2015/04/08/keeping-it-simple-coding-a-carousel/