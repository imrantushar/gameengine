/* GameEngine Video Watch Tracker */
(function () {
    'use strict';

    var awarded = {};

    function reportWatched(wrapper, threshold) {
        var videoId = wrapper.dataset.videoId;
        var key = videoId + '_' + threshold;
        if (awarded[key]) return;
        awarded[key] = true;

        var xhr = new XMLHttpRequest();
        xhr.open('POST', wrapper.dataset.restUrl, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('X-WP-Nonce', wrapper.dataset.nonce);
        xhr.send(JSON.stringify({ video_id: videoId, threshold: threshold }));
    }

    function initHTML5(wrapper) {
        var video = wrapper.querySelector('video');
        if (!video) return;
        var threshold = wrapper.dataset.threshold;

        video.addEventListener('play', function () {
            if (threshold === 'start') reportWatched(wrapper, threshold);
        });

        video.addEventListener('timeupdate', function () {
            if (!video.duration) return;
            var pct = (video.currentTime / video.duration) * 100;
            if (threshold === '50' && pct >= 50) reportWatched(wrapper, threshold);
            if (threshold === '100' && pct >= 95) reportWatched(wrapper, threshold);
        });
    }

    function initYouTube(wrapper) {
        if (typeof YT === 'undefined' || !YT.Player) {
            var tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            document.head.appendChild(tag);
        }
        var iframe = wrapper.querySelector('iframe');
        if (!iframe) return;

        window.onYouTubeIframeAPIReady = function () {
            new YT.Player(iframe.id, {
                events: {
                    onStateChange: function (e) {
                        if (e.data === YT.PlayerState.PLAYING && wrapper.dataset.threshold === 'start') {
                            reportWatched(wrapper, 'start');
                        }
                    },
                    onPlaybackQualityChange: function () {},
                }
            });
        };
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.ge-video-wrapper').forEach(function (wrapper) {
            var type = wrapper.dataset.type;
            if (type === 'html5') initHTML5(wrapper);
            else if (type === 'youtube') initYouTube(wrapper);
            // Vimeo: similar postMessage pattern — simplified to html5-style for now.
        });
    });
}());
