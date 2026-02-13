// ============================
// Champbucks - ADMIN DASHBOARD! 🎉
// Secure message management and analytics system
// ============================

// ============================
// CONFIGURATION! 🔧
// ============================
const ADMIN_CONFIG = {
  // Security settings
  defaultPassword: "admin2025!",
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
  rememberDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
  
  // Testing bypass (remove in production!)
  bypassPassword: "bypass123",
  bypassEnabled: true, // Set to false for production
  
  // Data storage keys
  sessionKey: 'champbucks_admin_session',
  messagesKey: 'champbucks_submissions',
  settingsKey: 'champbucks_admin_settings',
  backupKey: 'champbucks_admin_backup',
  
  // Pagination
  messagesPerPage: 10,
  maxMessagesPerPage: 50
};

// ============================
// STATE MANAGEMENT! 📊
// ============================
let adminState = {
  isAuthenticated: false,
  currentUser: null,
  sessionExpiry: null,
  currentPage: 1,
  messages: [],
  filteredMessages: [],
  sortField: 'timestamp',
  sortDirection: 'desc',
  filters: {
    search: '',
    service: '',
    status: '',
    dateRange: ''
  }
};

// ============================
// AUTHENTICATION SYSTEM! 🔐
// ============================
class AdminAuth {
  constructor() {
    this.sessionKey = ADMIN_CONFIG.sessionKey;
    this.passwordHash = null; // Will be set asynchronously
    this.initializeHash();
  }
  
  async initializeHash() {
    try {
      this.passwordHash = await this.hashPassword(ADMIN_CONFIG.defaultPassword);
      console.log('🔐 AdminAuth initialized with password hash:', this.passwordHash.substring(0, 16) + '...');
    } catch (error) {
      console.error('❌ Hash initialization error:', error);
      this.passwordHash = this.simpleHash(ADMIN_CONFIG.defaultPassword);
    }
  }
  
