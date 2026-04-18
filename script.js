/**
 * SmartBank Memory Store
 * Handles customer data persistence and memory management
 */

class MemoryStore {
    constructor() {
        this.storageKey = 'smartbank_customer_data';
        this.conversationKey = 'smartbank_conversations';
        this.initializeStore();
    }

    /**
     * Initialize or load existing customer data
     */
    initializeStore() {
        const existingData = localStorage.getItem(this.storageKey);
        
        if (existingData) {
            this.customerData = JSON.parse(existingData);
        } else {
            // Default customer profile for demo
            this.customerData = this.getDefaultCustomerData();
            this.save();
        }

        // Load conversation history
        const conversations = localStorage.getItem(this.conversationKey);
        this.conversations = conversations ? JSON.parse(conversations) : [];
    }

    /**
     * Get default customer data structure
     */
    getDefaultCustomerData() {
        return {
            id: 'CUST123456',
            name: 'John Doe',
            email: 'john.doe@email.com',
            phone: '+1 234 567 8900',
            preferredLanguage: 'en',
            
            // Account Information
            accountType: 'Savings',
            accountStatus: 'Active',
            cardStatus: 'active', // active, blocked, expired
            cardNumber: '**** **** **** 4532',
            
            // Loan Information
            loanStatus: 'No Active Loan',
            loanAmount: 0,
            nextEmiDate: null,
            emiAmount: 0,
            
            // Complaint & Issue Tracking
            complaints: [],
            pastComplaints: [
                {
                    id: 'CMP001',
                    type: 'failed_transaction',
                    description: 'Transaction failed but amount deducted',
                    date: '2024-01-10',
                    status: 'resolved',
                    resolution: 'Refund processed in 24 hours'
                }
            ],
            
            // Transaction Issues
            failedTransactions: [],
            recentTransactions: [
                { id: 'TXN001', amount: 150.00, merchant: 'Amazon', status: 'success', date: '2024-01-15' },
                { id: 'TXN002', amount: 75.50, merchant: 'Uber', status: 'success', date: '2024-01-14' },
                { id: 'TXN003', amount: 200.00, merchant: 'Flipkart', status: 'failed', date: '2024-01-13', refundStatus: 'pending' }
            ],
            
            // Refund Information
            pendingRefunds: [
                { id: 'REF001', amount: 200.00, transactionId: 'TXN003', requestDate: '2024-01-13', expectedDate: '2024-01-16', status: 'processing' }
            ],
            completedRefunds: [],
            
            // Behavioral Metrics
            repeatedIssueCount: 1,
            frustrationLevel: 'low', // low, medium, high
            satisfactionScore: 85,
            
            // Session Memory
            currentSessionIssues: [],
            questionsAsked: [],
            providedInfo: {},
            
            // Risk Assessment
            riskLevel: 'low',
            riskAlerts: [],
            
            // Metadata
            memberSince: '2022-03-15',
            lastLogin: new Date().toISOString(),
            lastInteraction: null,
            totalInteractions: 12
        };
    }

