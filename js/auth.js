/* ========== Authentication System ========== */
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.users = [
            {
                id: 1,
                username: 'admin',
                password: '123456',
                name: 'مسؤول النظام',
                email: 'admin@pointmarket.com',
                role: 'admin',
                avatar: '👤',
                permissions: ['all']
            },
            {
                id: 2,
                username: 'manager',
                password: '123456',
                name: 'مدير الفرع',
                email: 'manager@pointmarket.com',
                role: 'manager',
                avatar: '👨',
                permissions: ['read', 'write', 'delete-own']
            },
            {
                id: 3,
                username: 'staff',
                password: '123456',
                name: 'موظف',
                email: 'staff@pointmarket.com',
                role: 'staff',
                avatar: '👥',
                permissions: ['read', 'write-own']
            }
        ];
    }

    async initialize() {
        const storedUser = storageUtils.getItem('currentUser');
        if (storedUser) {
            this.currentUser = storedUser;
            this.isAuthenticated = true;
        }
        return this.isAuthenticated;
    }

    login(username, password, userType) {
        const user = this.users.find(u =>
            u.username === username &&
            u.password === password &&
            u.role === userType
        );

        if (!user) {
            return {
                success: false,
                message: 'بيانات دخول غير صحيحة'
            };
        }

        this.currentUser = { ...user };
        delete this.currentUser.password;
        this.isAuthenticated = true;

        storageUtils.setItem('currentUser', this.currentUser);
        this.logActivity('login', `تسجيل دخول: ${user.username}`, {
            username: user.username,
            role: user.role
        });

        return {
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            user: this.currentUser
        };
    }

    logout() {
        if (this.currentUser) {
            this.logActivity('logout', `تسجيل خروج: ${this.currentUser.username}`, {
                username: this.currentUser.username
            });
        }

        this.currentUser = null;
        this.isAuthenticated = false;
        storageUtils.removeItem('currentUser');

        return {
            success: true,
            message: 'تم تسجيل الخروج بنجاح'
        };
    }

    getCurrentUser() {
        return this.currentUser;
    }

    hasPermission(permission) {
        if (!this.currentUser) return false;
        if (this.currentUser.role === 'admin') return true;
        return this.currentUser.permissions.includes(permission);
    }

    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    isAdmin() {
        return this.hasRole('admin');
    }

    isManager() {
        return this.hasRole('manager') || this.hasRole('admin');
    }

    async logActivity(action, description, metadata = {}) {
        try {
            const activity = {
                userId: this.currentUser?.id || null,
                username: this.currentUser?.username || 'anonymous',
                action,
                description,
                metadata,
                timestamp: dateUtils.getCurrentDateTime(),
                ip: '127.0.0.1'
            };

            await db.add('activityLog', activity);
            console.log('Activity logged:', action);
        } catch (error) {
            console.error('Error logging activity:', error);
        }
    }

    async getActivityLog(limit = 100) {
        try {
            const allActivities = await db.getAll('activityLog');
            return allActivities
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, limit);
        } catch (error) {
            console.error('Error fetching activity log:', error);
            return [];
        }
    }

    getRoleLabel(role) {
        const labels = {
            admin: 'مسؤول النظام',
            manager: 'مدير',
            staff: 'موظف'
        };
        return labels[role] || role;
    }

    getPermissions() {
        if (this.currentUser.role === 'admin') {
            return ['read', 'write', 'delete', 'export', 'import', 'manage-users'];
        } else if (this.currentUser.role === 'manager') {
            return ['read', 'write', 'delete-own', 'export'];
        } else {
            return ['read', 'write-own'];
        }
    }
}

// Initialize Auth Manager
const auth = new AuthManager();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = auth;
}