  async hashPassword(password) {
    // Use Web Crypto API for consistent SHA-256 hashing
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      console.log('🔑 Password hashed successfully:', hashHex.substring(0, 16) + '...');
      return hashHex;
    } catch (error) {
      console.error('Hash error, using fallback:', error);
      // Fallback to simple consistent hash
      return this.simpleHash(password);
    }
  }
  
  simpleHash(password) {
    // Consistent fallback hash function
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & 0xFFFFFFFF; // Ensure 32-bit
    }
    return Math.abs(hash).toString(16);
  }
  
  async login(password, rememberMe = false) {
    console.log('🔐 Login attempt - password length:', password.length);
    
    // Check bypass password first (for testing)
    if (ADMIN_CONFIG.bypassEnabled && password === ADMIN_CONFIG.bypassPassword) {
      console.log('🔓 Bypass password used!');
      const expiry = rememberMe 
        ? Date.now() + ADMIN_CONFIG.rememberDuration
        : Date.now() + ADMIN_CONFIG.sessionTimeout;
      
      const session = {
        isAuthenticated: true,
        loginTime: Date.now(),
        expiry: expiry,
        rememberMe: rememberMe,
        bypassUsed: true
      };
      
      localStorage.setItem(this.sessionKey, JSON.stringify(session));
      adminState.isAuthenticated = true;
      adminState.sessionExpiry = expiry;
      
      console.log('✅ Bypass login successful! Session expires:', new Date(expiry));
      this.updateLoginTime();
      return true;
    }
    
    try {
      const hashedInput = await this.hashPassword(password);
      console.log('🔑 Generated hash:', hashedInput.substring(0, 16) + '...');
      console.log('🔑 Stored hash:', this.passwordHash.substring(0, 16) + '...');
      console.log('🔑 Hashes match:', hashedInput === this.passwordHash);
      
      if (hashedInput === this.passwordHash) {
        const expiry = rememberMe 
          ? Date.now() + ADMIN_CONFIG.rememberDuration
          : Date.now() + ADMIN_CONFIG.sessionTimeout;
        
        const session = {
          isAuthenticated: true,
          loginTime: Date.now(),
          expiry: expiry,
          rememberMe: rememberMe
        };
        
        localStorage.setItem(this.sessionKey, JSON.stringify(session));
        adminState.isAuthenticated = true;
        adminState.sessionExpiry = expiry;
        
        console.log('✅ Login successful! Session expires:', new Date(expiry));
        this.updateLoginTime();
        return true;
      } else {
        console.log('❌ Login failed - hashes do not match');
        return false;
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      return false;
    }
  }
  
  logout() {
    console.log('👋 Logging out...');
    localStorage.removeItem(this.sessionKey);
    adminState.isAuthenticated = false;
    adminState.currentUser = null;
    adminState.sessionExpiry = null;
    
    // Redirect to login (better path detection for local files)
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath.includes('auth.html');
    
    if (!isAuthPage) {
      console.log('🔄 Redirecting to login page...');
      window.location.href = 'auth.html';
    }
  }
  
  checkAuth() {
    try {
      console.log('🔍 Checking authentication...');
      const sessionData = localStorage.getItem(this.sessionKey);
      console.log('📂 Session data found:', !!sessionData);
      
      if (!sessionData) {
        console.log('❌ No session data found');
        return false;
      }
      
      const session = JSON.parse(sessionData);
      console.log('👤 Session data:', session);
      
      if (!session.isAuthenticated) {
        console.log('❌ Session not authenticated');
        return false;
      }
      
      if (Date.now() > session.expiry) {
        console.log('⏰ Session expired');
        this.logout();
        return false;
      }
      
      adminState.isAuthenticated = true;
      adminState.sessionExpiry = session.expiry;
      console.log('✅ Authentication valid');
      this.updateLoginTime();
      
      // Auto-refresh session timer
      if (!session.rememberMe) {
        setTimeout(() => this.checkAuth(), ADMIN_CONFIG.sessionTimeout);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Auth check error:', error);
      this.logout();
      return false;
    }
  }
  
  updateLoginTime() {
    if (adminState.isAuthenticated) {
      const remainingTime = adminState.sessionExpiry - Date.now();
      const minutes = Math.floor(remainingTime / (1000 * 60));
      
      if (minutes < 5 && !adminState.sessionWarningShown) {
        showToast(`⚠️ Session expires in ${minutes} minutes!`, 'warning');
        adminState.sessionWarningShown = true;
      }
    }
  }
  
  updatePassword(newPassword) {
    this.passwordHash = this.hashPassword(newPassword);
    showToast('🔐 Password updated successfully!', 'success');
    this.logout();
  }
}

// ============================
// DATA MANAGER! 💾
// ============================
class DataManager {
  constructor() {
    this.messagesKey = ADMIN_CONFIG.messagesKey;
  }
  
  loadMessages() {
    try {
      const messages = JSON.parse(localStorage.getItem(this.messagesKey) || '[]');
      return messages.map(msg => {
        // Normalize timestamp to ISO format
        let normalizedTimestamp = msg.timestamp;
        if (msg.timestamp) {
          try {
            const date = new Date(msg.timestamp);
            if (!isNaN(date.getTime())) {
              normalizedTimestamp = date.toISOString();
            } else {
              console.warn('Invalid timestamp format, using current time:', msg.timestamp);
              normalizedTimestamp = new Date().toISOString();
            }
          } catch (error) {
            console.error('Error normalizing timestamp:', error);
            normalizedTimestamp = new Date().toISOString();
          }
        } else {
          normalizedTimestamp = new Date().toISOString();
        }
        
        return {
          ...msg,
          id: msg.id || Date.now() + Math.random(),
          status: msg.status || 'unread',
          timestamp: normalizedTimestamp,
          starred: msg.starred || false
        };
      });
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }
  
  saveMessages(messages) {
    try {
      localStorage.setItem(this.messagesKey, JSON.stringify(messages));
      return true;
    } catch (error) {
      console.error('Error saving messages:', error);
      return false;
    }
  }
  
  addMessage(messageData) {
    const messages = this.loadMessages();
    const newMessage = {
      id: Date.now(),
      ...messageData,
      status: 'unread',
      timestamp: new Date().toISOString(),
      starred: false
    };
    messages.push(newMessage);
    this.saveMessages(messages);
    return newMessage;
  }
  
  updateMessageStatus(messageId, status) {
    const messages = this.loadMessages();
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    
    if (messageIndex !== -1) {
      messages[messageIndex].status = status;
      this.saveMessages(messages);
      return true;
    }
    return false;
  }
  
  deleteMessage(messageId) {
    const messages = this.loadMessages();
    const filteredMessages = messages.filter(msg => msg.id !== messageId);
    
    if (filteredMessages.length < messages.length) {
      this.saveMessages(filteredMessages);
      return true;
    }
    return false;
  }
  
  exportMessages(messages, format = 'csv') {
    try {
      if (format === 'csv') {
        return this.exportToCSV(messages);
      } else if (format === 'json') {
        return this.exportToJSON(messages);
      }
      return null;
    } catch (error) {
      console.error('Export error:', error);
      return null;
    }
  }
  
  exportToCSV(messages) {
    const headers = ['Date', 'Name', 'Email', 'Phone', 'Service', 'Message', 'Status'];
    const csvContent = [
      headers.join(','),
      ...messages.map(msg => [
        `"${new Date(msg.timestamp).toLocaleString()}"`,
        `"${msg.name}"`,
        `"${msg.email}"`,
        `"${msg.phone || ''}"`,
        `"${msg.service || ''}"`,
        `"${msg.message.replace(/"/g, '""')}"`,
        `"${msg.status}"`
      ].join(','))
    ].join('\n');
    
    return csvContent;
  }
  
  exportToJSON(messages) {
    return JSON.stringify(messages, null, 2);
  }
}

// ============================
// MESSAGE MANAGER! 📧
// ============================
class MessageManager {
  constructor(dataManager) {
    this.dataManager = dataManager;
    this.currentFilter = { ...adminState.filters };
  }
  
  loadMessages() {
    adminState.messages = this.dataManager.loadMessages();
    adminState.filteredMessages = this.applyFilters(adminState.messages);
    this.updateUI();
  }
  
  applyFilters(messages) {
    return messages.filter(message => {
      // Search filter
      if (this.currentFilter.search) {
        const searchTerm = this.currentFilter.search.toLowerCase();
        const searchableFields = [
          message.name,
          message.email,
          message.phone,
          message.service,
          message.message
        ].join(' ').toLowerCase();
        
        if (!searchableFields.includes(searchTerm)) {
          return false;
        }
      }
      
      // Service filter
      if (this.currentFilter.service && message.service !== this.currentFilter.service) {
        return false;
      }
      
      // Status filter
      if (this.currentFilter.status && message.status !== this.currentFilter.status) {
        return false;
      }
      
      // Date range filter
      if (this.currentFilter.dateRange) {
        // Handle both ISO and local string timestamp formats
        let messageDate;
        try {
          messageDate = new Date(message.timestamp);
          // Check if date is valid
          if (isNaN(messageDate.getTime())) {
            console.warn('Invalid timestamp format:', message.timestamp);
            return false; // Filter out messages with invalid timestamps
          }
        } catch (error) {
          console.error('Error parsing timestamp:', error);
          return false;
        }
        const now = new Date();
        
        switch (this.currentFilter.dateRange) {
          case 'today':
            if (messageDate.toDateString() !== now.toDateString()) {
              return false;
            }
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (messageDate < weekAgo) {
              return false;
            }
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            if (messageDate < monthAgo) {
              return false;
            }
            break;
        }
      }
      
      return true;
    });
  }
  
  sortMessages(messages, field, direction) {
    return messages.sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];
      
      if (field === 'timestamp') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (aVal < bVal) {
        return direction === 'asc' ? -1 : 1;
      }
      if (aVal > bVal) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
  
  updateFilters(filters) {
    this.currentFilter = { ...filters };
    adminState.filters = filters;
    adminState.filteredMessages = this.applyFilters(adminState.messages);
    adminState.currentPage = 1;
    this.updateUI();
  }
  
  markAsRead(messageId) {
    if (this.dataManager.updateMessageStatus(messageId, 'read')) {
      this.loadMessages();
      showToast('✅ Message marked as read', 'success');
      
      // Update analytics
      updateAnalytics();
    }
  }
  
  markAllAsRead() {
    const unreadMessages = adminState.filteredMessages.filter(msg => msg.status === 'unread');
    let updatedCount = 0;
    
    unreadMessages.forEach(message => {
      if (this.dataManager.updateMessageStatus(message.id, 'read')) {
        updatedCount++;
      }
    });
    
    if (updatedCount > 0) {
      this.loadMessages();
      showToast(`✅ ${updatedCount} messages marked as read`, 'success');
      updateAnalytics();
    }
  }
  
  deleteMessage(messageId) {
    if (confirm('🗑️ Are you sure you want to delete this message?')) {
      if (this.dataManager.deleteMessage(messageId)) {
        this.loadMessages();
        showToast('🗑️ Message deleted', 'success');
        updateAnalytics();
      }
    }
  }
  
  deleteAllMessages() {
    if (confirm('⚠️ Are you sure you want to delete ALL messages? This cannot be undone!')) {
      this.dataManager.saveMessages([]);
      this.loadMessages();
      showToast('🗑️ All messages deleted', 'success');
      updateAnalytics();
    }
  }
  
  updateUI() {
    this.renderMessagesTable();
    this.updateStatistics();
    this.updatePagination();
  }
  
  renderMessagesTable() {
    const tbody = document.getElementById('messagesTableBody');
    if (!tbody) {
      console.error('Error: messagesTableBody element not found in DOM');
      return;
    }
    
    const startIndex = (adminState.currentPage - 1) * ADMIN_CONFIG.messagesPerPage;
    const endIndex = startIndex + ADMIN_CONFIG.messagesPerPage;
    const pageMessages = adminState.filteredMessages.slice(startIndex, endIndex);
    
    if (pageMessages.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-5">
            <i class="bi bi-inbox fs-1 text-muted"></i>
            <p class="text-muted mt-3">No messages found</p>
          </td>
        </tr>
      `;
      return;
    }
    
    tbody.innerHTML = pageMessages.map(message => `
      <tr data-message-id="${message.id}" class="${message.status === 'unread' ? 'unread-row' : ''}">
        <td>
          <input type="checkbox" class="message-checkbox" data-id="${message.id}">
        </td>
        <td>
          <span class="status-indicator ${message.status}"></span>
        </td>
        <td>
          <small class="text-muted">${new Date(message.timestamp).toLocaleDateString()}</small><br>
          <strong>${new Date(message.timestamp).toLocaleTimeString()}</strong>
        </td>
        <td>
          <strong>${message.name}</strong>
        </td>
        <td>
          <a href="mailto:${message.email}" class="text-decoration-none">
            ${message.email}
          </a>
        </td>
        <td>
          <span class="badge bg-info">${this.getServiceLabel(message.service)}</span>
        </td>
        <td>
          <div class="message-preview" title="${message.message.replace(/"/g, '&quot;')}">
            ${message.message}
          </div>
        </td>
        <td>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-sm btn-outline-primary" onclick="viewMessage(${message.id})" title="View">
              <i class="bi bi-eye"></i>
            </button>
            ${message.status === 'unread' ? 
              `<button class="btn btn-sm btn-success" onclick="messageManager.markAsRead(${message.id})" title="Mark as read">
                <i class="bi bi-check"></i>
              </button>` : ''
            }
            <button class="btn btn-sm btn-danger" onclick="messageManager.deleteMessage(${message.id})" title="Delete">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }
  
  getServiceLabel(service) {
    const serviceLabels = {
      cctv: '📹 CCTV',
      computer: '💻 Computer',
      network: '🌐 Network',
      phone: '📱 Phone',
      smarthome: '🏠 Smart Home',
      support: '🎧 IT Support',
      mobileapp: '📱 Mobile Apps',
      website: '🌐 Websites',
      design: '🎨 Design'
    };
    return serviceLabels[service] || service || 'General';
  }
  
  updatePagination() {
    const totalPages = Math.ceil(adminState.filteredMessages.length / ADMIN_CONFIG.messagesPerPage);
    const pagination = document.getElementById('messagesPagination');
    
    if (!pagination) return;
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
      <li class="page-item ${adminState.currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="changePage(${adminState.currentPage - 1})">
          <i class="bi bi-chevron-left"></i>
        </a>
      </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= adminState.currentPage - 2 && i <= adminState.currentPage + 2)) {
        paginationHTML += `
          <li class="page-item ${i === adminState.currentPage ? 'active' : ''}">
            <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
          </li>
        `;
      } else if (i === adminState.currentPage - 3 || i === adminState.currentPage + 3) {
        paginationHTML += `
          <li class="page-item disabled">
            <a class="page-link">...</a>
          </li>
        `;
      }
    }
    
    // Next button
    paginationHTML += `
      <li class="page-item ${adminState.currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="changePage(${adminState.currentPage + 1})">
          <i class="bi bi-chevron-right"></i>
        </a>
      </li>
    `;
    
    pagination.innerHTML = paginationHTML;
  }
  
  updateStatistics() {
    const totalMessages = adminState.filteredMessages.length;
    const unreadMessages = adminState.filteredMessages.filter(msg => msg.status === 'unread').length;
    const todayMessages = adminState.filteredMessages.filter(msg => {
      const messageDate = new Date(msg.timestamp).toDateString();
      const today = new Date().toDateString();
      return messageDate === today;
    }).length;
    
    // Update statistics displays
    const totalMessagesEl = document.getElementById('totalMessages');
    const unreadCountEl = document.getElementById('unreadCount');
    const totalMessagesNavEl = document.getElementById('totalMessages');
    const unreadMessagesEl = document.getElementById('unreadMessagesStat');
    const todayMessagesEl = document.getElementById('todayMessagesStat');
    
    if (totalMessagesEl) totalMessagesEl.textContent = totalMessages;
    if (unreadCountEl) unreadCountEl.textContent = unreadMessages;
    if (totalMessagesNavEl) totalMessagesNavEl.textContent = totalMessages;
    if (unreadMessagesEl) unreadMessagesEl.textContent = unreadMessages;
    if (todayMessagesEl) todayMessagesEl.textContent = todayMessages;
  }
}

