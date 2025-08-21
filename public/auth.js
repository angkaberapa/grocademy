// HttpOnly cookie authentication
class Auth {
    
    static async getCurrentUser() {
        try {
            const response = await fetch('/api/auth/self', {
                credentials: 'include' 
            });
            
            if (response.ok) {
                return await response.json();
            } else if (response.status === 401) {
                return null;
            } else {
                throw new Error(`Request failed: ${response.status}`);
            }
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    static async logout() {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
        window.location.href = '/login';
    }

    static requireAuth() {
        this.getCurrentUser().then(result => {
            if (!result || !result.data) {
                window.location.href = '/login';
            }
        });
    }

    static async updateNavigation() {
        const authenticatedNav = document.getElementById('authenticated-nav');
        const unauthenticatedNav = document.getElementById('unauthenticated-nav');
        const userNameSpan = document.getElementById('user-name');
        const userBalanceSpan = document.getElementById('user-balance');

        const result = await this.getCurrentUser();
        if (result && result.data) {
            // User is authenticated
            if (authenticatedNav) authenticatedNav.style.display = 'flex';
            if (unauthenticatedNav) unauthenticatedNav.style.display = 'none';
            if (userNameSpan) userNameSpan.textContent = result.data.username || 'User';
            if (userBalanceSpan) userBalanceSpan.textContent = `$${result.data.balance || 0}`;
        } else {
            // User is not authenticated
            if (authenticatedNav) authenticatedNav.style.display = 'none';
            if (unauthenticatedNav) unauthenticatedNav.style.display = 'flex';
        }
    }
}

// Check if current page requires authentication
function checkPageAuth() {
    const currentPath = window.location.pathname;
    const isProtectedPath = currentPath.includes('course');
    if (isProtectedPath) {
        Auth.requireAuth();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    checkPageAuth();
    await Auth.updateNavigation();
});

// Global functions for easy access
window.logout = () => Auth.logout();
window.requireAuth = () => Auth.requireAuth();
window.getCurrentUser = () => Auth.getCurrentUser();