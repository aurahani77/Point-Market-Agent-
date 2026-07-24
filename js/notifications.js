/* ========== Notifications Manager ========== */
class NotificationsManager {
    constructor() {
        this.notifications = [];
        this.maxNotifications = 100;
        this.listeners = [];
    }

    async initialize() {
        try {
            this.notifications = await db.getAll('notifications');
        } catch (error) {
            console.error('Error loading notifications:', error);
            this.notifications = [];
        }
    }

    async addNotification(notification) {
        const newNotification = {
            ...notification,
            id: stringUtils.generateId('NOTIF'),
            timestamp: dateUtils.getCurrentDateTime(),
            read: false
        };

        try {
            await db.add('notifications', newNotification);
            this.notifications.unshift(newNotification);

            if (this.notifications.length > this.maxNotifications) {
                this.notifications = this.notifications.slice(0, this.maxNotifications);
            }

            this.notifyListeners('notification-added', newNotification);
            return newNotification;
        } catch (error) {
            console.error('Error adding notification:', error);
        }
    }

    async markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            try {
                await db.put('notifications', notification);
                this.notifyListeners('notification-read', notificationId);
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        }
    }

    async markAllAsRead() {
        const unreadNotifications = this.notifications.filter(n => !n.read);
        for (const notification of unreadNotifications) {
            notification.read = true;
            try {
                await db.put('notifications', notification);
            } catch (error) {
                console.error('Error marking as read:', error);
            }
        }
        this.notifyListeners('all-read');
    }

    async deleteNotification(notificationId) {
        try {
            await db.delete('notifications', notificationId);
            this.notifications = this.notifications.filter(n => n.id !== notificationId);
            this.notifyListeners('notification-deleted', notificationId);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    }

    async clearAllNotifications() {
        try {
            await db.clear('notifications');
            this.notifications = [];
            this.notifyListeners('notifications-cleared');
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    }

    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    getNotifications(limit = 50) {
        return this.notifications.slice(0, limit);
    }

    addListener(callback) {
        this.listeners.push(callback);
    }

    removeListener(callback) {
        this.listeners = this.listeners.filter(l => l !== callback);
    }

    notifyListeners(type, data) {
        this.listeners.forEach(listener => {
            try {
                listener({ type, data });
            } catch (error) {
                console.error('Error in notification listener:', error);
            }
        });
    }

    // Notification Types
    static createAlert(type, message, title = 'تنبيه') {
        const types = {
            'low-stock': { icon: '⚠️', color: 'warning' },
            'out-of-stock': { icon: '🚫', color: 'danger' },
            'high-stock': { icon: 'ℹ️', color: 'info' },
            'sale-completed': { icon: '✅', color: 'success' },
            'sale-failed': { icon: '❌', color: 'danger' },
            'inventory-updated': { icon: '📋', color: 'info' },
            'product-added': { icon: '✨', color: 'success' },
            'user-login': { icon: '🔓', color: 'info' },
            'user-logout': { icon: '🔒', color: 'info' },
            'error': { icon: '⚠️', color: 'danger' },
            'success': { icon: '✅', color: 'success' },
            'info': { icon: 'ℹ️', color: 'info' }
        };

        const typeInfo = types[type] || types['info'];
        return {
            type,
            title,
            message,
            icon: typeInfo.icon,
            color: typeInfo.color,
            actionable: false
        };
    }

    static createInventoryAlert(productName, quantity, minStock, maxStock) {
        let type = 'info';
        let title = 'تحديث المخزون';
        let message = '';

        if (quantity <= minStock) {
            type = 'low-stock';
            title = 'تحذير: مخزون منخفض';
            message = `المنتج "${productName}" وصل للحد الأدنى. الكمية الحالية: ${quantity}`;
        } else if (quantity >= maxStock) {
            type = 'high-stock';
            title = 'تنبيه: مخزون مرتفع';
            message = `المنتج "${productName}" تجاوز الحد الأقصى. الكمية الحالية: ${quantity}`;
        } else if (quantity === 0) {
            type = 'out-of-stock';
            title = 'تنبيه حرج: انقطاع المخزون';
            message = `المنتج "${productName}" لا يتوفر في المخزون!`;
        } else {
            message = `المنتج "${productName}" محدث. الكمية: ${quantity}`;
        }

        return NotificationsManager.createAlert(type, message, title);
    }

    static createSaleAlert(invoiceNumber, total, status = 'success') {
        const type = status === 'success' ? 'sale-completed' : 'sale-failed';
        const title = status === 'success' ? '✅ تم إتمام البيع' : '❌ فشل البيع';
        const message = `الفاتورة #${invoiceNumber} - المبلغ: ${numberUtils.formatCurrency(total)}`;

        return NotificationsManager.createAlert(type, message, title);
    }
}

// Initialize Notifications Manager
const notifications = new NotificationsManager();

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = notifications;
}
