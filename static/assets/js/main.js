window.onGatsbyRouteUpdate = function() {
/**
 * Main JS file for theme behaviours
 */

// Responsive video embeds
var videoEmbeds = [
  'iframe[src*="youtube.com"]',
  'iframe[src*="vimeo.com"]'
];
reframe(videoEmbeds.join(','));

// Back to top
var toTop = document.querySelector('#to-top');
if (toTop) {
  toTop.addEventListener('click', function (e) {
    e.preventDefault();
    document.querySelector('#page').scrollIntoView({ behavior: 'smooth' });
  });
}

};
