/**
 * SmartBank Support Agent - Main Application
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    aiEngine = new AIEngine(memoryStore);
    dashboardManager = new DashboardManager(memoryStore);

    // DOM Elements
    const elements = {
        sidebar: document.getElementById('sidebar'),
        sidebarToggle: document.getElementById('sidebarToggle'),
        menuBtn: document.getElementById('menuBtn'),
        chatContainer: document.getElementById('chatContainer'),
        chatMessages: document.getElementById('chatMessages'),
        messageInput: document.getElementById('messageInput'),
        sendBtn: document.getElementById('sendBtn'),
        charCount: document.getElementById('charCount'),
        typingIndicator: document.getElementById('typingIndicator'),
        suggestedActions: document.getElementById('suggestedActions'),
        clearChat: document.getElementById('clearChat'),
        exportChat: document.getElementById('exportChat'),
        escalationModal: document.getElementById('escalationModal'),
        closeModal: document.getElementById('closeModal'),
        cancelEscalation: document.getElementById('cancelEscalation'),
        confirmEscalation: document.getElementById('confirmEscalation'),
        escalationSummary: document.getElementById('escalationSummary'),
        toast: document.getElementById('toast')
    };

    // State
    let isProcessing = false;

    // Event Listeners
    initializeEventListeners();

    /**
     * Initialize all event listeners
     */
    function initializeEventListeners() {
        // Sidebar toggle
        elements.sidebarToggle?.addEventListener('click', () => {
            elements.sidebar.classList.toggle('collapsed');
        });

        elements.menuBtn?.addEventListener('click', () => {
            elements.sidebar.classList.toggle('open');
        });

        // Close sidebar on outside click (mobile)
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024) {
                if (!elements.sidebar.contains(e.target) && !elements.menuBtn.contains(e.target)) {
                    elements.sidebar.classList.remove('open');
                }
            }
        });

        // Message input
        elements.messageInput?.addEventListener('input', handleInputChange);
        elements.messageInput?.addEventListener('keydown', handleKeyDown);

        // Send button
        elements.sendBtn?.addEventListener('click', sendMessage);

        // Suggestion chips
        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const message = chip.dataset.message;
                elements.messageInput.value = message;
                handleInputChange();
                sendMessage();
            });
        });

        // Quick action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                handleQuickAction(action);
            });
        });

        // Clear chat
        elements.clearChat?.addEventListener('click', clearChat);

        // Export chat
        elements.exportChat?.addEventListener('click', exportChat);

        // Modal controls
        elements.closeModal?.addEventListener('click', closeModal);
        elements.cancelEscalation?.addEventListener('click', closeModal);
        elements.confirmEscalation?.addEventListener('click', confirmEscalation);

        // Close modal on outside click
        elements.escalationModal?.addEventListener('click', (e) => {
            if (e.target === elements.escalationModal) {
                closeModal();
            }
        });
    }

    /**
     * Handle input change
     */
    function handleInputChange() {
        const value = elements.messageInput.value;
        const length = value.length;

        elements.charCount.textContent = length;
        elements.sendBtn.disabled = length === 0;

        // Auto-resize textarea
        elements.messageInput.style.height = 'auto';
        elements.messageInput.style.height = Math.min(elements.messageInput.scrollHeight, 120) + 'px';
    }

    /**
     * Handle keyboard events
     */
    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!elements.sendBtn.disabled && !isProcessing) {
                sendMessage();
            }
        }
    }

    /**
     * Send message
     */
    async function sendMessage() {
        const message = elements.messageInput.value.trim();
        if (!message || isProcessing) return;

        isProcessing = true;
        elements.sendBtn.disabled = true;

        // Clear input
        elements.messageInput.value = '';
        elements.charCount.textContent = '0';
        elements.messageInput.style.height = 'auto';

        // Hide suggestions after first message
        if (elements.suggestedActions) {
            elements.suggestedActions.style.display = 'none';
        }

        // Add user message
        addMessage(message, 'user');

        // Show typing indicator
        showTypingIndicator();

        // Scroll to bottom
        scrollToBottom();

        try {
            // Simulate network delay for realistic feel
            await delay(800 + Math.random() * 700);

            // Get AI response
            const response = await aiEngine.generateResponse(message);

            // Hide typing indicator
            hideTypingIndicator();

            // Add bot message
            addMessage(response.content, 'bot', response);

            // Update dashboard
            dashboardManager.updateDashboard();

            // Handle auto-escalation
            if (response.shouldEscalate && memoryStore.getCustomerData().repeatedIssueCount >= 3) {
                setTimeout(() => {
                    showEscalationModal();
                }, 1500);
            }
        } catch (error) {
            console.error('Error generating response:', error);
            hideTypingIndicator();
            addMessage('I apologize, but I encountered an error. Please try again or contact support.', 'bot');
        }

        isProcessing = false;
        elements.sendBtn.disabled = elements.messageInput.value.length === 0;
        scrollToBottom();
    }

    /**
     * Add message to chat
     */
    function addMessage(content, sender, metadata = {}) {
        const messageGroup = document.createElement('div');
        messageGroup.className = 'message-group';

        const customer = memoryStore.getCustomerData();
        const initials = customer.name.split(' ').map(n => n[0]).join('');

        let avatarContent = '';
        if (sender === 'bot') {
            avatarContent = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                    <circle cx="12" cy="10" r="3"/>
                    <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>
                </svg>
            `;
        } else {
            avatarContent = initials;
        }

        // Context badge for bot messages
        let contextBadge = '';
        if (metadata.contextBadge) {
            contextBadge = `
                <div class="context-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    ${metadata.contextBadge.text}
                </div>
            `;
        }

        // Action buttons for bot messages
        let actionButtons = '';
        if (sender === 'bot' && metadata.actions && metadata.actions.length > 0) {
            const buttons = metadata.actions.map(action => {
                const config = getActionConfig(action);
                return `<button class="inline-action-btn ${config.class}" data-action="${action}">${config.label}</button>`;
            }).join('');
            actionButtons = `<div class="inline-actions">${buttons}</div>`;
        }

        // Parse content for markdown-like formatting
        const formattedContent = formatContent(content);

        messageGroup.innerHTML = `
            <div class="message ${sender}">
                <div class="message-avatar">${avatarContent}</div>
                <div class="message-content">
                    ${contextBadge}
                    <div class="message-bubble">
                        ${formattedContent}
                        ${actionButtons}
                    </div>
                    <span class="message-time">${getTimeString()}</span>
                </div>
            </div>
        `;

        elements.chatMessages.appendChild(messageGroup);

        // Add action button listeners
        messageGroup.querySelectorAll('.inline-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                handleInlineAction(btn.dataset.action);
            });
        });

        scrollToBottom();
    }

    /**
     * Format content with basic markdown support
     */
    function formatContent(content) {
        return content
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Lists
            .replace(/^• (.+)$/gm, '<li>$1</li>')
            // Wrap consecutive list items
            .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
            // Line breaks
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            // Wrap in paragraphs
            .replace(/^(.+)$/gm, (match) => {
                if (match.startsWith('<ul>') || match.startsWith('<li>') || match.startsWith('---')) {
                    return match;
                }
                return `<p>${match}</p>`;
            })
            // Horizontal rule
            .replace(/---/g, '<hr>');
    }

    /**
     * Get action button configuration
     */
    function getActionConfig(action) {
        const configs = {
            raise_complaint: { label: '📝 Raise Complaint', class: '' },
            track_refund: { label: '🔍 Track Refund', class: 'secondary' },
            expedite_refund: { label: '⚡ Expedite Refund', class: '' },
            block_card: { label: '🔒 Block Card Now', class: '' },
            block_card_urgent: { label: '🚨 Block Card Immediately', class: '' },
            unblock_card: { label: '🔓 Unblock Card', class: '' },
            replace_card: { label: '💳 Request Replacement', class: 'secondary' },
            report_fraud: { label: '🚨 Report Fraud', class: '' },
            reset_password: { label: '🔑 Reset Password', class: '' },
            verify_phone: { label: '📱 Verify Phone', class: 'secondary' },
            raise_atm_complaint: { label: '📝 Raise ATM Complaint', class: '' },
            connect_agent: { label: '👤 Connect to Agent', class: '' },
            escalate: { label: '⬆️ Escalate Issue', class: '' }
        };
        return configs[action] || { label: action, class: '' };
    }

    /**
     * Handle inline action button clicks
     */
    function handleInlineAction(action) {
        switch (action) {
            case 'raise_complaint':
            case 'raise_atm_complaint':
                elements.messageInput.value = 'Yes, please raise a complaint for me';
                sendMessage();
                break;
            case 'track_refund':
                elements.messageInput.value = 'Can you check my refund status?';
                sendMessage();
                break;
            case 'expedite_refund':
                elements.messageInput.value = 'Please expedite my refund request';
                sendMessage();
                break;
            case 'block_card':
            case 'block_card_urgent':
                elements.messageInput.value = 'CONFIRM BLOCK';
                sendMessage();
                break;
            case 'unblock_card':
                elements.messageInput.value = 'Please unblock my card';
                sendMessage();
                break;
            case 'replace_card':
                elements.messageInput.value = 'I need a replacement card';
                sendMessage();
                break;
            case 'report_fraud':
                showEscalationModal();
                break;
            case 'reset_password':
                elements.messageInput.value = 'Please send me a password reset link';
                sendMessage();
                break;
            case 'connect_agent':
            case 'escalate':
                showEscalationModal();
                break;
            default:
                showToast(`Action: ${action}`, 'info');
        }
    }

    /**
     * Handle quick action buttons
     */
    function handleQuickAction(action) {
        switch (action) {
            case 'check-balance':
                elements.messageInput.value = 'What is my account balance?';
                sendMessage();
                break;
            case 'recent-transactions':
                elements.messageInput.value = 'Show me my recent transactions';
                sendMessage();
                break;
            case 'card-services':
                elements.messageInput.value = 'I need help with my card';
                sendMessage();
                break;
            case 'human-support':
                showEscalationModal();
                break;
        }

        // Close sidebar on mobile
        if (window.innerWidth <= 1024) {
            elements.sidebar.classList.remove('open');
        }
    }

    /**
     * Show typing indicator
     */
    function showTypingIndicator() {
        elements.typingIndicator.classList.add('active');
    }

    /**
     * Hide typing indicator
     */
    function hideTypingIndicator() {
        elements.typingIndicator.classList.remove('active');
    }

    /**
     * Scroll to bottom of chat
     */
    function scrollToBottom() {
        elements.chatContainer.scrollTop = elements.chatContainer.scrollHeight;
    }

    /**
     * Clear chat
     */
    function clearChat() {
        // Keep only the welcome message
        const welcomeMessage = elements.chatMessages.querySelector('.message-group');
        elements.chatMessages.innerHTML = '';
        if (welcomeMessage) {
            elements.chatMessages.appendChild(welcomeMessage);
        }

        // Show suggestions again
        if (elements.suggestedActions) {
            elements.suggestedActions.style.display = 'flex';
            elements.chatMessages.appendChild(elements.suggestedActions);
        }

        // Clear memory conversations
        memoryStore.clearConversations();
        dashboardManager.updateDashboard();

        showToast('Chat cleared', 'success');
    }

    /**
     * Export chat
     */
    function exportChat() {
        const conversations = memoryStore.getConversationHistory();
        const customer = memoryStore.getCustomerData();

        const exportData = {
            customerName: customer.name,
            customerId: customer.id,
            exportDate: new Date().toISOString(),
            conversations: conversations
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-export-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('Chat exported successfully', 'success');
    }

    /**
     * Show escalation modal
     */
    function showEscalationModal() {
        const summary = aiEngine.getIssueSummary();
        elements.escalationSummary.innerHTML = `
            <strong>Customer:</strong> ${summary.customerName}<br>
            <strong>Issues:</strong> ${summary.issues}<br>
            <strong>Repeat Count:</strong> ${summary.repeatCount}<br>
            <strong>Frustration Level:</strong> ${summary.frustrationLevel}
        `;
        elements.escalationModal.classList.add('active');
    }

    /**
     * Close modal
     */
    function closeModal() {
        elements.escalationModal.classList.remove('active');
    }

    /**
     * Confirm escalation
     */
    function confirmEscalation() {
        closeModal();
        
        // Add system message
        addMessage(
            `✅ **Escalation Confirmed**\n\nYour case has been escalated to a human support agent. You will receive a callback within **3-5 minutes**.\n\n**Reference Number:** ESC${Date.now()}\n\nPlease keep this reference handy.`,
            'bot'
        );

        // Add risk alert
        memoryStore.addRiskAlert('Case escalated to human support', 'medium');
        dashboardManager.updateDashboard();

        showToast('Connecting to human agent...', 'success');
    }

    /**
     * Show toast notification
     */
    function showToast(message, type = 'info') {
        const toast = elements.toast;
        toast.querySelector('.toast-message').textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('active');

        setTimeout(() => {
            toast.classList.remove('active');
        }, 3000);
    }

    /**
     * Get time string
     */
    function getTimeString() {
        const now = new Date();
        return now.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
    }

    /**
     * Delay utility
     */
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Initial scroll
    scrollToBottom();
});