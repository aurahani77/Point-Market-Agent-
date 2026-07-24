/* ========== Utility Functions ========== */

// Date & Time Utilities
const dateUtils = {
    getCurrentDate: () => {
        const now = new Date();
        return now.toISOString().split('T')[0];
    },

    getCurrentDateTime: () => {
        return new Date().toISOString();
    },

    formatDate: (date) => {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },

    formatDateTime: (date) => {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    formatTime: (date) => {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    },

    getDayName: (date) => {
        const d = new Date(date);
        const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        return days[d.getDay()];
    },

    isToday: (date) => {
        const today = new Date();
        const d = new Date(date);
        return today.toDateString() === d.toDateString();
    },

    getDaysAgo: (days) => {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date;
    },

    getMonthRange: (month) => {
        const now = new Date();
        const year = now.getFullYear();
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        return { startDate, endDate };
    }
};

// Currency & Number Formatting
const numberUtils = {
    formatCurrency: (value, currency = 'SAR') => {
        if (!value) return '0 ' + currency;
        return new Intl.NumberFormat('ar-EG', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value) + ' ' + currency;
    },

    formatNumber: (value) => {
        if (!value) return '0';
        return new Intl.NumberFormat('ar-EG', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(value);
    },

    formatPercent: (value) => {
        return (value || 0).toFixed(2) + '%';
    },

    calculateMargin: (price, cost) => {
        if (!price || !cost) return 0;
        return ((price - cost) / price * 100).toFixed(2);
    },

    calculateProfit: (price, cost, quantity) => {
        if (!price || !cost || !quantity) return 0;
        return (price - cost) * quantity;
    }
};

// String Utilities
const stringUtils = {
    capitalize: (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    truncate: (str, length = 50) => {
        if (!str) return '';
        return str.length > length ? str.substring(0, length) + '...' : str;
    },

    generateId: (prefix = 'ID') => {
        return prefix + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    },

    generateInvoiceNumber: () => {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 10000);
        return `INV-${timestamp}-${random.toString().padStart(4, '0')}`;
    },

    searchString: (text, query) => {
        if (!query) return true;
        return text.toLowerCase().includes(query.toLowerCase());
    }
};

// Array & Object Utilities
const arrayUtils = {
    sortBy: (array, key, order = 'asc') => {
        return [...array].sort((a, b) => {
            if (order === 'asc') {
                return a[key] > b[key] ? 1 : -1;
            } else {
                return a[key] < b[key] ? 1 : -1;
            }
        });
    },

    groupBy: (array, key) => {
        return array.reduce((groups, item) => {
            const groupKey = item[key];
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
            return groups;
        }, {});
    },

    sumBy: (array, key) => {
        return array.reduce((sum, item) => sum + (item[key] || 0), 0);
    },

    averageBy: (array, key) => {
        if (array.length === 0) return 0;
        return arrayUtils.sumBy(array, key) / array.length;
    },

    filterBy: (array, key, value) => {
        return array.filter(item => item[key] === value);
    },

    unique: (array, key) => {
        const seen = new Set();
        return array.filter(item => {
            const keyValue = key ? item[key] : item;
            if (seen.has(keyValue)) return false;
            seen.add(keyValue);
            return true;
        });
    },

    chunk: (array, size) => {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
};

// DOM Utilities
const domUtils = {
    getElementById: (id) => document.getElementById(id),

    querySelector: (selector) => document.querySelector(selector),

    querySelectorAll: (selector) => document.querySelectorAll(selector),

    createElement: (tag, className = '', innerHTML = '') => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    },

    addClass: (element, className) => {
        if (element) element.classList.add(className);
    },

    removeClass: (element, className) => {
        if (element) element.classList.remove(className);
    },

    toggleClass: (element, className) => {
        if (element) element.classList.toggle(className);
    },

    hasClass: (element, className) => {
        return element ? element.classList.contains(className) : false;
    },

    setAttributes: (element, attributes) => {
        for (const [key, value] of Object.entries(attributes)) {
            element.setAttribute(key, value);
        }
    },

    setStyles: (element, styles) => {
        for (const [key, value] of Object.entries(styles)) {
            element.style[key] = value;
        }
    },

    showElement: (element) => {
        if (element) element.style.display = '';
    },

    hideElement: (element) => {
        if (element) element.style.display = 'none';
    },

    toggleElement: (element) => {
        if (element) {
            element.style.display = element.style.display === 'none' ? '' : 'none';
        }
    }
};

// LocalStorage Utilities
const storageUtils = {
    setItem: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    },

    getItem: (key) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },

    removeItem: (key) => {
        localStorage.removeItem(key);
    },

    clear: () => {
        localStorage.clear();
    }
};

// Notification Utilities
const notificationUtils = {
    showToast: (message, type = 'info', duration = 3000) => {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    showModal: (title, message, onConfirm) => {
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        backdrop.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-header">${title}</div>
                <div class="modal-body">${message}</div>
                <div class="modal-footer">
                    <button class="btn btn-secondary cancel-btn">إلغاء</button>
                    <button class="btn btn-primary confirm-btn">تأكيد</button>
                </div>
            </div>
        `;
        document.body.appendChild(backdrop);

        const confirmBtn = backdrop.querySelector('.confirm-btn');
        const cancelBtn = backdrop.querySelector('.cancel-btn');

        confirmBtn.addEventListener('click', () => {
            onConfirm();
            backdrop.remove();
        });

        cancelBtn.addEventListener('click', () => {
            backdrop.remove();
        });
    }
};

// Validation Utilities
const validationUtils = {
    isEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    isPhone: (phone) => {
        const phoneRegex = /^[0-9]{7,15}$/;
        return phoneRegex.test(phone.replace(/[^\d]/g, ''));
    },

    isNumber: (value) => {
        return !isNaN(value) && value !== '';
    },

    isPositiveNumber: (value) => {
        return validationUtils.isNumber(value) && parseFloat(value) > 0;
    },

    isRequired: (value) => {
        return value !== null && value !== undefined && value !== '';
    },

    minLength: (value, min) => {
        return value && value.length >= min;
    },

    maxLength: (value, max) => {
        return value && value.length <= max;
    }
};

// API/HTTP Utilities
const httpUtils = {
    makeRequest: async (url, options = {}) => {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Request failed:', error);
            throw error;
        }
    },

    get: async (url) => {
        return httpUtils.makeRequest(url, { method: 'GET' });
    },

    post: async (url, data) => {
        return httpUtils.makeRequest(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    put: async (url, data) => {
        return httpUtils.makeRequest(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    delete: async (url) => {
        return httpUtils.makeRequest(url, { method: 'DELETE' });
    }
};

// Export all utilities
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        dateUtils,
        numberUtils,
        stringUtils,
        arrayUtils,
        domUtils,
        storageUtils,
        notificationUtils,
        validationUtils,
        httpUtils
    };
}
