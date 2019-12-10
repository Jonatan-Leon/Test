/**
 * Simple modern image gallery
 * @method SimpleGallery()
 *
 * @param {Object} config - Stores object properties
 *	config @param {String} container - ID of HTML gallery container
 *  config @param {String} titleWrapElement - HTML tag name to use as wrapper
 *  config @param {String} captionWrapElement - HTML tag name to use as wrapper
 *  config @param {Int} width - Numerical width value of gallery
 *  config @param {Int} height - Numerical height value of gallery
 *  config @param {Int} animationSpeed - Gallery animation speed in milliseconds (time between each slide)
 *  config @param {Int} animationDelay - Gallery animation delay in milliseconds (time on each slide)
 *
 * @param {Array} records - Array of objects
 * 	records @param {String} title - Title of record
 * 	records @param {String} caption - Caption for record
 * 	records @param {String} image - Image src for record
 * 	records @param {Object} link - Link for record
 * 		link @param {Boolean} show - Show/don't show the link
 * 		link @param {String} text - Link text
 * 		link @param {String} url - Link URL
 * 		link @param {String} target - Link target
 */

/**
* Hiding JQuery Mobile loading message
* https://stackoverflow.com/questions/10397940/jquery-mobile-loading-message
*/

// $.mobile.loading( "hide" );
// (or presumably as submitted by @Pnct)
// $.mobile.loading().hide();

$(function() {
	// INITIATE THE NEW GALLERY INSTANCE
	var simpleGallery = new SimpleGallery({
		"config": {
			"container": "#gallery-container",
			"titleWrapElement": "h2",
			"captionWrapElement": "div",
			"width": 1500,
			"height": 700,
			// "animationSpeed": 750,
			"animationSpeed": 750,
        	"animationDelay": 5000
		},
		"records": galleryData
	});
});

function SimpleGallery(gallery) {
	// SET THIS INSTANCE VARIABLES
	this.galleryContainer = gallery.config.container;
	this.galleryTitleWrapElement = gallery.config.titleWrapElement;
	this.galleryCaptionWrapElement = gallery.config.captionWrapElement;
	this.galleryWidth = gallery.config.width;
	this.galleryHeight = gallery.config.height;
	this.galleryAnimationSpeed = gallery.config.animationSpeed;
	this.galleryAnimationDelay = gallery.config.animationDelay;
	this.galleryRecords = gallery.records;
	this.galleryHover = false;
	
	var d = new Date();
	this.galleryTimerID = d.getTime();
	this.galleryTimer = [];
	
	this.galleryKeyCodes = {
		"tab"	: 9,
		"enter"	: 13,
		"esc"	: 27,
		"space"	: 32,
		"end"	: 35,
		"home"	: 36,
		"left"	: 37,
		"up"	: 38,
		"right"	: 39,
		"down"	: 40
	};
	
	// GET THINGS STARTED
	this.buildStyles();
	this.init();
}

