document.addEventListener('alpine:init', () => {
    Alpine.data('zeroOS', () => ({
        // State Layar Utama
        currentScreen: 'lockscreen', // 'lockscreen' | 'desktop'
        guestName: 'Guest',
        currentTime: '00:00',
        activeApp: null,
        highestZIndex: 10,
        
        // Window States
        apps: {
            notes: { isOpen: false, zIndex: 1 },
            settings: { isOpen: false, zIndex: 1 },
            terminal: { isOpen: false, zIndex: 1 }
        },

        init() {
            this.updateClock();
            setInterval(() => this.updateClock(), 1000);
        },

        updateClock() {
            const now = new Date();
            this.currentTime = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false });
        },

        openApp(appName) {
            if (!this.apps[appName]) return;
            this.highestZIndex++;
            this.apps[appName].isOpen = true;
            this.apps[appName].zIndex = this.highestZIndex;
            this.activeApp = appName;
        },

        closeApp(appName) {
            if (!this.apps[appName]) return;
            this.apps[appName].isOpen = false;
            if (this.activeApp === appName) {
                this.activeApp = null;
            }
        },

        focusApp(appName) {
            if (!this.apps[appName].isOpen) return;
            this.highestZIndex++;
            this.apps[appName].zIndex = this.highestZIndex;
            this.activeApp = appName;
        }
    }));
});