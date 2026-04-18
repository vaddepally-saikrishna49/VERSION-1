/**
 * SmartBank AI Engine
 * Intelligent response generation based on customer memory and context
 */

class AIEngine {
    constructor(memoryStore) {
        this.memory = memoryStore;
        this.intentPatterns = this.initializeIntentPatterns();
        this.responseTemplates = this.initializeResponseTemplates();
    }

    /**
     * Initialize intent recognition patterns
     */
    initializeIntentPatterns() {
        return {
            failed_transaction: {
                patterns: [
                    /transaction.*fail/i,
                    /payment.*fail/i,
                    /money.*deduct.*fail/i,
                    /deducted.*not.*success/i,
                    /amount.*cut.*fail/i,
                    /transaction.*stuck/i,
                    /payment.*pending/i,
                    /money.*gone.*fail/i
                ],
                keywords: ['failed', 'deducted', 'not received', 'unsuccessful', 'stuck', 'pending']
            },
            refund_status: {
                patterns: [
                    /refund.*status/i,
                    /where.*refund/i,
                    /refund.*when/i,
                    /check.*refund/i,
                    /track.*refund/i,
                    /money.*back/i,
                    /refund.*pending/i
                ],
                keywords: ['refund', 'money back', 'reversal']
            },
            card_blocked: {
                patterns: [
                    /card.*block/i,
                    /block.*card/i,
                    /card.*not.*work/i,
                    /card.*decline/i,
                    /card.*reject/i,
                    /freeze.*card/i,
                    /stop.*card/i,
                    /lost.*card/i,
                    /stolen.*card/i
                ],
                keywords: ['block', 'freeze', 'lost', 'stolen', 'decline', 'reject']
            },
            suspicious_activity: {
                patterns: [
                    /suspicious/i,
                    /fraud/i,
                    /unauthorized/i,
                    /not.*my.*transaction/i,
                    /didn't.*make/i,
                    /unknown.*transaction/i,
                    /strange.*activity/i,
                    /hacked/i
                ],
                keywords: ['suspicious', 'fraud', 'unauthorized', 'unknown', 'hacked']
            },
            loan_emi: {
                patterns: [
                    /loan.*emi/i,
                    /emi.*date/i,
                    /emi.*due/i,
                    /loan.*payment/i,
                    /loan.*status/i,
                    /next.*emi/i,
                    /pay.*emi/i
                ],
                keywords: ['loan', 'emi', 'installment', 'due date']
            },
            login_problem: {
                patterns: [
                    /login.*problem/i,
                    /cannot.*login/i,
                    /can't.*login/i,
                    /password.*forgot/i,
                    /forgot.*password/i,
                    /account.*locked/i,
                    /otp.*not/i,
                    /sign.*in.*issue/i
                ],
                keywords: ['login', 'password', 'locked', 'otp', 'sign in']
            },
            atm_issue: {
                patterns: [
                    /atm.*deduct/i,
                    /atm.*not.*dispense/i,
                    /atm.*cash.*not/i,
                    /atm.*ate.*card/i,
                    /atm.*problem/i,
                    /cash.*not.*received/i,
                    /atm.*failed/i
                ],
                keywords: ['atm', 'cash', 'dispense', 'withdraw']
            },
            balance_check: {
                patterns: [
                    /check.*balance/i,
                    /balance.*check/i,
                    /account.*balance/i,
                    /how much.*account/i,
                    /available.*balance/i
                ],
                keywords: ['balance', 'available']
            },
            recent_transactions: {
                patterns: [
                    /recent.*transaction/i,
                    /transaction.*history/i,
                    /last.*transaction/i,
                    /show.*transaction/i,
                    /view.*transaction/i
                ],
                keywords: ['transactions', 'history', 'recent']
            },
            greeting: {
                patterns: [
                    /^hi$/i,
                    /^hello$/i,
                    /^hey$/i,
                    /good\s*(morning|afternoon|evening)/i,
                    /^howdy$/i
                ],
                keywords: ['hi', 'hello', 'hey']
            },
            thanks: {
                patterns: [
                    /thank/i,
                    /thanks/i,
                    /appreciate/i,
                    /helpful/i
                ],
                keywords: ['thank', 'thanks', 'appreciate']
            },
            human_support: {
                patterns: [
                    /speak.*human/i,
                    /talk.*agent/i,
                    /human.*support/i,
                    /real.*person/i,
                    /customer.*care/i,
                    /escalate/i,
                    /manager/i
                ],
                keywords: ['human', 'agent', 'person', 'escalate']
            }
        };
    }

