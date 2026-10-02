// MAIN NAVIGATION
// NOTE: onePageNav (active-link highlighting) is disabled — it fought with
// Bootstrap scrollspy and lagged. A single accurate scrollspy now lives in
// futuristic.js (initScrollSpy). Smooth scrolling still works via smoothscroll.js.
/*
 $('.main-navigation').onePageNav({
        scrollThreshold: 0.2, // Adjust if Navigation highlights too early or too late
        scrollOffset: 75, //Height of Navigation Bar
        filter: ':not(.external)',
        changeHash: true
    });
*/

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


// ========================================= 
// VIDEO PLAYER MODAL
// =========================================
function openVideoModal(videoUrl, title) {
    var modal = document.getElementById('videoModal');
    var iframe = document.getElementById('videoIframe');
    var titleSpan = document.querySelector('#videoModalTitle span');
    var loader = document.querySelector('.video-loader');
    var player = document.getElementById('videoPlayer');
    var isFile = /\.(mp4|webm)(\?|#|$)/i.test(videoUrl);

    // Self-hosted files play in a <video>; everything else goes in the iframe
    iframe.style.display = isFile ? 'none' : '';
    player.style.display = isFile ? 'block' : 'none';

    // Convert Google Drive view URL to embed URL
    var embedUrl = videoUrl;
    var fileIdMatch = videoUrl.match(/\/file\/d\/([^/]+)/);
    if (fileIdMatch) {
        embedUrl = 'https://drive.google.com/file/d/' + fileIdMatch[1] + '/preview';
    }
    
    // Set the title and video source
    if (title) {
        titleSpan.textContent = title;
    } else {
        titleSpan.textContent = 'Watch Demo';
    }
    
    // Show loader
    if (loader) {
        loader.classList.remove('hidden');
    }
    
    modal.style.display = 'flex';
    // Trigger reflow for animation
    modal.offsetHeight;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Hide loader when iframe loads
    iframe.onload = function() {
        if (loader) {
            loader.classList.add('hidden');
        }
    };
    
    player.onloadeddata = function() {
        if (loader) {
            loader.classList.add('hidden');
        }
    };

    // Load video after modal animation starts
    setTimeout(function() {
        if (isFile) {
            player.src = videoUrl;
            var playing = player.play();
            if (playing && playing.catch) playing.catch(function() {});
        } else {
            iframe.src = embedUrl;
        }
    }, 100);
}

function closeVideoModal() {
    var modal = document.getElementById('videoModal');
    var iframe = document.getElementById('videoIframe');
    var player = document.getElementById('videoPlayer');

    player.pause();
    modal.classList.remove('active');
    setTimeout(function() {
        modal.style.display = 'none';
        iframe.src = ''; // Stop video playback
        player.removeAttribute('src');
        player.load();
        document.body.style.overflow = '';
    }, 300);
}

// Close video modal on background click
document.addEventListener('click', function(e) {
    var modal = document.getElementById('videoModal');
    if (e.target === modal) {
        closeVideoModal();
    }
});

// Close video modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        var videoModal = document.getElementById('videoModal');
        if (videoModal && videoModal.classList.contains('active')) {
            closeVideoModal();
            return; // Prioritize video modal
        }
    }
});

// ========================================= 
// NMIS RTOC XI REPOSITORY MODAL
// =========================================
function openRepoModal() {
    var modal = document.getElementById('repoModal');
    modal.style.display = 'flex';
    // Trigger reflow for animation
    modal.offsetHeight;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeRepoModal() {
    var modal = document.getElementById('repoModal');
    modal.classList.remove('active');
    setTimeout(function() {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
}

// Close modal on background click
document.addEventListener('click', function(e) {
    var modal = document.getElementById('repoModal');
    if (e.target === modal) {
        closeRepoModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        var modal = document.getElementById('repoModal');
        if (modal && modal.classList.contains('active')) {
            closeRepoModal();
        }
    }
});
