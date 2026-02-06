

// ISOTOPE FILTER

jQuery(document).ready(function($){

	if ( $('.iso-box-wrapper').length > 0 ) { 

	    var $container 	= $('.iso-box-wrapper'), 
	    	$imgs 		= $('.iso-box img');



	    $container.imagesLoaded(function () {

	    	$container.isotope({
				layoutMode: 'fitRows',
				itemSelector: '.iso-box'
	    	});

	    	$imgs.load(function(){
	    		$container.isotope('reLayout');
	    	})

	    });

	    //filter items on button click

	    $('.filter-wrapper li a').click(function(){

	        var $this = $(this), filterValue = $this.attr('data-filter');

			$container.isotope({ 
				filter: filterValue,
				animationOptions: { 
				    duration: 750, 
				    easing: 'linear', 
				    queue: false, 
				}              	 
			});	            

			// don't proceed if already selected 

			if ( $this.hasClass('selected') ) { 
				return false; 
			}

			var filter_wrapper = $this.closest('.filter-wrapper');
			filter_wrapper.find('.selected').removeClass('selected');
			$this.addClass('selected');

	      return false;
	    }); 

	}

});


// MAIN NAVIGATION

 $('.main-navigation').onePageNav({
        scrollThreshold: 0.2, // Adjust if Navigation highlights too early or too late
        scrollOffset: 75, //Height of Navigation Bar
        filter: ':not(.external)',
        changeHash: true
    }); 

    /* NAVIGATION VISIBLE ON SCROLL */
    mainNav();
    $(window).scroll(function () {
        mainNav();
    });

    function mainNav() {
        var top = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
        if (top > 40) $('.sticky-navigation').stop().animate({
            "opacity": '1',
            "top": '0'
        });
        else $('.sticky-navigation').stop().animate({
            "opacity": '0',
            "top": '-75'
        });
    }


// HIDE MOBILE MENU AFTER CLIKING ON A LINK

    $('.navbar-collapse a').click(function(){
        $(".navbar-collapse").collapse('hide');
    });


// PORTFOLIO CAROUSEL

jQuery(document).ready(function($) {
    var $carousel = $('.portfolio-carousel');
    var $track = $('.portfolio-carousel-track');
    var $slides = $('.portfolio-slide');
    var $prevBtn = $('.carousel-btn-prev');
    var $nextBtn = $('.carousel-btn-next');
    var $dotsContainer = $('.carousel-dots');
    
    var currentIndex = 0;
    var slidesToShow = 3;
    var totalSlides = $slides.length;
    
    // Determine slides to show based on viewport
    function getSlidesToShow() {
        if (window.innerWidth <= 767) {
            return 1;
        } else if (window.innerWidth <= 980) {
            return 2;
        }
        return 3;
    }
    
    // Calculate max index
    function getMaxIndex() {
        return Math.max(0, totalSlides - slidesToShow);
    }
    
    // Create dots
    function createDots() {
        $dotsContainer.empty();
        var numDots = getMaxIndex() + 1;
        for (var i = 0; i < numDots; i++) {
            var $dot = $('<button class="carousel-dot" data-index="' + i + '"></button>');
            if (i === currentIndex) $dot.addClass('active');
            $dotsContainer.append($dot);
        }
    }
    
    // Update dots
    function updateDots() {
        $('.carousel-dot').removeClass('active');
        $('.carousel-dot[data-index="' + currentIndex + '"]').addClass('active');
    }
    
    // Update button states
    function updateButtons() {
        $prevBtn.prop('disabled', currentIndex === 0);
        $nextBtn.prop('disabled', currentIndex >= getMaxIndex());
    }
    
    // Go to slide
    function goToSlide(index) {
        var maxIndex = getMaxIndex();
        currentIndex = Math.max(0, Math.min(index, maxIndex));
        var translateX = -(currentIndex * (100 / slidesToShow));
        $track.css('transform', 'translateX(' + translateX + '%)');
        updateDots();
        updateButtons();
    }
    
    // Initialize carousel
    function initCarousel() {
        slidesToShow = getSlidesToShow();
        currentIndex = Math.min(currentIndex, getMaxIndex());
        createDots();
        goToSlide(currentIndex);
    }
    
    // Event listeners
    $prevBtn.on('click', function() {
        goToSlide(currentIndex - 1);
    });
    
    $nextBtn.on('click', function() {
        goToSlide(currentIndex + 1);
    });
    
    $dotsContainer.on('click', '.carousel-dot', function() {
        var index = parseInt($(this).data('index'));
        goToSlide(index);
    });
    
    // Touch/Swipe support
    var touchStartX = 0;
    var touchEndX = 0;
    
    $carousel.on('touchstart', function(e) {
        touchStartX = e.originalEvent.touches[0].clientX;
    });
    
    $carousel.on('touchend', function(e) {
        touchEndX = e.originalEvent.changedTouches[0].clientX;
        var diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                goToSlide(currentIndex + 1);
            } else {
                goToSlide(currentIndex - 1);
            }
        }
    });
    
    // Handle resize
    var resizeTimer;
    $(window).on('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            initCarousel();
        }, 250);
    });
    
    // Initialize
    initCarousel();
});