    /**
     * Initialize response templates
     */
    initializeResponseTemplates() {
        return {
            failed_transaction: {
                first_time: `I can see you're experiencing a failed transaction issue. Let me check your recent transactions...

Based on your account, I found a failed transaction of **${{amount}}** with **{{merchant}}** on {{date}}.

Here's what typically happens:
• The amount is usually auto-reversed within **24-48 hours**
• If not reversed, a refund is processed within **5-7 business days**

Would you like me to:
1. **Raise a complaint** for faster resolution
2. **Track existing refund** if already initiated`,
                
                repeated: `I notice you've experienced this issue before. Last time, {{previousResolution}}.

Let me check your current pending transactions... I found **{{count}} failed transaction(s)** recently.

Since this is a recurring issue, I recommend we:
1. Raise a priority complaint for immediate attention
2. Have our team review your account for any technical issues

Should I proceed with the escalation?`,

                frustrated: `I sincerely apologize for the repeated inconvenience with failed transactions. I understand how frustrating this must be.

I'm immediately escalating this to our senior support team. You'll receive:
• A callback within **30 minutes**
• Priority handling for your complaint
• A dedicated case manager

Your reference number is: **{{refId}}**

Is there anything else I can help with while you wait?`
            },

            refund_status: {
                has_pending: `I found **{{count}} pending refund(s)** in your account:

{{refundDetails}}

The refund is currently **{{status}}** and should be credited within **{{expectedDate}}**.

Would you like me to expedite this refund request?`,

                no_pending: `Great news! I don't see any pending refunds in your account. All previous refunds have been processed successfully.

Your last refund of **${{lastAmount}}** was credited on **{{lastDate}}**.

Is there a specific transaction you'd like me to check?`
            },

            card_blocked: {
                block_request: `I'll help you block your card immediately for security.

⚠️ **Please confirm**: You want to block card ending in **{{cardLast4}}**?

Once blocked:
• All transactions will be declined
• Online payments will stop
• You can request unblock or replacement anytime

Type **"CONFIRM BLOCK"** to proceed.`,

                already_blocked: `Your card ending in **{{cardLast4}}** is currently **blocked**.

Would you like to:
1. **Unblock your card** - Takes 2-4 hours
2. **Request a replacement** - Delivered in 5-7 days
3. **Report fraud** - Initiate investigation`,

                card_blocked_success: `✅ Your card ending in **{{cardLast4}}** has been **blocked immediately**.

No further transactions will be processed on this card.

Next steps:
• Report any unauthorized transactions
• Request a replacement card
• Visit nearest branch for instant card

Reference: **{{refId}}**`
            },

            suspicious_activity: {
                response: `🚨 I'm treating this as a **high-priority security alert**.

For your protection, I recommend:
1. **Block your card immediately** - I can do this right now
2. **Review recent transactions** - I'll show you the last 10
3. **Change your PIN/password** - Through secure channel

Here are your last 5 transactions:
{{transactionList}}

Do you recognize all these transactions? Type the transaction ID of any suspicious one.`
            },

            loan_emi: {
                has_loan: `Here's your loan summary:

📋 **Loan Details**
• Loan Amount: ${{loanAmount}}
• Monthly EMI: ${{emiAmount}}
• Next Due Date: **{{nextDate}}**
• Outstanding: ${{outstanding}}

Payment options:
1. Pay now through UPI/Card
2. Set up auto-debit
3. Request EMI date change

How would you like to proceed?`,

                no_loan: `You don't have any active loans with us currently.

Interested in exploring our loan options?
• Personal Loan - Up to $50,000
• Home Loan - Competitive rates
• Car Loan - Quick approval

Would you like to check your pre-approved offers?`
            },

            login_problem: {
                response: `I'll help you resolve your login issue.

Common solutions:
1. **Forgot Password** - I can send a reset link to your registered email
2. **Account Locked** - Usually unlocks after 30 minutes
3. **OTP Not Received** - Check if number {{maskedPhone}} is correct

What specific issue are you facing?`
            },

            atm_issue: {
                response: `I understand cash wasn't dispensed but your account was debited. This is frustrating, but usually resolves quickly.

Based on your account, I can see a withdrawal attempt of **${{amount}}** at **{{atmLocation}}** on **{{date}}**.

Here's what happens next:
• Transaction reversal: **24-48 hours** (automatic)
• If not reversed, raise a complaint for **5-7 day** resolution

The reversal process has already begun. Would you like me to raise a priority complaint?`
            },

            balance_check: {
                response: `Here's your account summary:

💰 **Available Balance**: ${{balance}}
📊 **Account Type**: {{accountType}}

Recent activity:
• Last Credit: ${{lastCredit}} on {{creditDate}}
• Last Debit: ${{lastDebit}} on {{debitDate}}

Would you like to see your full statement or recent transactions?`
            },

            greeting: {
                new_session: `Hello {{name}}! 👋 Good to see you again.

I have access to your complete account history, so no need to repeat any information from our previous conversations.

How can I help you today?`,

                returning: `Welcome back, {{name}}! I remember our last conversation about {{lastIssue}}.

Is this resolved, or would you like to continue where we left off?`
            },

            thanks: {
                response: `You're welcome! 😊 I'm glad I could help.

Remember, I'm available 24/7 for any banking needs. Your satisfaction score helps us improve, so feel free to rate this conversation.

Is there anything else I can assist you with?`
            },

            escalation: {
                auto: `Given the complexity and history of this issue, I'm connecting you with a human support agent.

**Summary being shared with agent:**
• Customer: {{name}}
• Issue: {{issueType}}
• Previous occurrences: {{repeatCount}}
• Pending items: {{pendingItems}}

Estimated wait time: **~3 minutes**

Click "Connect to Agent" when ready.`,

                requested: `I understand you'd like to speak with a human agent.

Before I connect you, here's what I'll share with them:
• Your account details (pre-verified)
• This conversation summary
• Relevant transaction history

This ensures you won't need to repeat information.

Current wait time: **~3 minutes**`
            },

            fallback: {
                response: `I want to make sure I understand your concern correctly.

Based on what you've shared, it seems related to {{possibleIntent}}.

Could you please clarify:
• Is this about a recent transaction?
• Are you facing an account access issue?
• Is this a new issue or ongoing?

Or, if you prefer, I can connect you with a human agent right away.`
            }
        };
    }

