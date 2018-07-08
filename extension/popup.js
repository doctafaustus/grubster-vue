// When popup.us opens, send message to content script to extract recipe data
// On response, populate the extension form with the returned data
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {rsAction: 'extract'}, function(response) {
    console.info('Response', response);

    // Populate input from response data
    $('#recipe-title').val(response.title);
    $('#recipe-url').val(response.url);
    $('#recipe-host').val(response.host);

    // Handle images
    var imageSlides = '';
    for (var i = 0; i < response.images.length; i++) {
    	imageSlides += '<li class="slide"><img src="' + response.images[i] + '"></li>';
    }
    $('#images').append(imageSlides).find('li').first().addClass('current');

  });
});


// Send recipe to App
$('#submit-recipe').click(function() {

	console.log('submitting recipe!');
  $('#recipe-title-validation').hide();

  // Validate that a recipe name exists
  if (!$('#recipe-title').val().length) {
    return $('#recipe-title-validation').show();
  }

  $('.sk-fading-circle, #overlay').show();

  // Filter categories for null values
  var categories = [$('#meal-type-category').val(), $('#food-category').val(), $('#diet-category').val()];
  categories = categories.filter(category => category);

  chrome.storage.sync.get('sub', function(item) {
    $.ajax({
      type: 'POST',
      url: 'http://127.0.0.1:3000/api/extension',
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
      data: { 
        title: $('#recipe-title').val(),
        host: $('#recipe-host').val(),
        url: $('#recipe-url').val(),
        image: $('#images .current img').attr('src'),
        categories: categories,
        sub: item.sub,
      },
      success: function(data) {
        console.log('success', data);
        $('#main').hide();

        if (data.message === 'recipe added') {
          $('#success-message, #home-link').show();
        } else if (data.message === 'favorited') {
          $('#info-message, #home-link').show();
        } else if (data.message === 'in db, no user') {
          $('#success-message-2, #home-link').show();
        }

        if (item.sub) {
          chrome.tabs.query({ url: ['http://localhost:8080/*'] }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {rsAction: 'refresh'}, function(response) {
              console.log('Message sent');
            });
          });
        }
      },
      error: function(jqXHR) {
        console.log('error', jqXHR);
        $('#error-message, #home-link').show();
      },
      complete: function() {
        $('.sk-fading-circle, #overlay').hide();
      }
    });
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