// ============================
// ANALYTICS MANAGER! 📊
// ============================
class AnalyticsManager {
  constructor() {
    this.volumeChart = null;
    this.serviceChart = null;
  }
  
  updateAnalytics() {
    this.calculateStatistics();
    this.renderCharts();
  }
  
  calculateStatistics() {
    const messages = adminState.messages;
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklyMessages = messages.filter(msg => 
      new Date(msg.timestamp) >= oneWeekAgo
    );
    
    const weeklyAverage = (weeklyMessages.length / 7).toFixed(1);
    
    // Update weekly average
    const weeklyAverageEl = document.getElementById('weeklyAverageStat');
    if (weeklyAverageEl) {
      weeklyAverageEl.textContent = weeklyAverage;
    }
  }
  
  renderCharts() {
    this.renderVolumeChart();
    this.renderServiceChart();
  }
  
  renderVolumeChart() {
    const ctx = document.getElementById('volumeChart');
    if (!ctx) return;
    
    const last30Days = this.getLast30DaysData();
    
    if (this.volumeChart) {
      this.volumeChart.destroy();
    }
    
    this.volumeChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: last30Days.labels,
        datasets: [{
          label: 'Messages per Day',
          data: last30Days.data,
          borderColor: '#ff006e',
          backgroundColor: 'rgba(255, 0, 110, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              font: {
                family: "'Fredoka One', cursive"
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }
  
  renderServiceChart() {
    const ctx = document.getElementById('serviceChart');
    if (!ctx) return;
    
    const serviceData = this.getServiceDistribution();
    
    if (this.serviceChart) {
      this.serviceChart.destroy();
    }
    
    this.serviceChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: serviceData.labels,
        datasets: [{
          data: serviceData.data,
          backgroundColor: [
            '#ff006e', '#39ff14', '#fff01f', '#00ffff', 
            '#bc13fe', '#ff6b35', '#6366f1', '#8b5cf6'
          ],
          borderWidth: 3,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                family: "'Fredoka One', cursive"
              },
              padding: 20
            }
          }
        }
      }
    });
  }
  
  getLast30DaysData() {
    const messages = adminState.messages;
    const days = [];
    const counts = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayMessages = messages.filter(msg => {
        const msgDate = new Date(msg.timestamp);
        return msgDate >= date && msgDate < nextDate;
      });
      
      days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      counts.push(dayMessages.length);
    }
    
    return { labels: days, data: counts };
  }
  
  getServiceDistribution() {
    const messages = adminState.messages;
    const serviceCounts = {};
    
    messages.forEach(msg => {
      if (msg.service) {
        serviceCounts[msg.service] = (serviceCounts[msg.service] || 0) + 1;
      }
    });
    
    const labels = Object.keys(serviceCounts).map(service => 
      messageManager.getServiceLabel(service)
    );
    
    return {
      labels: labels,
      data: Object.values(serviceCounts)
    };
  }
}

