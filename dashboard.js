/**
 * SmartBank Dashboard Manager
 * Handles dashboard updates and statistics
 */

class DashboardManager {
    constructor(memoryStore) {
        this.memory = memoryStore;
        this.elements = {};
        this.initializeElements();
        this.updateDashboard();
    }

    /**
     * Initialize DOM element references
     */
    initializeElements() {
        this.elements = {
            // Customer Profile
            customerName: document.getElementById('customerName'),
            customerInitials: document.getElementById('customerInitials'),
            riskBadge: document.getElementById('riskBadge'),

            // Stats
            totalComplaints: document.getElementById('totalComplaints'),
            repeatedIssues: document.getElementById('repeatedIssues'),
            satisfactionScore: document.getElementById('satisfactionScore'),

            // Risk
            riskFill: document.getElementById('riskFill'),
            alertList: document.getElementById('alertList'),

            // Memory Summary
            cardStatus: document.getElementById('cardStatus'),
            pendingRefunds: document.getElementById('pendingRefunds'),
            loanStatus: document.getElementById('loanStatus'),
            lastIssue: document.getElementById('lastIssue')
        };
    }

    /**
     * Update all dashboard components
     */
    updateDashboard() {
        const customer = this.memory.getCustomerData();
        const stats = this.memory.getStats();

        this.updateCustomerProfile(customer);
        this.updateStats(stats);
        this.updateRiskIndicator(stats);
        this.updateAlerts(customer.riskAlerts);
        this.updateMemorySummary(customer, stats);
    }

    /**
     * Update customer profile section
     */
    updateCustomerProfile(customer) {
        if (this.elements.customerName) {
            this.elements.customerName.textContent = customer.name;
        }

        if (this.elements.customerInitials) {
            const names = customer.name.split(' ');
            const initials = names.map(n => n[0]).join('').toUpperCase();
            this.elements.customerInitials.textContent = initials;
        }

        if (this.elements.riskBadge) {
            this.elements.riskBadge.textContent = this.capitalizeFirst(customer.riskLevel) + ' Risk';
            this.elements.riskBadge.className = 'status-badge';
            if (customer.riskLevel === 'medium') {
                this.elements.riskBadge.classList.add('medium');
            } else if (customer.riskLevel === 'high') {
                this.elements.riskBadge.classList.add('high');
            }
        }
    }

    /**
     * Update statistics
     */
    updateStats(stats) {
        if (this.elements.totalComplaints) {
            this.animateNumber(this.elements.totalComplaints, stats.totalComplaints);
        }

        if (this.elements.repeatedIssues) {
            this.animateNumber(this.elements.repeatedIssues, stats.repeatedIssues);
        }

        if (this.elements.satisfactionScore) {
            this.elements.satisfactionScore.textContent = stats.satisfactionScore + '%';
        }
    }

    /**
     * Update risk indicator
     */
    updateRiskIndicator(stats) {
        if (this.elements.riskFill) {
            let fillPercentage;
            switch (stats.riskLevel) {
                case 'low':
                    fillPercentage = 25;
                    break;
                case 'medium':
                    fillPercentage = 55;
                    break;
                case 'high':
                    fillPercentage = 90;
                    break;
                default:
                    fillPercentage = 25;
            }
            this.elements.riskFill.style.width = fillPercentage + '%';
        }
    }

    /**
     * Update alerts list
     */
    updateAlerts(alerts) {
        if (!this.elements.alertList) return;

        if (alerts.length === 0) {
            this.elements.alertList.innerHTML = `
                <div class="alert-item info">
                    <span>No active alerts</span>
                </div>
            `;
            return;
        }

        const alertsHTML = alerts.slice(0, 3).map(alert => {
            const severityClass = alert.severity === 'high' ? '' : 
                                 alert.severity === 'medium' ? 'warning' : 'info';
            return `
                <div class="alert-item ${severityClass}">
                    <span>${alert.message}</span>
                </div>
            `;
        }).join('');

        this.elements.alertList.innerHTML = alertsHTML;
    }

    /**
     * Update memory summary
     */
    updateMemorySummary(customer, stats) {
        if (this.elements.cardStatus) {
            this.elements.cardStatus.textContent = this.capitalizeFirst(stats.cardStatus);
            this.elements.cardStatus.className = 'memory-value';
            if (stats.cardStatus === 'active') {
                this.elements.cardStatus.classList.add('active');
            } else if (stats.cardStatus === 'blocked') {
                this.elements.cardStatus.classList.add('blocked');
            }
        }

        if (this.elements.pendingRefunds) {
            this.elements.pendingRefunds.textContent = stats.pendingRefunds;
        }

        if (this.elements.loanStatus) {
            this.elements.loanStatus.textContent = customer.loanStatus;
        }

        if (this.elements.lastIssue) {
            const lastIssue = customer.currentSessionIssues[customer.currentSessionIssues.length - 1];
            this.elements.lastIssue.textContent = lastIssue ? 
                this.formatIssueType(lastIssue) : 'None';
        }
    }

    /**
     * Animate number change
     */
    animateNumber(element, target) {
        const current = parseInt(element.textContent) || 0;
        if (current === target) return;

        const increment = target > current ? 1 : -1;
        const duration = 300;
        const steps = Math.abs(target - current);
        const stepDuration = duration / steps;

        let value = current;
        const timer = setInterval(() => {
            value += increment;
            element.textContent = value;
            if (value === target) {
                clearInterval(timer);
            }
        }, stepDuration);
    }

    /**
     * Format issue type for display
     */
    formatIssueType(issueType) {
        return issueType
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Capitalize first letter
     */
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
            </div>
        `;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Will be initialized in app.js
let dashboardManager;