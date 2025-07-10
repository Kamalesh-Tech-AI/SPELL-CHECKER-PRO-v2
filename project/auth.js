// Authentication and session management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutes
        this.sessionTimer = null;
        this.init();
    }

    init() {
        this.loadSession();
        this.startSessionTimer();
        this.addEventListeners();
    }

    addEventListeners() {
        // Reset session timer on user activity
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, () => {
                this.resetSessionTimer();
            }, true);
        });

        // Handle page visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseSession();
            } else {
                this.resumeSession();
            }
        });
    }

    loadSession() {
        const sessionData = sessionStorage.getItem('currentUser');
        if (sessionData) {
            try {
                this.currentUser = JSON.parse(sessionData);
                this.validateSession();
            } catch (error) {
                console.error('Invalid session data:', error);
                this.clearSession();
            }
        }
    }

    validateSession() {
        if (!this.currentUser) return false;

        const loginTime = new Date(this.currentUser.loginTime);
        const now = new Date();
        const timeDiff = now - loginTime;

        if (timeDiff > this.sessionTimeout) {
            this.expireSession();
            return false;
        }

        return true;
    }

    startSessionTimer() {
        this.clearSessionTimer();
        this.sessionTimer = setTimeout(() => {
            this.expireSession();
        }, this.sessionTimeout);
    }

    resetSessionTimer() {
        if (this.currentUser) {
            this.startSessionTimer();
        }
    }

    clearSessionTimer() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
            this.sessionTimer = null;
        }
    }

    pauseSession() {
        this.clearSessionTimer();
    }

    resumeSession() {
        if (this.currentUser && this.validateSession()) {
            this.startSessionTimer();
        }
    }

    expireSession() {
        this.clearSession();
        alert('Your session has expired. Please log in again.');
        window.location.href = 'login.html';
    }

    clearSession() {
        this.currentUser = null;
        this.clearSessionTimer();
        sessionStorage.removeItem('currentUser');
    }

    isAuthenticated() {
        return this.currentUser !== null && this.validateSession();
    }

    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    hasPermission(permission) {
        return this.currentUser && this.currentUser.permissions && 
               this.currentUser.permissions.includes(permission);
    }

    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    requireRole(role) {
        if (!this.requireAuth() || !this.hasRole(role)) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    logout() {
        this.clearSession();
        window.location.href = 'login.html';
    }

    updateLastActivity() {
        if (this.currentUser) {
            this.currentUser.lastActivity = new Date().toISOString();
            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}