SimpleGallery.prototype.init = function() {
	// START BUILDING THE GALLERY STRUCTURE AND BULLETS
	var galleryStructure = '<div class="simple-gallery-viewer">';
	var galleryBullets = '<ul class="simple-gallery-bullets clear">';
	var galleryControls = '';
	
	// LOOP THROUGH RECORDS AND BUILD THE PANELS AND BULLETS
	for(var record in this.galleryRecords) {
		// PANEL
		// MARK ACTIVE AND VISIBLE IF THIS IS THE FIRST RECORD
		galleryStructure +=	'<article class="simple-gallery-record' + ((record == 0) ? " active reveal" : "") + '" data-index="' + record + '" aria-hidden="' + ((record == 0) ? "false" : "true") + '" style="background: url(' + this.galleryRecords[record].image + ') center center / cover no-repeat; background-attachment: fixed;">';
		galleryStructure +=		'<div class="simple-gallery-record-inner">';
		// galleryStructure +=			'<div class="simple-gallery-record-frost-image" role="img" aria-label="Gallery image for ' + this.galleryRecords[record].title + '" style="background-image: url(' + this.galleryRecords[record].image + ');"></div>';
		galleryStructure +=			'<div class="simple-gallery-record-info">';
		galleryStructure +=				'<div class="simple-gallery-record-info-inner">';
											// GIVE ABILITY TO SET ELEMENT TYPE FOR MORE CONTROL, PROPER HIERARCHY, AND ACCESSIBILITY REASONS
		galleryStructure +=					'<' + this.galleryTitleWrapElement + ' class="simple-gallery-record-header">' + this.galleryRecords[record].title + '</' + this.galleryTitleWrapElement + '>';
											// GIVE ABILITY TO SET ELEMENT TYPE FOR MORE CONTROL AND ACCESSIBILITY REASONS
											// MAY WANT TO PUT BLOCK LEVEL ELEMENTS IN HERE SO FORCING <p> WOULDN'T BE COOL
		galleryStructure +=					'<' + this.galleryCaptionWrapElement + ' class="simple-gallery-record-caption">' + this.galleryRecords[record].caption + '</' + this.galleryCaptionWrapElement + '>';
		if(this.galleryRecords[record].link.show) {
		galleryStructure +=					'<p class="simple-gallery-record-link"><a href="' + this.galleryRecords[record].link.url + '" target="' + this.galleryRecords[record].link.target + '">' + this.galleryRecords[record].link.text + '</a></p>';
		}
		galleryStructure +=				'</div>';
		galleryStructure +=			'</div>';
		galleryStructure +=		'</div>';
		galleryStructure += '</article>';
		
		// BULLET
		// MARK ACTIVE IF THIS IS THE FIRST RECORD
		galleryBullets += '<li class="simple-gallery-bullet"><button class="simple-gallery-bullet-btn' + ((record == 0) ? ' active' : '') + '" data-index="' + record + '" aria-label="Navigate to ' + this.galleryRecords[record].title + ' slide"></button></li>';
	}
	
	// FINISH THE GALLERY STRUCTURE, BULLETS AND NEXT/PREV CONTROLS
	galleryStructure += '</div>';
	galleryBullets += '</ul>';
	galleryControls = '<div class=\"sliders-prev\" role=\"button\" aria-label=\"Prev slide\"></div>'+
		'<div class=\"sliders-next\" role=\"button\" aria-label=\"Next slide\"></div>';

	// ADD THE STRUCTURE TO THE DOM
	$(this.galleryContainer).html(galleryBullets + galleryStructure + galleryControls);
	
	// START ROTATING THE SLIDES
	this.setTimer();
	
	// SET EVENTS
	this.setEvents();
}

