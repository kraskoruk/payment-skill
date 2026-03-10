/**
 * Payment Skill Dashboard - JavaScript API Client
 * 
 * Connects dashboard UI to backend API
 */

const API_BASE = '';

// Utility functions
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 6px;
        color: white;
        font-size: 12px;
        z-index: 10000;
        background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#dc2626' : '#3b82f6'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

async function apiGet(endpoint) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showNotification(`Error: ${error.message}`, 'error');
        throw error;
    }
}

async function apiPost(endpoint, data) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        showNotification(result.message || 'Success');
        return result;
    } catch (error) {
        console.error('API Error:', error);
        showNotification(`Error: ${error.message}`, 'error');
        throw error;
    }
}

// Load all limits and controls
async function loadLimits() {
    try {
        const data = await apiGet('/api/limits');
        
        // Update Account Limits
        if (data.limits) {
            document.getElementById('per-transaction-limit').value = data.limits.perTransaction || '';
            document.getElementById('daily-limit').value = data.limits.daily || '';
            document.getElementById('weekly-limit').value = data.limits.weekly || '';
            document.getElementById('monthly-limit').value = data.limits.monthly || '';
            document.getElementById('hourly-limit').value = data.limits.maxTransactionsPerHour || '';
        }
        
        // Update Time Window
        if (data.timeWindow) {
            document.getElementById('time-window-enabled').checked = data.timeWindow.enabled;
            document.getElementById('start-time').value = data.timeWindow.start || '08:00';
            document.getElementById('end-time').value = data.timeWindow.end || '22:00';
            document.getElementById('timezone').value = data.timeWindow.timezone || 'Europe/Bucharest';
        }
        
        // Update Cumulative Budgets
        if (data.cumulativeBudgets) {
            updateBudgetsList(data.cumulativeBudgets);
        }
        
        // Update Domain Controls
        if (data.domainControls) {
            document.getElementById('domain-mode').value = data.domainControls.mode || 'blacklist';
            updateDomainsList(data.domainControls.domains || [], data.domainControls.mode || 'blacklist');
        }
        
        // Update Geography Controls
        if (data.geographyControls) {
            document.getElementById('geo-enabled').checked = data.geographyControls.enabled;
            document.getElementById('geo-mode').value = data.geographyControls.mode || 'allow';
            updateCountriesList(data.geographyControls.countries || []);
        }
        
        // Update Category Controls
        if (data.categoryControls) {
            updateBlockedCategories(data.categoryControls.blockedCategories || []);
            updateAllowedCategories(data.categoryControls.allowedCategories || []);
        }
        
    } catch (error) {
        console.error('Failed to load limits:', error);
    }
}

// Save Account Limits
async function saveAccountLimits() {
    const limits = {
        perTransaction: parseInt(document.getElementById('per-transaction-limit').value) || 0,
        daily: parseInt(document.getElementById('daily-limit').value) || 0,
        weekly: parseInt(document.getElementById('weekly-limit').value) || 0,
        monthly: parseInt(document.getElementById('monthly-limit').value) || 0,
        maxTransactionsPerHour: parseInt(document.getElementById('hourly-limit').value) || 0
    };
    
    await apiPost('/api/limits', limits);
}

// Save Time Window
async function saveTimeWindow() {
    const timeWindow = {
        enabled: document.getElementById('time-window-enabled').checked,
        start: document.getElementById('start-time').value,
        end: document.getElementById('end-time').value,
        timezone: document.getElementById('timezone').value
    };
    
    await apiPost('/api/limits/time-window', timeWindow);
}

// Budget Management
let budgets = [];