    /**
     * Detect intent from user message
     */
    detectIntent(message) {
        const messageLower = message.toLowerCase();
        let bestMatch = null;
        let highestScore = 0;

        for (const [intent, config] of Object.entries(this.intentPatterns)) {
            let score = 0;

            // Check patterns
            for (const pattern of config.patterns) {
                if (pattern.test(message)) {
                    score += 3;
                }
            }

            // Check keywords
            for (const keyword of config.keywords) {
                if (messageLower.includes(keyword.toLowerCase())) {
                    score += 1;
                }
            }

            if (score > highestScore) {
                highestScore = score;
                bestMatch = intent;
            }
        }

        return highestScore > 0 ? bestMatch : 'unknown';
    }

    /**
     * Generate contextual response
     */
    async generateResponse(userMessage) {
        const customer = this.memory.getCustomerData();
        const intent = this.detectIntent(userMessage);
        
        // Add to conversation history
        this.memory.addMessage({
            role: 'user',
            content: userMessage,
            intent: intent
        });

        // Check for confirmation messages
        if (userMessage.toUpperCase() === 'CONFIRM BLOCK') {
            return this.handleCardBlockConfirmation();
        }

        let response = '';
        let actions = [];
        let contextBadge = null;

        switch (intent) {
            case 'failed_transaction':
                response = this.handleFailedTransaction(customer);
                actions = ['raise_complaint', 'track_refund'];
                break;

            case 'refund_status':
                response = this.handleRefundStatus(customer);
                actions = ['expedite_refund'];
                break;

            case 'card_blocked':
                response = this.handleCardBlocked(customer, userMessage);
                actions = customer.cardStatus === 'blocked' ? ['unblock_card', 'replace_card'] : ['block_card'];
                break;

            case 'suspicious_activity':
                response = this.handleSuspiciousActivity(customer);
                actions = ['block_card_urgent', 'report_fraud'];
                contextBadge = { type: 'warning', text: '🚨 Security Alert' };
                break;

            case 'loan_emi':
                response = this.handleLoanEmi(customer);
                break;

            case 'login_problem':
                response = this.handleLoginProblem(customer);
                actions = ['reset_password', 'verify_phone'];
                break;

            case 'atm_issue':
                response = this.handleAtmIssue(customer);
                actions = ['raise_atm_complaint'];
                break;

            case 'balance_check':
                response = this.handleBalanceCheck(customer);
                break;

            case 'recent_transactions':
                response = this.handleRecentTransactions(customer);
                break;

            case 'greeting':
                response = this.handleGreeting(customer);
                break;

            case 'thanks':
                response = this.handleThanks(customer);
                break;

            case 'human_support':
                response = this.handleHumanSupport(customer);
                actions = ['connect_agent'];
                break;

            default:
                response = this.handleUnknown(customer, userMessage);
        }

        // Check for escalation need
        if (this.memory.shouldEscalate() && intent !== 'human_support' && intent !== 'thanks' && intent !== 'greeting') {
            response += this.getEscalationNotice();
            actions.push('escalate');
        }

        // Add to conversation history
        this.memory.addMessage({
            role: 'assistant',
            content: response,
            intent: intent
        });

        // Update last interaction
        this.memory.updateCustomer({
            lastInteraction: new Date().toISOString(),
            totalInteractions: customer.totalInteractions + 1
        });

        return {
            content: response,
            intent: intent,
            actions: actions,
            contextBadge: contextBadge,
            shouldEscalate: this.memory.shouldEscalate()
        };
    }