SimpleGallery.prototype.setEvents = function() {
	// FOR SCOPE
	var _this = this;
	
	// BULLET ACTION
	$(this.galleryContainer).on("click keydown", ".simple-gallery-bullet-btn", function(e) {
		if(e.type == "click" || e.type == "keydown" && e.keyCode == _this.galleryKeyCodes.space || e.type == "keydown" && e.keyCode == _this.galleryKeyCodes.enter) {
			e.preventDefault();

			if(!$(this).hasClass("active")) {
				_this.clearTimer();
				_this.triggerAction($(this).attr("data-index"));
				_this.setTimer();
			}
		}
	});
	
	// GALLERY SWIPE LEFT
	$(this.galleryContainer).on("swipeleft", left);
	$('.sliders-next').on('click', left);

	function left() {
		var nextIndex;

		// IF LAST CHILD IS CURRENTLY ACTIVE
		if($(".simple-gallery-record.active", this.galleryContainer).is(":last-child")) {
			nextIndex = 0;
		}

		// LAST CHILD IS NOT CURRENTLY ACTIVE
		else {
			nextIndex = $(".simple-gallery-record.active", this.galleryContainer).next(".simple-gallery-record").attr("data-index");
		}
		
		_this.clearTimer();
		_this.triggerAction(nextIndex);
		_this.setTimer();
	};
	
	// GALLERY SWIPE RIGHT
	$(this.galleryContainer).on("swiperight", right);
	$('.sliders-prev').on('click', right);

	function right() {
		var nextIndex;

		// IF FIRST CHILD IS CURRENTLY ACTIVE
		if($(".simple-gallery-record.active", this.galleryContainer).is(":first-child")) {
			nextIndex = $(".simple-gallery-record:last-child", this.galleryContainer).attr("data-index");
		}

		// FIRST CHILD IS NOT CURRENTLY ACTIVE
		else {
			nextIndex = $(".simple-gallery-record.active", this.galleryContainer).prev(".simple-gallery-record").attr("data-index");
		}
		
		_this.clearTimer();
		_this.triggerAction(nextIndex);
		_this.setTimer();
	};
	
	// GALLERY HOVER PAUSE
	// $(this.galleryContainer).hover(function() {
	// 	_this.clearTimer();
		
	// 	$(this).addClass("hover");
	// 	_this.galleryHover = true;
	// }, function() {
	// 	_this.clearTimer();
	// 	_this.setTimer();
		
	// 	$(this).removeClass("hover");
	// 	_this.galleryHover = false;
	// });
	
	// GALLERY FOCUS PAUSE
	// $(document).keyup(function() {
		// FOCUS IS INSIDE THE GALLERY
		// if($(_this.galleryContainer).find(":focus").length) {
		// 	_this.clearTimer();
			
		// 	$(_this.galleryContainer).addClass("hover");
		// 	_this.galleryHover = true;
		// }
		
		// FOCUS IS SOMEWHERE OUTSIDE THE GALLERY
		// else {
		// 	if(_this.galleryHover) {
		// 		_this.clearTimer();
		// 		_this.setTimer();

		// 		$(_this.galleryContainer).removeClass("hover");
		// 		_this.galleryHover = false;
		// 	}
		// }
	// });
	
	// MAKE SURE GALLERY RESUMES IF FOCUS IS REMOVED VIA CLICK
	// $(document).click(function() {
		// FOCUS IS SOMEWHERE OUTSIDE THE GALLERY
	// 	if(!$(_this.galleryContainer).find(":focus").length) {
	// 		if(_this.galleryHover) {
	// 			_this.clearTimer();
	// 			_this.setTimer();

	// 			$(_this.galleryContainer).removeClass("hover");
	// 			_this.galleryHover = false;
	// 		}
	// 	}
	// });
	// $(this.galleryContainer).click(function(e) {
	// 	e.stopPropagation();
	// });
}

SimpleGallery.prototype.setAttributes = function() {
	$(".simple-gallery-record", this.galleryContainer).each(function() {
		// ACTIVE PANEL
		if($(this).hasClass("active")) {
			$(this).attr("aria-hidden", "false");
			$("a", this).attr("tabindex", "0");
		}

		// HIDDEN PANEL
		else {
			$(this).attr("aria-hidden", "true");
			$("a", this).attr("tabindex", "-1");
		}
	});
}

SimpleGallery.prototype.setTimer = function() {
	// FOR SCOPE
	var _this = this;

	this.galleryTimer[this.galleryTimerID] = setInterval(function() {
		var nextIndex;

		// IF LAST CHILD IS CURRENTLY ACTIVE
		if($(".simple-gallery-record.active", this.galleryContainer).is(":last-child")) {
			nextIndex = 0;
		}

		// LAST CHILD IS NOT CURRENTLY ACTIVE
		else {
			nextIndex = $(".simple-gallery-record.active", this.galleryContainer).next(".simple-gallery-record").attr("data-index");
		}

		_this.triggerAction(nextIndex);
	}, this.galleryAnimationDelay);
}

SimpleGallery.prototype.clearTimer = function() {
	clearInterval(this.galleryTimer[this.galleryTimerID]);
}