function updateBudgetsList(budgetsList) {
    budgets = budgetsList;
    const container = document.getElementById('budgets-list');
    if (!container) return;
    
    container.innerHTML = budgets.map((b, i) => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; background: var(--bg-primary); border-radius: 4px; margin-bottom: 5px;">
            <span>${b.amount} ${b.currency || ''} per ${b.period}</span>
            <button onclick="removeBudget(${i})" style="background: #dc2626; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 10px;">Remove</button>
        </div>
    `).join('');
}

async function addBudget() {
    const amount = parseFloat(document.getElementById('budget-amount').value);
    const currency = document.getElementById('budget-currency').value || 'EUR';
    const period = document.getElementById('budget-period').value;
    
    if (!amount || !period) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    await apiPost('/api/limits/budgets', { amount, currency, period, enabled: true });
    document.getElementById('budget-amount').value = '';
    await loadLimits();
}

async function removeBudget(index) {
    try {
        const response = await fetch(`${API_BASE}/api/limits/budgets/${index}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to remove budget');
        showNotification('Budget removed');
        await loadLimits();
    } catch (error) {
        showNotification('Error removing budget', 'error');
    }
}

// Domain Management
let domains = [];
let domainMode = 'blacklist';

function updateDomainsList(domainList, mode = 'blacklist') {
    domains = domainList;
    domainMode = mode;
    const container = document.getElementById('domains-list');
    if (!container) return;
    
    console.log('Domain mode:', domainMode, 'Domains:', domains);
    
    if (domains.length === 0) {
        container.innerHTML = '<span style="color: var(--text-secondary); font-size: 10px;">No domains configured</span>';
        return;
    }
    
    container.innerHTML = domains.map(d => {
        // Color based on mode
        let bgColor, textColor, borderColor;
        if (domainMode === 'whitelist') {
            // Whitelist mode: domains in list are ALLOWED (green)
            bgColor = 'rgba(34, 197, 94, 0.2)';
            textColor = '#22c55e';
            borderColor = '#22c55e';
        } else {
            // Blacklist mode: domains in list are BLOCKED (red)
            bgColor = 'rgba(220, 38, 38, 0.2)';
            textColor = '#ef4444';
            borderColor = '#dc2626';
        }
        
        return `
        <span style="background: ${bgColor}; color: ${textColor}; border: 1px solid ${borderColor}; padding: 3px 8px; border-radius: 3px; font-size: 10px; display: inline-flex; align-items: center; gap: 5px; margin: 2px;">
            ${d}
            <button onclick="removeDomain('${d}')" style="background: none; border: none; color: ${textColor}; cursor: pointer; font-size: 12px; padding: 0;">×</button>
        </span>
    `}).join('');
}

async function addDomain() {
    const domain = document.getElementById('new-domain').value.trim();
    if (!domain) return;
    
    const result = await apiPost('/api/limits/domains', { domain });
    document.getElementById('new-domain').value = '';
    
    // Use returned controls to ensure correct mode
    if (result.controls) {
        updateDomainsList(result.controls.domains || [], result.controls.mode || 'blacklist');
    } else {
        await loadLimits();
    }
}