    /**
     * Save customer data to localStorage
     */
    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.customerData));
    }

    /**
     * Save conversation history
     */
    saveConversations() {
        localStorage.setItem(this.conversationKey, JSON.stringify(this.conversations));
    }

    /**
     * Get customer data
     */
    getCustomerData() {
        return this.customerData;
    }

    /**
     * Update customer data
     */
    updateCustomer(updates) {
        this.customerData = { ...this.customerData, ...updates };
        this.save();
    }

    /**
     * Add a new complaint
     */
    addComplaint(complaint) {
        const newComplaint = {
            id: `CMP${Date.now()}`,
            ...complaint,
            date: new Date().toISOString(),
            status: 'open'
        };
        
        this.customerData.complaints.push(newComplaint);
        this.customerData.currentSessionIssues.push(newComplaint.type);
        this.updateRepeatedIssueCount(complaint.type);
        this.save();
        
        return newComplaint;
    }

    /**
     * Update repeated issue count and frustration level
     */
    updateRepeatedIssueCount(issueType) {
        const recentSameIssues = this.customerData.complaints.filter(
            c => c.type === issueType && 
            new Date(c.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length;

        const pastSameIssues = this.customerData.pastComplaints.filter(
            c => c.type === issueType
        ).length;

        this.customerData.repeatedIssueCount = recentSameIssues + pastSameIssues;

        // Update frustration level based on repeated issues
        if (this.customerData.repeatedIssueCount >= 3) {
            this.customerData.frustrationLevel = 'high';
            this.addRiskAlert('Customer experiencing repeated issues - high frustration', 'high');
        } else if (this.customerData.repeatedIssueCount >= 2) {
            this.customerData.frustrationLevel = 'medium';
        }

        this.save();
    }

    /**
     * Check if a question has been asked before
     */
    hasAskedQuestion(question) {
        return this.customerData.questionsAsked.includes(question);
    }

    /**
     * Mark a question as asked
     */
    markQuestionAsked(question) {
        if (!this.customerData.questionsAsked.includes(question)) {
            this.customerData.questionsAsked.push(question);
            this.save();
        }
    }

    /**
     * Store provided information
     */
    storeProvidedInfo(key, value) {
        this.customerData.providedInfo[key] = value;
        this.save();
    }

    /**
     * Get provided information
     */
    getProvidedInfo(key) {
        return this.customerData.providedInfo[key];
    }

    /**
     * Add a risk alert
     */
    addRiskAlert(message, severity = 'low') {
        const alert = {
            id: `ALERT${Date.now()}`,
            message,
            severity,
            timestamp: new Date().toISOString()
        };
        
        this.customerData.riskAlerts.unshift(alert);
        
        // Update overall risk level
        if (severity === 'high') {
            this.customerData.riskLevel = 'high';
        } else if (severity === 'medium' && this.customerData.riskLevel !== 'high') {
            this.customerData.riskLevel = 'medium';
        }
        
        this.save();
        return alert;
    }

    /**
     * Get pending refunds
     */
    getPendingRefunds() {
        return this.customerData.pendingRefunds;
    }

    /**
     * Get failed transactions
     */
    getFailedTransactions() {
        return this.customerData.recentTransactions.filter(t => t.status === 'failed');
    }

    /**
     * Check if issue is repeated
     */
    isRepeatedIssue(issueType) {
        const count = this.customerData.complaints.filter(c => c.type === issueType).length +
                      this.customerData.pastComplaints.filter(c => c.type === issueType).length;
        return count > 0;
    }

    /**
     * Get times issue has repeated
     */
    getIssueRepeatCount(issueType) {
        return this.customerData.complaints.filter(c => c.type === issueType).length +
               this.customerData.pastComplaints.filter(c => c.type === issueType).length;
    }

    /**
     * Get previous resolution for issue type
     */
    getPreviousResolution(issueType) {
        const resolved = this.customerData.pastComplaints.find(
            c => c.type === issueType && c.status === 'resolved'
        );
        return resolved ? resolved.resolution : null;
    }

    /**
     * Should escalate to human
     */
    shouldEscalate() {
        return this.customerData.repeatedIssueCount >= 3 || 
               this.customerData.frustrationLevel === 'high';
    }

    /**
     * Block card
     */
    blockCard() {
        this.customerData.cardStatus = 'blocked';
        this.addRiskAlert('Card blocked by customer request', 'medium');
        this.save();
    }

    /**
     * Unblock card
     */
    unblockCard() {
        this.customerData.cardStatus = 'active';
        this.save();
    }

    /**
     * Add conversation message
     */
    addMessage(message) {
        this.conversations.push({
            ...message,
            timestamp: new Date().toISOString()
        });
        this.saveConversations();
    }

    /**
     * Get conversation history
     */
    getConversationHistory() {
        return this.conversations;
    }

    /**
     * Clear conversation history
     */
    clearConversations() {
        this.conversations = [];
        this.customerData.questionsAsked = [];
        this.customerData.providedInfo = {};
        this.customerData.currentSessionIssues = [];
        this.saveConversations();
        this.save();
    }

    /**
     * Update satisfaction score
     */
    updateSatisfaction(delta) {
        this.customerData.satisfactionScore = Math.max(0, Math.min(100, 
            this.customerData.satisfactionScore + delta
        ));
        this.save();
    }

    /**
     * Get stats for dashboard
     */
    getStats() {
        return {
            totalComplaints: this.customerData.complaints.length + 
                           this.customerData.pastComplaints.length,
            repeatedIssues: this.customerData.repeatedIssueCount,
            satisfactionScore: this.customerData.satisfactionScore,
            riskLevel: this.customerData.riskLevel,
            pendingRefunds: this.customerData.pendingRefunds.length,
            cardStatus: this.customerData.cardStatus,
            loanStatus: this.customerData.loanStatus,
            frustrationLevel: this.customerData.frustrationLevel
        };
    }

    /**
     * Reset to default (for demo purposes)
     */
    reset() {
        this.customerData = this.getDefaultCustomerData();
        this.conversations = [];
        this.save();
        this.saveConversations();
    }
}

// Export singleton instance
const memoryStore = new MemoryStore();