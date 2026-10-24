/**
 * ZeroOS - Boot Sequence Controller
 * 
 * Manages the seamless boot experience inside .phone-screen:
 * - Phase 1: 10-Second Splash Screen showing the ZeroOS logo
 * - Phase 2: Smooth cross-fade to the ZeroOS Boot animation video with autoplay
 * - Phase 3: Transition handover to Lock Screen upon video completion
 */

(function () {
    'use strict';

    // Phase 1 hold duration in milliseconds (10 Seconds)
    const SPLASH_DURATION_MS = 10000;

    /**
     * Initializes the ZeroOS boot sequence.
     */
    function initBootSequence() {
        const overlay = document.getElementById('boot-overlay');
        const splash = document.getElementById('boot-splash');
        const video = document.getElementById('boot-video');

        if (!overlay || !splash || !video) {
            console.warn('[ZeroOS Boot] Boot sequence elements missing from DOM.');
            return;
        }

        // Reset elements to initial Phase 1 state
        overlay.classList.remove('fade-out', 'boot-hidden');
        overlay.style.display = 'block';
        splash.classList.remove('fade-out');
        video.classList.remove('visible');
        video.muted = true;
        video.currentTime = 0;

        // Preload video during Phase 1
        video.load();

        let bootHandled = false;

        /**
         * Phase 3: Complete boot sequence, fade out overlay, and reveal OS
         */
        const finishBoot = () => {
            if (bootHandled) return;
            bootHandled = true;

            // Trigger CSS fade-out on the boot overlay
            overlay.classList.add('fade-out');

            const handleFadeEnd = (event) => {
                if (event.target === overlay && event.propertyName === 'opacity') {
                    overlay.removeEventListener('transitionend', handleFadeEnd);
                    overlay.classList.add('boot-hidden');
                    overlay.style.display = 'none';
                    try {
                        video.pause();
                    } catch (_) {}
                }
            };

            overlay.addEventListener('transitionend', handleFadeEnd);

            // Fallback safety timeout in case transitionend does not fire
            setTimeout(() => {
                overlay.classList.add('boot-hidden');
                overlay.style.display = 'none';
                try {
                    video.pause();
                } catch (_) {}
            }, 900);
        };

        // Attach listener for when the boot animation video finishes playing
        video.addEventListener('ended', finishBoot, { once: true });

        // Error handling fallback so simulator never gets stuck on black screen
        video.addEventListener('error', (err) => {
            console.warn('[ZeroOS Boot] Video playback error encountered:', err);
            finishBoot();
        }, { once: true });

        // Phase 2: At exactly the 10-second mark, cross-fade to video & start playback
        const bootTimer = setTimeout(() => {
            if (bootHandled) return;

            // Attempt video playback
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch((err) => {
                    console.warn('[ZeroOS Boot] Video autoplay was prevented or failed:', err);
                    // Graceful fallback to finish boot if autoplay policy blocks playback
                    finishBoot();
                });
            }

            // Cross-fade: fade out splash logo while fading in boot video
            splash.classList.add('fade-out');
            video.classList.add('visible');
        }, SPLASH_DURATION_MS);

        // Store active timer reference for testing / restart support
        window._zeroOSBootTimer = bootTimer;
    }

    // Auto-start on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBootSequence);
    } else {
        initBootSequence();
    }

    // Expose global reboot method for manual testing / restart
    window.rebootZeroOS = initBootSequence;
})();