SimpleGallery.prototype.triggerAction = function(nextIndex) {
	// FOR SCOPE
	var _this = this;

	// STOP CURRENT ANIMATION
	$(".simple-gallery-record", this.galleryContainer).stop(true, true);

	// ANIMATE THE PANELS
	// CREATE A PROMISE SO WE CAN RESET ATTRIBUTES ONLY AFTER EVERYTHING IS DONE ANIMATING
	$.when(
		// FADE OUT CURRENT ACTIVE
		$(".simple-gallery-record.active", this.galleryContainer).removeClass("reveal").delay(this.galleryAnimationSpeed).fadeOut(this.galleryAnimationSpeed, function() {
			$(this).removeClass("active");
			$(".simple-gallery-bullet-btn.active", this.galleryContainer).removeClass("active");
		}),
		
		// FADE IN NEW ACTIVE
		$(".simple-gallery-record[data-index='" + nextIndex + "']", this.galleryContainer).delay(this.galleryAnimationSpeed).fadeIn(this.galleryAnimationSpeed, function() {
			$(this).addClass("active reveal");
			$(".simple-gallery-bullet-btn[data-index='" + nextIndex + "']", this.galleryContainer).addClass("active");
		})
	).done(function() {
		// UPDATE ATTRIBUTES
		_this.setAttributes();
	});
}

SimpleGallery.prototype.buildStyles = function() {
	var dynStyleSheet = document.createElement('style');

	if(dynStyleSheet) {
		dynStyleSheet.setAttribute('type', 'text/css');
		var head = document.getElementsByTagName('head')[0];

		if(head) {
			head.insertBefore(dynStyleSheet, head.childNodes[0]);
		}
			
		var dynStyles =	this.galleryContainer + ' {\
							position: relative;\
						}\
						' + this.galleryContainer + ':before {\
							content: "";\
							display: block;\
							padding-top: ' + ((this.galleryHeight / this.galleryWidth) * 100) + '%; /* Ratio for ' + this.galleryWidth + ' x ' + this.galleryHeight + ' */\
						}';

		var rules = document.createTextNode(dynStyles);

		if(dynStyleSheet.styleSheet){ // IE
			dynStyleSheet.styleSheet.cssText = dynStyles;
		} else {
			dynStyleSheet.appendChild(rules);
		}
	}
}

 var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var sliders = JSON.parse(this.responseText);
      renderHTML(sliders);
    }
  }
  xhttp.open("GET", "json/sliders.json", true);
  xhttp.send();
  

  function renderHTML(data) {
  	console.log(data);
  }


// EXAMPLE GALLERY RECORDS
// MOST LIKELY QUERIED THROUGH AN API OR JUST A SIMPLE DATABASE CALL
var galleryData = [
	{
		"title": "Title One",
		"caption": "Caption for record one. HTML and CSS can be included here if you want!",
		"image": "https://picsum.photos/id/292/3852/2556",
		"link": {
			"show": true,
			"text": "More Info »",
			"url": "https://www.facebook.com",
			"target": "_blank"
		}
	},
	{
		"title": "Title Two",
		"caption": "Record two caption. This record is: <ul><li>Awesome</li><li>Unique</li><li>Interesting</li></ul>",
		"image": "https://picsum.photos/id/429/4128/2322",
		"link": {
			"show": true,
			"text": "Visit Site »",
			"url": "https://www.google.com",
			"target": "_blank"
		}
	},
	{
		"title": "Title Three",
		"caption": "Record three caption. This one involves some pretty sweet code!",
		"image": "https://picsum.photos/id/488/1772/1181",
		"link": {
			"show": true,
			"text": "See Code »",
			"url": "https://www.codepen.io",
			"target": "_blank"
		}
	},
	{
		"title": "Title Four",
		"caption": "Record three caption. This one involves some pretty sweet code!",
		"image": "https://brentonkelly.me/images/mmr.jpg",
		"link": {
			"show": true,
			"text": "See Code »",
			"url": "https://www.codepen.io",
			"target": "_blank"
		}
	}
];