    /**
     * Handle failed transaction intent
     */
    handleFailedTransaction(customer) {
        const repeatCount = this.memory.getIssueRepeatCount('failed_transaction');
        const previousResolution = this.memory.getPreviousResolution('failed_transaction');
        const failedTxns = this.memory.getFailedTransactions();

        // Track the issue
        this.memory.addComplaint({
            type: 'failed_transaction',
            description: 'Transaction failed - amount deducted'
        });

        if (customer.frustrationLevel === 'high') {
            return this.formatTemplate(this.responseTemplates.failed_transaction.frustrated, {
                refId: `ESC${Date.now()}`
            });
        }

        if (repeatCount > 0 && previousResolution) {
            return this.formatTemplate(this.responseTemplates.failed_transaction.repeated, {
                previousResolution: previousResolution,
                count: failedTxns.length
            });
        }

        const lastFailed = failedTxns[0] || { amount: '200.00', merchant: 'Online Store', date: 'recently' };
        return this.formatTemplate(this.responseTemplates.failed_transaction.first_time, {
            amount: lastFailed.amount,
            merchant: lastFailed.merchant,
            date: lastFailed.date
        });
    }

    /**
     * Handle refund status intent
     */
    handleRefundStatus(customer) {
        const pendingRefunds = this.memory.getPendingRefunds();

        if (pendingRefunds.length > 0) {
            const refundDetails = pendingRefunds.map(r => 
                `• **$${r.amount}** - ${r.status} (Expected: ${r.expectedDate})`
            ).join('\n');

            return this.formatTemplate(this.responseTemplates.refund_status.has_pending, {
                count: pendingRefunds.length,
                refundDetails: refundDetails,
                status: pendingRefunds[0].status,
                expectedDate: pendingRefunds[0].expectedDate
            });
        }

        return this.formatTemplate(this.responseTemplates.refund_status.no_pending, {
            lastAmount: '150.00',
            lastDate: 'January 5, 2024'
        });
    }