async function removeDomain(domain) {
    try {
        const response = await fetch(`${API_BASE}/api/limits/domains/${encodeURIComponent(domain)}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to remove domain');
        const result = await response.json();
        showNotification('Domain removed');
        
        // Use returned controls to ensure correct mode
        if (result.controls) {
            updateDomainsList(result.controls.domains || [], result.controls.mode || 'blacklist');
        } else {
            await loadLimits();
        }
    } catch (error) {
        showNotification('Error removing domain', 'error');
    }
}

async function saveDomainMode() {
    const mode = document.getElementById('domain-mode').value;
    console.log('Saving domain mode:', mode);
    await apiPost('/api/limits/domains', { mode });
    await loadLimits(); // Reload to update colors
}

// Geography Management
let countries = [];

function updateCountriesList(countryList) {
    countries = countryList;
    const container = document.getElementById('countries-list');
    if (!container) return;
    
    container.innerHTML = countries.map(c => `
        <span style="background: rgba(34, 197, 94, 0.2); color: #22c55e; padding: 3px 8px; border-radius: 3px; font-size: 10px; display: inline-flex; align-items: center; gap: 5px; margin: 2px;">
            ${c}
            <button onclick="removeCountry('${c}')" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 12px; padding: 0;">×</button>
        </span>
    `).join('');
}

async function addCountry() {
    const country = document.getElementById('new-country').value.trim().toUpperCase();
    if (!country) return;
    
    await apiPost('/api/limits/geo', { country });
    document.getElementById('new-country').value = '';
    await loadLimits();
}

async function removeCountry(country) {
    try {
        const response = await fetch(`${API_BASE}/api/limits/geo/${country}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to remove country');
        showNotification('Country removed');
        await loadLimits();
    } catch (error) {
        showNotification('Error removing country', 'error');
    }
}

async function saveGeoSettings() {
    const enabled = document.getElementById('geo-enabled').checked;
    const mode = document.getElementById('geo-mode').value;
    await apiPost('/api/limits/geo', { enabled, mode });
}

// Category Management
function updateBlockedCategories(categories) {
    const container = document.getElementById('blocked-categories-list');
    if (!container) return;
    
    container.innerHTML = categories.map(c => `
        <span style="background: rgba(220, 38, 38, 0.2); color: #ef4444; padding: 3px 8px; border-radius: 3px; font-size: 10px; display: inline-flex; align-items: center; gap: 5px; margin: 2px;">
            ${c}
            <button onclick="unblockCategory('${c}')" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 12px; padding: 0;">×</button>
        </span>
    `).join('');
}

function updateAllowedCategories(categories) {
    const container = document.getElementById('allowed-categories-list');
    if (!container) return;
    
    container.innerHTML = categories.map(c => `
        <span style="background: rgba(34, 197, 94, 0.2); color: #22c55e; padding: 3px 8px; border-radius: 3px; font-size: 10px; display: inline-flex; align-items: center; gap: 5px; margin: 2px;">
            ${c}
            <button onclick="disallowCategory('${c}')" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 12px; padding: 0;">×</button>
        </span>
    `).join('');
}

async function blockCategory() {
    const category = document.getElementById('new-blocked-category').value.trim();
    if (!category) return;
    
    await apiPost('/api/limits/categories/block', { category });
    document.getElementById('new-blocked-category').value = '';
    await loadLimits();
}

async function unblockCategory(category) {
    await apiPost('/api/limits/categories/unblock', { category });
    await loadLimits();
}

async function allowCategory() {
    const category = document.getElementById('new-allowed-category').value.trim();
    if (!category) return;
    
    await apiPost('/api/limits/categories/allow', { category });
    document.getElementById('new-allowed-category').value = '';
    await loadLimits();
}

async function disallowCategory(category) {
    await apiPost('/api/limits/categories/disallow', { category });
    await loadLimits();
}

// Emergency Stop
async function toggleEmergencyStop() {
    const btn = document.getElementById('emergency-btn');
    const isActive = btn.classList.contains('active');
    
    if (!isActive) {
        // Activate
        if (!confirm('Are you sure you want to activate EMERGENCY STOP? This will halt all transactions.')) {
            return;
        }
        await apiPost('/api/emergency/stop', { reason: 'Dashboard activation' });
        btn.classList.add('active');
        btn.textContent = '🔴 Emergency Stop ACTIVE - Click to Resume';
        showNotification('Emergency stop activated', 'error');
    } else {
        // Deactivate
        await apiPost('/api/emergency/resume', {});
        btn.classList.remove('active');
        btn.textContent = '🔴 Emergency Stop';
        showNotification('Emergency stop deactivated');
    }
}

// Load emergency stop status
async function loadEmergencyStatus() {
    try {
        const data = await apiGet('/api/emergency');
        const btn = document.getElementById('emergency-btn');
        if (data.active) {
            btn.classList.add('active');
            btn.textContent = '🔴 Emergency Stop ACTIVE - Click to Resume';
        }
    } catch (error) {
        console.error('Failed to load emergency status:', error);
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadLimits();
    loadEmergencyStatus();
    
    // Set up emergency button
    const emergencyBtn = document.getElementById('emergency-btn');
    if (emergencyBtn) {
        emergencyBtn.addEventListener('click', toggleEmergencyStop);
    }
});