// ============================
// GLOBAL INSTANCES! 🌍
// ============================
let adminAuth;
let dataManager;
let messageManager;
let analyticsManager;

// ============================
// UTILITY FUNCTIONS! 🔧
// ============================
function showToast(message, type = 'success') {
  try {
    const toast = document.getElementById('toast');
    if (!toast) {
      console.warn('Toast element not found');
      alert(message);
      return;
    }
    
    toast.textContent = message;
    toast.className = `admin-toast ${type}`;
    toast.style.display = 'block';
    toast.style.animation = 'slideIn 0.5s ease';
    
    setTimeout(() => {
      toast.style.display = 'none';
    }, 4000);
  } catch (error) {
    console.error('Toast error:', error);
    alert(message);
  }
}

function createConfetti(count = 30) {
  try {
    const colors = ['#ff006e', '#39ff14', '#fff01f', '#00ffff', '#bc13fe', '#ff6b35'];
    
    for (let i = 0; i < count; i++) {
      const confetti = document.createElement('div');
      confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        left: ${Math.random() * 100}vw;
        top: -10px;
        border-radius: 50%;
        pointer-events: none;
        z-index: 10000;
        animation: confetti-fall 3s linear forwards;
      `;
      
      document.body.appendChild(confetti);
      
      setTimeout(() => {
        if (confetti.parentNode) {
          confetti.parentNode.removeChild(confetti);
        }
      }, 3000);
    }
  } catch (error) {
    console.error('Confetti error:', error);
  }
}

// Add confetti animation to document
if (!document.getElementById('confettiStyles')) {
  const style = document.createElement('style');
  style.id = 'confettiStyles';
  style.textContent = `
    @keyframes confetti-fall {
      0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

// ============================
// PAGE FUNCTIONS! 📄
// ============================
async function initializeAuth() {
  console.log('🚀 Initializing authentication system...');
  adminAuth = new AdminAuth();
  
  // Wait for async hash initialization properly
  await adminAuth.initializeHash();
  
  console.log('🔍 Checking authentication status...');
  
  // Check if already authenticated
  if (adminAuth.checkAuth()) {
    console.log('✅ Already authenticated');
    // Redirect to dashboard if on login page
    if (window.location.pathname.includes('auth.html')) {
      console.log('🔄 Redirecting to dashboard...');
      window.location.href = 'index.html';
    }
  } else {
    console.log('❌ Not authenticated');
    // Redirect to login if not authenticated
    if (!window.location.pathname.includes('auth.html')) {
      console.log('🔄 Redirecting to login...');
      window.location.href = 'auth.html';
    }
  }
}

async function initializeDashboard() {
  console.log('🚀 Initializing dashboard...');
  
  // Wait for adminAuth to be ready
  await new Promise(resolve => {
    const checkReady = () => {
      if (adminAuth && adminAuth.passwordHash) {
        resolve();
      } else {
        setTimeout(checkReady, 50);
      }
    };
    checkReady();
  });
  
  if (!adminAuth.checkAuth()) {
    console.log('❌ Not authenticated, redirecting to login...');
    window.location.href = 'auth.html';
    return;
  }
  
  dataManager = new DataManager();
  messageManager = new MessageManager(dataManager);
  analyticsManager = new AnalyticsManager();
  
  // Load initial data
  messageManager.loadMessages();
  updateAnalytics();
  
  // Setup event listeners
  setupEventListeners();
  
  // Auto-refresh every 5 minutes
  setInterval(refreshMessages, 5 * 60 * 1000);
  
  console.log('🎉 Admin Dashboard initialized!');
}

function setupEventListeners() {
  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Search and filters
  const searchInput = document.getElementById('searchInput');
  const serviceFilter = document.getElementById('serviceFilter');
  const statusFilter = document.getElementById('statusFilter');
  const dateFilter = document.getElementById('dateFilter');
  
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      updateFilters();
    }, 300));
  }
  
  if (serviceFilter) {
    serviceFilter.addEventListener('change', updateFilters);
  }
  
  if (statusFilter) {
    statusFilter.addEventListener('change', updateFilters);
  }
  
  if (dateFilter) {
    dateFilter.addEventListener('change', updateFilters);
  }
}