    /**
     * Handle card blocked intent
     */
    handleCardBlocked(customer, message) {
        const cardLast4 = customer.cardNumber.slice(-4);
        
        // Check if user wants to block
        if (/block|lost|stolen|freeze|stop/i.test(message)) {
            if (customer.cardStatus === 'blocked') {
                return this.formatTemplate(this.responseTemplates.card_blocked.already_blocked, {
                    cardLast4: cardLast4
                });
            }
            return this.formatTemplate(this.responseTemplates.card_blocked.block_request, {
                cardLast4: cardLast4
            });
        }

        // Check if user wants to unblock
        if (/unblock/i.test(message)) {
            if (customer.cardStatus === 'active') {
                return `Your card ending in **${cardLast4}** is already **active** and working fine. Is there something else I can help with?`;
            }
            this.memory.unblockCard();
            return `I've initiated the unblock request for your card ending in **${cardLast4}**. It will be active within **2-4 hours**. You'll receive an SMS confirmation.`;
        }

        return this.formatTemplate(this.responseTemplates.card_blocked.already_blocked, {
            cardLast4: cardLast4
        });
    }

    /**
     * Handle card block confirmation
     */
    handleCardBlockConfirmation() {
        const customer = this.memory.getCustomerData();
        const cardLast4 = customer.cardNumber.slice(-4);
        
        this.memory.blockCard();
        
        return this.formatTemplate(this.responseTemplates.card_blocked.card_blocked_success, {
            cardLast4: cardLast4,
            refId: `BLK${Date.now()}`
        });
    }

    /**
     * Handle suspicious activity
     */
    handleSuspiciousActivity(customer) {
        this.memory.addRiskAlert('Suspicious activity reported by customer', 'high');
        
        const transactions = customer.recentTransactions.slice(0, 5);
        const txnList = transactions.map(t => 
            `• **${t.id}**: $${t.amount} - ${t.merchant} (${t.date}) - ${t.status}`
        ).join('\n');

        return this.formatTemplate(this.responseTemplates.suspicious_activity.response, {
            transactionList: txnList
        });
    }

    /**
     * Handle loan EMI queries
     */
    handleLoanEmi(customer) {
        if (customer.loanStatus !== 'No Active Loan') {
            return this.formatTemplate(this.responseTemplates.loan_emi.has_loan, {
                loanAmount: customer.loanAmount,
                emiAmount: customer.emiAmount,
                nextDate: customer.nextEmiDate,
                outstanding: customer.loanAmount * 0.7 // Example
            });
        }
        return this.responseTemplates.loan_emi.no_loan;
    }

    /**
     * Handle login problems
     */
    handleLoginProblem(customer) {
        return this.formatTemplate(this.responseTemplates.login_problem.response, {
            maskedPhone: customer.phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2')
        });
    }

    /**
     * Handle ATM issues
     */
    handleAtmIssue(customer) {
        this.memory.addComplaint({
            type: 'atm_issue',
            description: 'ATM cash not dispensed'
        });

        return this.formatTemplate(this.responseTemplates.atm_issue.response, {
            amount: '200.00',
            atmLocation: 'Main Street Branch',
            date: 'today'
        });
    }

