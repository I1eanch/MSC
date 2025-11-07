// Admin Subscription Management System

// Data Storage
let users = [];
let subscriptions = [];
let billingHistory = [];
let refunds = [];
let auditTrail = [];
let currentUser = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    setupEventListeners();
    updateDashboard();
    loadSubscriptions();
    loadBillingHistory();
    loadRefunds();
    loadAuditTrail();
});

// Initialize mock data
function initializeData() {
    // Load from localStorage or create mock data
    const storedData = localStorage.getItem('adminSubscriptionData');
    if (storedData) {
        const data = JSON.parse(storedData);
        users = data.users || [];
        subscriptions = data.subscriptions || [];
        billingHistory = data.billingHistory || [];
        refunds = data.refunds || [];
        auditTrail = data.auditTrail || [];
    } else {
        createMockData();
    }
}

// Create mock data for demonstration
function createMockData() {
    // Mock users
    users = [
        { id: 'USR001', name: 'John Smith', email: 'john@example.com', phone: '+1234567890', createdAt: '2024-01-15' },
        { id: 'USR002', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1234567891', createdAt: '2024-01-20' },
        { id: 'USR003', name: 'Mike Wilson', email: 'mike@example.com', phone: '+1234567892', createdAt: '2024-02-01' },
        { id: 'USR004', name: 'Emily Davis', email: 'emily@example.com', phone: '+1234567893', createdAt: '2024-02-10' },
        { id: 'USR005', name: 'Robert Brown', email: 'robert@example.com', phone: '+1234567894', createdAt: '2024-02-15' },
        { id: 'USR006', name: 'Lisa Anderson', email: 'lisa@example.com', phone: '+1234567895', createdAt: '2024-03-01' },
        { id: 'USR007', name: 'David Martinez', email: 'david@example.com', phone: '+1234567896', createdAt: '2024-03-05' },
        { id: 'USR008', name: 'Jennifer Taylor', email: 'jennifer@example.com', phone: '+1234567897', createdAt: '2024-03-10' }
    ];

    // Mock subscriptions
    subscriptions = [
        { 
            userId: 'USR001', 
            plan: 'Premium', 
            status: 'active', 
            startDate: '2024-01-15', 
            nextBilling: '2024-12-15',
            amount: 29.99,
            adminNotes: 'VIP customer, provide priority support'
        },
        { 
            userId: 'USR002', 
            plan: 'Basic', 
            status: 'active', 
            startDate: '2024-01-20', 
            nextBilling: '2024-12-20',
            amount: 9.99,
            adminNotes: ''
        },
        { 
            userId: 'USR003', 
            plan: 'Premium', 
            status: 'expired', 
            startDate: '2024-02-01', 
            nextBilling: '2024-11-01',
            amount: 29.99,
            adminNotes: 'Payment failed, contact customer'
        },
        { 
            userId: 'USR004', 
            plan: 'Basic', 
            status: 'active', 
            startDate: '2024-02-10', 
            nextBilling: '2024-12-10',
            amount: 9.99,
            adminNotes: ''
        },
        { 
            userId: 'USR005', 
            plan: 'Premium', 
            status: 'cancelled', 
            startDate: '2024-02-15', 
            nextBilling: '',
            amount: 29.99,
            adminNotes: 'Customer requested cancellation'
        },
        { 
            userId: 'USR006', 
            plan: 'Basic', 
            status: 'active', 
            startDate: '2024-03-01', 
            nextBilling: '2024-12-01',
            amount: 9.99,
            adminNotes: ''
        },
        { 
            userId: 'USR007', 
            plan: 'Premium', 
            status: 'active', 
            startDate: '2024-03-05', 
            nextBilling: '2024-12-05',
            amount: 29.99,
            adminNotes: ''
        },
        { 
            userId: 'USR008', 
            plan: 'Basic', 
            status: 'inactive', 
            startDate: '2024-03-10', 
            nextBilling: '',
            amount: 9.99,
            adminNotes: 'Account suspended'
        }
    ];

    // Mock billing history
    billingHistory = [
        { 
            id: 'TXN001', 
            userId: 'USR001', 
            amount: 29.99, 
            date: '2024-11-15', 
            status: 'completed', 
            method: 'Credit Card',
            description: 'Monthly Premium subscription'
        },
        { 
            id: 'TXN002', 
            userId: 'USR002', 
            amount: 9.99, 
            date: '2024-11-20', 
            status: 'completed', 
            method: 'PayPal',
            description: 'Monthly Basic subscription'
        },
        { 
            id: 'TXN003', 
            userId: 'USR003', 
            amount: 29.99, 
            date: '2024-11-01', 
            status: 'failed', 
            method: 'Credit Card',
            description: 'Monthly Premium subscription'
        },
        { 
            id: 'TXN004', 
            userId: 'USR004', 
            amount: 9.99, 
            date: '2024-11-10', 
            status: 'completed', 
            method: 'Credit Card',
            description: 'Monthly Basic subscription'
        },
        { 
            id: 'TXN005', 
            userId: 'USR006', 
            amount: 9.99, 
            date: '2024-11-01', 
            status: 'completed', 
            method: 'Bank Transfer',
            description: 'Monthly Basic subscription'
        },
        { 
            id: 'TXN006', 
            userId: 'USR007', 
            amount: 29.99, 
            date: '2024-11-05', 
            status: 'completed', 
            method: 'Credit Card',
            description: 'Monthly Premium subscription'
        }
    ];

    // Mock refunds
    refunds = [
        { 
            id: 'REF001', 
            transactionId: 'TXN003', 
            userId: 'USR003', 
            amount: 29.99, 
            date: '2024-11-05', 
            status: 'completed', 
            reason: 'Service not provided',
            notes: 'Customer cancelled before service period'
        }
    ];

    // Mock audit trail
    auditTrail = [
        {
            timestamp: '2024-11-20T10:30:00Z',
            admin: 'Admin User',
            action: 'subscription_granted',
            target: 'USR001',
            details: 'Premium subscription granted for 1 month',
            ipAddress: '192.168.1.100'
        },
        {
            timestamp: '2024-11-19T15:45:00Z',
            admin: 'Admin User',
            action: 'payment_processed',
            target: 'TXN006',
            details: 'Payment of $29.99 processed successfully',
            ipAddress: '192.168.1.100'
        },
        {
            timestamp: '2024-11-18T09:20:00Z',
            admin: 'Admin User',
            action: 'refund_processed',
            target: 'REF001',
            details: 'Refund of $29.99 processed for transaction TXN003',
            ipAddress: '192.168.1.100'
        },
        {
            timestamp: '2024-11-17T14:10:00Z',
            admin: 'Admin User',
            action: 'subscription_revoked',
            target: 'USR008',
            details: 'Basic subscription revoked due to policy violation',
            ipAddress: '192.168.1.100'
        }
    ];

    saveData();
}

// Save data to localStorage
function saveData() {
    const data = {
        users,
        subscriptions,
        billingHistory,
        refunds,
        auditTrail
    };
    localStorage.setItem('adminSubscriptionData', JSON.stringify(data));
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            showSection(section);
        });
    });

    // Search and filter inputs
    document.getElementById('subscription-search')?.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    });

    document.getElementById('billing-search')?.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            applyBillingFilters();
        }
    });

    document.getElementById('audit-search')?.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            applyAuditFilters();
        }
    });
}