async function handleLogin(e) {
  e.preventDefault();
  
  const password = document.getElementById('password').value;
  const rememberMe = document.getElementById('rememberMe').checked;
  
  console.log('🔐 Processing login...');
  console.log('🔑 Password entered:', password.length > 0 ? 'Yes (' + password.length + ' chars)' : 'No password entered');
  
  // Basic validation
  if (!password || password.trim() === '') {
    showToast('⚠️ Please enter a password', 'error');
    return;
  }
  
  try {
    if (await adminAuth.login(password, rememberMe)) {
      createConfetti(50);
      showToast('🎉 Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    } else {
      showToast('❌ Invalid password! Try "admin" or check console.', 'error');
      console.log('❌ Authentication failed');
      
      // Shake effect on login card
      const loginCard = document.querySelector('.login-card');
      if (loginCard) {
        loginCard.style.animation = 'shake 0.5s';
        setTimeout(() => {
          loginCard.style.animation = '';
        }, 500);
      }
    }
  } catch (error) {
    console.error('❌ Login handler error:', error);
    showToast('❌ Login system error. Please refresh and try again.', 'error');
  }
}

function updateFilters() {
  const searchInput = document.getElementById('searchInput');
  const serviceFilter = document.getElementById('serviceFilter');
  const statusFilter = document.getElementById('statusFilter');
  const dateFilter = document.getElementById('dateFilter');
  
  const filters = {
    search: searchInput ? searchInput.value : '',
    service: serviceFilter ? serviceFilter.value : '',
    status: statusFilter ? statusFilter.value : '',
    dateRange: dateFilter ? dateFilter.value : ''
  };
  
  messageManager.updateFilters(filters);
}

function changePage(page) {
  adminState.currentPage = page;
  messageManager.updateUI();
  
  // Scroll to top of messages table
  const messagesTable = document.querySelector('.messages-table-container');
  if (messagesTable) {
    messagesTable.scrollIntoView({ behavior: 'smooth' });
  }
}

function sortMessages(field) {
  if (adminState.sortField === field) {
    adminState.sortDirection = adminState.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    adminState.sortField = field;
    adminState.sortDirection = 'desc';
  }
  
  adminState.filteredMessages = messageManager.sortMessages(
    adminState.filteredMessages, 
    adminState.sortField, 
    adminState.sortDirection
  );
  
  adminState.currentPage = 1;
  messageManager.updateUI();
  
  // Update sort indicator
  const sortIndicator = document.getElementById('sortIndicator');
  if (sortIndicator) {
    sortIndicator.textContent = adminState.sortDirection === 'asc' ? '↑' : '↓';
  }
}

function viewMessage(messageId) {
  const message = adminState.messages.find(msg => msg.id === messageId);
  if (!message) return;
  
  const modal = document.getElementById('messageModal');
  const modalBody = document.getElementById('messageModalBody');
  
  if (modalBody) {
    modalBody.innerHTML = `
      <div class="message-details">
        <div class="row">
          <div class="col-md-6">
            <strong>👤 Name:</strong><br>
            ${message.name}
          </div>
          <div class="col-md-6">
            <strong>📧 Email:</strong><br>
            <a href="mailto:${message.email}">${message.email}</a>
          </div>
        </div>
        <div class="row mt-3">
          <div class="col-md-6">
            <strong>📱 Phone:</strong><br>
            ${message.phone || 'Not provided'}
          </div>
          <div class="col-md-6">
            <strong>🔧 Service:</strong><br>
            <span class="badge bg-info">${messageManager.getServiceLabel(message.service)}</span>
          </div>
        </div>
        <div class="row mt-3">
          <div class="col-12">
            <strong>💬 Message:</strong><br>
            <div class="message-content p-3 bg-light rounded mt-2">
              ${message.message.replace(/\n/g, '<br>')}
            </div>
          </div>
        </div>
        <div class="row mt-3">
          <div class="col-12">
            <strong>🕐 Timestamp:</strong><br>
            ${new Date(message.timestamp).toLocaleString()}
          </div>
        </div>
        <div class="row mt-3">
          <div class="col-12">
            <strong>📊 Status:</strong><br>
            <span class="badge bg-${message.status === 'read' ? 'success' : 'danger'}">
              ${message.status === 'read' ? '✅ Read' : '🔴 Unread'}
            </span>
          </div>
        </div>
      </div>
    `;
  }
  
  // Show modal
  const modalInstance = new bootstrap.Modal(modal);
  modalInstance.show();
  
  // Store current message ID for modal buttons
  window.currentMessageId = messageId;
}

function markAsRead(messageId) {
  messageManager.markAsRead(messageId);
  
  // Close modal if open
  const modal = document.getElementById('messageModal');
  if (modal) {
    bootstrap.Modal.getInstance(modal)?.hide();
  }
}

function deleteMessage(messageId) {
  messageManager.deleteMessage(messageId);
  
  // Close modal if open
  const modal = document.getElementById('messageModal');
  if (modal) {
    bootstrap.Modal.getInstance(modal)?.hide();
  }
}

function markAllAsRead() {
  messageManager.markAllAsRead();
}

function deleteAllMessages() {
  messageManager.deleteAllMessages();
}

function refreshMessages() {
  messageManager.loadMessages();
  updateAnalytics();
  showToast('🔄 Messages refreshed', 'success');
}

function exportFilteredMessages() {
  const exportData = dataManager.exportMessages(adminState.filteredMessages, 'csv');
  if (exportData) {
    downloadFile(exportData, 'champbucks-messages.csv', 'text/csv');
    showToast('📥 Filtered messages exported', 'success');
  }
}

function exportAllData() {
  const exportData = dataManager.exportMessages(adminState.messages, 'csv');
  if (exportData) {
    downloadFile(exportData, 'champbucks-all-messages.csv', 'text/csv');
    showToast('📥 All messages exported', 'success');
  }
}

function downloadFile(content, filename, contentType) {
  try {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
    showToast('❌ Download failed', 'error');
  }
}

function updateAnalytics() {
  if (analyticsManager) {
    analyticsManager.updateAnalytics();
  }
}

function toggleSelectAll() {
  const selectAll = document.getElementById('selectAll');
  const checkboxes = document.querySelectorAll('.message-checkbox');
  
  checkboxes.forEach(checkbox => {
    checkbox.checked = selectAll.checked;
  });
}

function showSettings() {
  const settingsTab = document.querySelector('[data-bs-target="#settings"]');
  if (settingsTab) {
    settingsTab.click();
  }
}

function changePassword() {
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  if (!newPassword || !confirmPassword) {
    showToast('⚠️ Please fill in all password fields', 'error');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    showToast('❌ Passwords do not match', 'error');
    return;
  }
  
  if (newPassword.length < 6) {
    showToast('⚠️ Password must be at least 6 characters', 'error');
    return;
  }
  
  if (confirm('🔐 Are you sure you want to change the password?')) {
    adminAuth.updatePassword(newPassword);
  }
}

function logout() {
  console.log('👋 Logging out...');
  localStorage.removeItem(ADMIN_CONFIG.sessionKey);
  adminState.isAuthenticated = false;
  adminState.currentUser = null;
  adminState.sessionExpiry = null;
  
  showToast('👋 Logged out successfully', 'info');
  
  // Redirect to login (better path detection for local files)
  const currentPath = window.location.pathname;
  const isAuthPage = currentPath.includes('auth.html');
  
  if (!isAuthPage) {
    console.log('🔄 Redirecting to login page...');
    setTimeout(() => {
      window.location.href = 'auth.html';
    }, 1000);
  }
}

// Reset function for testing
function resetToDefaults() {
  console.log('🔄 Resetting to default credentials...');
  
  // Clear existing session
  localStorage.removeItem('champbucks_admin_session');
  
  // Reset hash to default
  if (typeof adminAuth !== 'undefined') {
    adminAuth.passwordHash = null;
    adminAuth.initializeHash();
  }
  
  showToast('🔄 Reset to default: password = "admin"', 'info');
  
  // Clear password field
  const passwordField = document.getElementById('password');
  if (passwordField) {
    passwordField.value = '';
    passwordField.focus();
  }
}

function backupData() {
  const backup = {
    messages: adminState.messages,
    settings: JSON.parse(localStorage.getItem(ADMIN_CONFIG.settingsKey) || '{}'),
    timestamp: new Date().toISOString()
  };
  
  const backupData = JSON.stringify(backup, null, 2);
  downloadFile(backupData, `champbucks-backup-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  showToast('📦 Backup created successfully', 'success');
}

function clearAllData() {
  if (confirm('⚠️ WARNING: This will delete ALL data including messages and settings. Are you absolutely sure?')) {
    localStorage.removeItem(ADMIN_CONFIG.messagesKey);
    localStorage.removeItem(ADMIN_CONFIG.settingsKey);
    localStorage.removeItem(ADMIN_CONFIG.backupKey);
    showToast('🗑️ All data cleared. Logging out...', 'error');
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }
}

// Utility function for debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ============================
// DEBUGGING FUNCTIONS! 🐛
// ============================
function updateDebugInfo() {
  try {
    const debugSection = document.getElementById('debugSection');
    const debugToggleBtn = document.getElementById('debugToggleBtn');
    
    if (!debugSection || !debugToggleBtn) return;
    
    // Get message counts
    const allMessages = JSON.parse(localStorage.getItem('innovatistech_messages') || '[]');
    const filteredMessages = adminState.filteredMessages || [];
    
    // Update debug info
    document.getElementById('debugTotalMessages').textContent = allMessages.length;
    document.getElementById('debugFilteredMessages').textContent = filteredMessages.length;
    
    // Show last message timestamp
    if (allMessages.length > 0) {
      const lastMessage = allMessages[allMessages.length - 1];
      document.getElementById('debugLastTimestamp').textContent = lastMessage.timestamp || 'No timestamp';
    } else {
      document.getElementById('debugLastTimestamp').textContent = 'No messages';
    }
  } catch (error) {
    console.error('Error updating debug info:', error);
  }
}

function toggleDebug() {
  try {
    const debugSection = document.getElementById('debugSection');
    const debugToggleBtn = document.getElementById('debugToggleBtn');
    
    if (!debugSection || !debugToggleBtn) return;
    
    if (debugSection.style.display === 'none' || !debugSection.style.display) {
      debugSection.style.display = 'block';
      debugToggleBtn.innerHTML = '<i class="bi bi-eye-slash me-1"></i>Hide Debug Info';
      updateDebugInfo();
    } else {
      debugSection.style.display = 'none';
      debugToggleBtn.innerHTML = '<i class="bi bi-bug me-1"></i>Show Debug Info';
    }
  } catch (error) {
    console.error('Error toggling debug section:', error);
  }
}

// Auto-update debug info when messages change
const originalUpdateUI = MessageManager.prototype.updateUI;
MessageManager.prototype.updateUI = function() {
  originalUpdateUI.call(this);
  updateDebugInfo();
};

// ============================
// PAGE INITIALIZATION! 🚀
// ============================
document.addEventListener('DOMContentLoaded', function() {
  try {
    // Check page type and initialize accordingly
    if (window.location.pathname.includes('auth.html')) {
      initializeAuth();
    } else {
      initializeDashboard();
    }
  } catch (error) {
    console.error('❌ Initialization error:', error);
    
    // Fallback to login on error
    if (!window.location.pathname.includes('auth.html')) {
      window.location.href = 'auth.html';
    }
  }
});

// Session timeout check
setInterval(() => {
  if (adminAuth && adminAuth.checkAuth) {
    adminAuth.checkAuth();
  }
}, 60000); // Check every minute