    /**
     * Handle balance check
     */
    handleBalanceCheck(customer) {
        return this.formatTemplate(this.responseTemplates.balance_check.response, {
            balance: '5,432.10',
            accountType: customer.accountType,
            lastCredit: '1,200.00',
            creditDate: 'Jan 15',
            lastDebit: '75.50',
            debitDate: 'Jan 14'
        });
    }

    /**
     * Handle recent transactions
     */
    handleRecentTransactions(customer) {
        const transactions = customer.recentTransactions.slice(0, 5);
        let response = `Here are your recent transactions:\n\n`;
        
        transactions.forEach(t => {
            const statusIcon = t.status === 'success' ? '✅' : '❌';
            response += `${statusIcon} **$${t.amount}** - ${t.merchant}\n   ${t.date} | ${t.status.toUpperCase()}\n\n`;
        });

        response += `Would you like to see more transactions or report any issue with these?`;
        return response;
    }

    /**
     * Handle greeting
     */
    handleGreeting(customer) {
        const lastIssue = customer.currentSessionIssues.length > 0 ? 
            customer.currentSessionIssues[customer.currentSessionIssues.length - 1] : null;

        if (lastIssue) {
            return this.formatTemplate(this.responseTemplates.greeting.returning, {
                name: customer.name.split(' ')[0],
                lastIssue: lastIssue.replace('_', ' ')
            });
        }

        return this.formatTemplate(this.responseTemplates.greeting.new_session, {
            name: customer.name.split(' ')[0]
        });
    }

    /**
     * Handle thanks
     */
    handleThanks(customer) {
        this.memory.updateSatisfaction(5);
        return this.responseTemplates.thanks.response;
    }

    /**
     * Handle human support request
     */
    handleHumanSupport(customer) {
        const issues = customer.currentSessionIssues;
        return this.formatTemplate(this.responseTemplates.escalation.requested, {
            name: customer.name
        });
    }

    /**
     * Handle unknown intent
     */
    handleUnknown(customer, message) {
        // Try to find closest matching intent
        let possibleIntent = 'your account';
        
        if (message.toLowerCase().includes('money') || message.toLowerCase().includes('amount')) {
            possibleIntent = 'a transaction issue';
        } else if (message.toLowerCase().includes('card')) {
            possibleIntent = 'your card';
        } else if (message.toLowerCase().includes('account')) {
            possibleIntent = 'your account';
        }

        return this.formatTemplate(this.responseTemplates.fallback.response, {
            possibleIntent: possibleIntent
        });
    }

    /**
     * Get escalation notice
     */
    getEscalationNotice() {
        return `\n\n---\n⚠️ **Note**: Given the history of this issue, I recommend speaking with a human agent for faster resolution. Click "Human Support" when ready.`;
    }

    /**
     * Format template with variables
     */
    formatTemplate(template, variables) {
        let result = template;
        for (const [key, value] of Object.entries(variables)) {
            result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
        return result;
    }

    /**
     * Get issue summary for escalation
     */
    getIssueSummary() {
        const customer = this.memory.getCustomerData();
        const conversations = this.memory.getConversationHistory();
        
        // Get the main issues discussed
        const userMessages = conversations.filter(m => m.role === 'user');
        const mainIssues = [...new Set(userMessages.map(m => m.intent).filter(i => i && i !== 'unknown'))];
        
        return {
            customerName: customer.name,
            customerId: customer.id,
            issues: mainIssues.map(i => i.replace('_', ' ')).join(', ') || 'General inquiry',
            repeatCount: customer.repeatedIssueCount,
            frustrationLevel: customer.frustrationLevel,
            pendingRefunds: customer.pendingRefunds.length,
            cardStatus: customer.cardStatus,
            conversationLength: conversations.length
        };
    }
}

// Will be initialized in app.js
let aiEngine;