// Show section
function showSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    // Update content
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionName).classList.add('active');
}

// Update dashboard
function updateDashboard() {
    // Calculate stats
    const totalUsers = users.length;
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active').length;
    const monthlyRevenue = billingHistory
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + b.amount, 0);
    const paymentIssues = billingHistory.filter(b => b.status === 'failed').length;

    // Update DOM
    document.getElementById('total-users').textContent = totalUsers;
    document.getElementById('active-subscriptions').textContent = activeSubscriptions;
    document.getElementById('monthly-revenue').textContent = `$${monthlyRevenue.toFixed(2)}`;
    document.getElementById('payment-issues').textContent = paymentIssues;

    // Update recent activity
    updateRecentActivity();
}

// Update recent activity
function updateRecentActivity() {
    const recentActivity = auditTrail.slice(0, 5);
    const activityList = document.getElementById('recent-activity-list');
    
    if (!activityList) return;

    activityList.innerHTML = recentActivity.map(activity => `
        <div class="activity-item">
            <div class="activity-info">
                <div class="activity-action">${formatAction(activity.action)}</div>
                <div class="activity-details">${activity.details}</div>
            </div>
            <div class="activity-time">${formatDate(activity.timestamp)}</div>
        </div>
    `).join('');
}

// Load subscriptions
function loadSubscriptions(filteredData = null) {
    const tbody = document.getElementById('subscriptions-table-body');
    if (!tbody) return;

    const data = filteredData || subscriptions;
    
    tbody.innerHTML = data.map(sub => {
        const user = users.find(u => u.id === sub.userId);
        if (!user) return '';

        return `
            <tr>
                <td>${sub.userId}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${sub.plan}</td>
                <td><span class="status-badge status-${sub.status}">${sub.status}</span></td>
                <td>${sub.nextBilling || 'N/A'}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-primary" onclick="viewUser('${sub.userId}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="editUser('${sub.userId}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Load billing history
function loadBillingHistory(filteredData = null) {
    const tbody = document.getElementById('billing-table-body');
    if (!tbody) return;

    const data = filteredData || billingHistory;
    
    tbody.innerHTML = data.map(billing => {
        const user = users.find(u => u.id === billing.userId);
        return `
            <tr>
                <td>${billing.id}</td>
                <td>${user ? user.name : 'Unknown'}</td>
                <td>$${billing.amount.toFixed(2)}</td>
                <td>${formatDate(billing.date)}</td>
                <td><span class="status-badge status-${billing.status}">${billing.status}</span></td>
                <td>${billing.method}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-primary" onclick="viewTransaction('${billing.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${billing.status === 'completed' ? `
                            <button class="btn btn-sm btn-warning" onclick="initiateRefund('${billing.id}')">
                                <i class="fas fa-undo"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Load refunds
function loadRefunds(filteredData = null) {
    const tbody = document.getElementById('refunds-table-body');
    if (!tbody) return;

    const data = filteredData || refunds;
    
    tbody.innerHTML = data.map(refund => {
        const user = users.find(u => u.id === refund.userId);
        return `
            <tr>
                <td>${refund.id}</td>
                <td>${refund.transactionId}</td>
                <td>${user ? user.name : 'Unknown'}</td>
                <td>$${refund.amount.toFixed(2)}</td>
                <td>${formatDate(refund.date)}</td>
                <td><span class="status-badge status-${refund.status}">${refund.status}</span></td>
                <td>${refund.reason}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm btn-primary" onclick="viewRefund('${refund.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Load audit trail
function loadAuditTrail(filteredData = null) {
    const tbody = document.getElementById('audit-table-body');
    if (!tbody) return;

    const data = filteredData || auditTrail;
    
    tbody.innerHTML = data.map(audit => `
        <tr>
            <td>${formatDateTime(audit.timestamp)}</td>
            <td>${audit.admin}</td>
            <td>${formatAction(audit.action)}</td>
            <td>${audit.target}</td>
            <td>${audit.details}</td>
            <td>${audit.ipAddress}</td>
        </tr>
    `).join('');
}

// View user details
function viewUser(userId) {
    const user = users.find(u => u.id === userId);
    const subscription = subscriptions.find(s => s.userId === userId);
    
    if (!user) return;

    currentUser = userId;
    
    // Update modal content
    document.getElementById('modal-user-id').textContent = user.id;
    document.getElementById('modal-user-name').textContent = user.name;
    document.getElementById('modal-user-email').textContent = user.email;
    document.getElementById('modal-user-plan').textContent = subscription ? subscription.plan : 'No subscription';
    document.getElementById('modal-user-status').innerHTML = subscription ? 
        `<span class="status-badge status-${subscription.status}">${subscription.status}</span>` : 
        'No subscription';
    
    document.getElementById('admin-notes').value = subscription ? subscription.adminNotes || '' : '';
    
    // Show modal
    document.getElementById('userModal').style.display = 'block';
    
    // Log to audit trail
    addToAuditTrail('user_viewed', userId, `Viewed user details for ${user.name}`);
}

// Edit user
function editUser(userId) {
    viewUser(userId); // Same as view for now
}

// Close modal
function closeModal() {
    document.getElementById('userModal').style.display = 'none';
    currentUser = null;
}

// Grant subscription
function grantSubscription() {
    if (!currentUser) return;

    const subscription = subscriptions.find(s => s.userId === currentUser);
    if (subscription) {
        subscription.status = 'active';
        subscription.nextBilling = calculateNextBilling();
    } else {
        subscriptions.push({
            userId: currentUser,
            plan: 'Basic',
            status: 'active',
            startDate: new Date().toISOString().split('T')[0],
            nextBilling: calculateNextBilling(),
            amount: 9.99,
            adminNotes: ''
        });
    }

    saveData();
    loadSubscriptions();
    updateDashboard();
    closeModal();
    
    // Log to audit trail
    const user = users.find(u => u.id === currentUser);
    addToAuditTrail('subscription_granted', currentUser, `Subscription granted for ${user.name}`);
    
    showToast('Subscription granted successfully', 'success');
}

// Revoke subscription
function revokeSubscription() {
    if (!currentUser) return;

    const subscription = subscriptions.find(s => s.userId === currentUser);
    if (subscription) {
        subscription.status = 'cancelled';
        subscription.nextBilling = '';
    }

    saveData();
    loadSubscriptions();
    updateDashboard();
    closeModal();
    
    // Log to audit trail
    const user = users.find(u => u.id === currentUser);
    addToAuditTrail('subscription_revoked', currentUser, `Subscription revoked for ${user.name}`);
    
    showToast('Subscription revoked successfully', 'warning');
}

// Extend subscription
function extendSubscription() {
    if (!currentUser) return;

    const subscription = subscriptions.find(s => s.userId === currentUser);
    if (subscription) {
        subscription.nextBilling = extendDate(subscription.nextBilling, 30);
    }

    saveData();
    loadSubscriptions();
    updateDashboard();
    closeModal();
    
    // Log to audit trail
    const user = users.find(u => u.id === currentUser);
    addToAuditTrail('subscription_extended', currentUser, `Subscription extended for ${user.name}`);
    
    showToast('Subscription extended successfully', 'success');
}

// Save user changes
function saveUserChanges() {
    if (!currentUser) return;

    const subscription = subscriptions.find(s => s.userId === currentUser);
    if (subscription) {
        subscription.adminNotes = document.getElementById('admin-notes').value;
    }

    saveData();
    closeModal();
    
    // Log to audit trail
    const user = users.find(u => u.id === currentUser);
    addToAuditTrail('user_updated', currentUser, `User notes updated for ${user.name}`);
    
    showToast('User changes saved successfully', 'success');
}

// Show refund modal
function showRefundModal() {
    document.getElementById('refundModal').style.display = 'block';
}

// Close refund modal
function closeRefundModal() {
    document.getElementById('refundModal').style.display = 'none';
    // Clear form
    document.getElementById('refund-transaction').value = '';
    document.getElementById('refund-amount').value = '';
    document.getElementById('refund-reason').value = '';
    document.getElementById('refund-notes').value = '';
}

// Initiate refund
function initiateRefund(transactionId) {
    const transaction = billingHistory.find(b => b.id === transactionId);
    if (!transaction) return;

    document.getElementById('refund-transaction').value = transactionId;
    document.getElementById('refund-amount').value = transaction.amount;
    showRefundModal();
}

// Process refund
function processRefund() {
    const transactionId = document.getElementById('refund-transaction').value;
    const amount = parseFloat(document.getElementById('refund-amount').value);
    const reason = document.getElementById('refund-reason').value;
    const notes = document.getElementById('refund-notes').value;

    if (!transactionId || !amount || !reason) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const transaction = billingHistory.find(b => b.id === transactionId);
    if (!transaction) {
        showToast('Transaction not found', 'error');
        return;
    }

    // Create refund record
    const refund = {
        id: `REF${String(refunds.length + 1).padStart(3, '0')}`,
        transactionId: transactionId,
        userId: transaction.userId,
        amount: amount,
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
        reason: reason,
        notes: notes
    };

    refunds.push(refund);
    saveData();
    loadRefunds();
    closeRefundModal();

    // Log to audit trail
    addToAuditTrail('refund_processed', refund.id, `Refund of $${amount} processed for transaction ${transactionId}`);

    showToast('Refund processed successfully', 'success');
}

// View transaction
function viewTransaction(transactionId) {
    const transaction = billingHistory.find(b => b.id === transactionId);
    if (!transaction) return;

    showToast(`Transaction ${transactionId}: ${transaction.status} - $${transaction.amount}`, 'info');
}

// View refund
function viewRefund(refundId) {
    const refund = refunds.find(r => r.id === refundId);
    if (!refund) return;

    showToast(`Refund ${refundId}: ${refund.status} - $${refund.amount} - ${refund.reason}`, 'info');
}

// Apply filters for subscriptions
function applyFilters() {
    const searchTerm = document.getElementById('subscription-search').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;

    let filtered = subscriptions;

    if (searchTerm) {
        filtered = filtered.filter(sub => {
            const user = users.find(u => u.id === sub.userId);
            return user && (
                user.name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                sub.userId.toLowerCase().includes(searchTerm)
            );
        });
    }

    if (statusFilter) {
        filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    loadSubscriptions(filtered);
}

// Apply billing filters
function applyBillingFilters() {
    const searchTerm = document.getElementById('billing-search').value.toLowerCase();
    const dateFilter = document.getElementById('date-filter').value;
    const statusFilter = document.getElementById('payment-status-filter').value;

    let filtered = billingHistory;

    if (searchTerm) {
        filtered = filtered.filter(billing => {
            const user = users.find(u => u.id === billing.userId);
            return (
                billing.id.toLowerCase().includes(searchTerm) ||
                (user && user.name.toLowerCase().includes(searchTerm)) ||
                billing.method.toLowerCase().includes(searchTerm)
            );
        });
    }

    if (dateFilter) {
        filtered = filtered.filter(billing => billing.date === dateFilter);
    }

    if (statusFilter) {
        filtered = filtered.filter(billing => billing.status === statusFilter);
    }

    loadBillingHistory(filtered);
}

// Apply audit filters
function applyAuditFilters() {
    const searchTerm = document.getElementById('audit-search').value.toLowerCase();
    const actionFilter = document.getElementById('action-filter').value;
    const dateFilter = document.getElementById('audit-date-filter').value;

    let filtered = auditTrail;

    if (searchTerm) {
        filtered = filtered.filter(audit => 
            audit.admin.toLowerCase().includes(searchTerm) ||
            audit.target.toLowerCase().includes(searchTerm) ||
            audit.details.toLowerCase().includes(searchTerm)
        );
    }

    if (actionFilter) {
        filtered = filtered.filter(audit => audit.action === actionFilter);
    }

    if (dateFilter) {
        filtered = filtered.filter(audit => audit.timestamp.startsWith(dateFilter));
    }

    loadAuditTrail(filtered);
}

// Add to audit trail
function addToAuditTrail(action, target, details) {
    const audit = {
        timestamp: new Date().toISOString(),
        admin: 'Admin User', // In real app, this would be the logged-in admin
        action: action,
        target: target,
        details: details,
        ipAddress: '192.168.1.100' // In real app, this would be the actual IP
    };

    auditTrail.unshift(audit);
    saveData();
    updateRecentActivity();
}

// Utility functions
function calculateNextBilling() {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split('T')[0];
}

function extendDate(dateString, days) {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatAction(action) {
    const actions = {
        'subscription_granted': 'Subscription Granted',
        'subscription_revoked': 'Subscription Revoked',
        'subscription_extended': 'Subscription Extended',
        'payment_processed': 'Payment Processed',
        'refund_processed': 'Refund Processed',
        'user_updated': 'User Updated',
        'user_viewed': 'User Viewed'
    };
    return actions[action] || action;
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 
                 type === 'warning' ? 'exclamation-triangle' : 'info-circle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastSlideIn 0.3s ease reverse';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Export data
function exportData() {
    const data = {
        users,
        subscriptions,
        billingHistory,
        refunds,
        auditTrail,
        exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscription-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Data exported successfully', 'success');
    
    // Log to audit trail
    addToAuditTrail('data_exported', 'system', 'Admin data exported');
}

// Refresh data
function refreshData() {
    saveData();
    updateDashboard();
    loadSubscriptions();
    loadBillingHistory();
    loadRefunds();
    loadAuditTrail();
    
    showToast('Data refreshed successfully', 'success');
}

// Close modals when clicking outside
window.onclick = function(event) {
    const userModal = document.getElementById('userModal');
    const refundModal = document.getElementById('refundModal');
    
    if (event.target === userModal) {
        closeModal();
    }
    if (event.target === refundModal) {
        closeRefundModal();
    }
}