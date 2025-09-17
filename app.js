// Application Data
const appData = {
  "complianceChecks": [
    {
      "id": "1",
      "checkType": "SOC 2",
      "checkName": "Access Control Review",
      "area": "IT Security", 
      "owner": "John Smith",
      "spoc": "Jane Doe",
      "taskStatus": "Active",
      "status": "Pending",
      "team": "IT",
      "automate": true,
      "repetition": "Quarterly",
      "collectionRemarks": "Collect AD reports and access reviews",
      "spocComments": "Focus on privileged accounts"
    },
    {
      "id": "2", 
      "checkType": "SOC 2",
      "checkName": "Data Backup Verification",
      "area": "IT Operations",
      "owner": "Mike Johnson", 
      "spoc": "Sarah Wilson",
      "taskStatus": "Active",
      "status": "In Progress", 
      "team": "IT",
      "automate": false,
      "repetition": "Monthly",
      "collectionRemarks": "Verify backup logs and test restores",
      "spocComments": "Include offsite backup validation"
    },
    {
      "id": "3",
      "checkType": "GDPR",
      "checkName": "Data Processing Inventory",
      "area": "Privacy",
      "owner": "Lisa Chen",
      "spoc": "David Brown", 
      "taskStatus": "Active",
      "status": "Completed",
      "team": "Legal",
      "automate": true,
      "repetition": "Annually",
      "collectionRemarks": "Document all data processing activities",
      "spocComments": "Update privacy impact assessments"
    },
    {
      "id": "4",
      "checkType": "ISO 27001", 
      "checkName": "Incident Response Testing",
      "area": "Security",
      "owner": "Alex Rodriguez",
      "spoc": "Emily Davis",
      "taskStatus": "Active", 
      "status": "Pending",
      "team": "Security",
      "automate": false,
      "repetition": "Semi-annually", 
      "collectionRemarks": "Test incident response procedures",
      "spocComments": "Include tabletop exercises"
    },
    {
      "id": "5",
      "checkType": "PCI DSS",
      "checkName": "Network Segmentation Review", 
      "area": "Network Security",
      "owner": "Tom Anderson",
      "spoc": "Jennifer Lee",
      "taskStatus": "Active",
      "status": "Approved", 
      "team": "Network",
      "automate": true,
      "repetition": "Quarterly",
      "collectionRemarks": "Validate network segmentation controls",
      "spocComments": "Test firewall rules and VLANs"
    }
  ],
  "evidenceSessions": [
    {
      "id": "session-1",
      "selectedChecks": ["1", "2"],
      "status": "collecting", 
      "createdAt": "2025-09-17T10:00:00Z",
      "estimatedTime": "15 minutes",
      "progressSteps": [
        {
          "step": 1,
          "title": "Initializing evidence collection",
          "status": "completed", 
          "message": "Session created successfully",
          "timestamp": "2025-09-17T10:00:30Z"
        },
        {
          "step": 2,
          "title": "Accessing Google Drive",
          "status": "completed",
          "message": "Connected to Google Drive API",
          "timestamp": "2025-09-17T10:01:00Z" 
        },
        {
          "step": 3,
          "title": "Searching for Access Control reports",
          "status": "in_progress",
          "message": "Scanning /IT Compliance/Access Control/ folder...",
          "timestamp": "2025-09-17T10:01:30Z"
        },
        {
          "step": 4, 
          "title": "Collecting backup verification logs",
          "status": "pending",
          "message": "Waiting for previous step to complete",
          "timestamp": null
        }
      ]
    }
  ],
  "evidenceItems": [
    {
      "id": "evidence-1",
      "sessionId": "session-1", 
      "checkId": "1",
      "evidenceType": "google_drive_file",
      "fileName": "AD_User_Report_2025-09_FINAL.xlsx",
      "sourcePath": "/IT Compliance/Access Control/AD_User_Report_2025-09_FINAL.xlsx",
      "fileSize": "2.3 MB",
      "collectedAt": "2025-09-17T10:02:00Z",
      "status": "collected",
      "approvalNotes": "",
      "metadata": {
        "lastModified": "2025-09-15T08:30:00Z",
        "createdBy": "system@company.com",
        "userCount": 2450
      }
    }
  ],
  "llmProviders": [
    {
      "id": "openai",
      "name": "OpenAI GPT-4",
      "type": "paid",
      "status": "available",
      "models": ["gpt-4o", "gpt-4o-mini"],
      "costPerToken": 0.00001
    },
    {
      "id": "anthropic", 
      "name": "Anthropic Claude",
      "type": "paid",
      "status": "available", 
      "models": ["claude-3-5-sonnet-latest", "claude-3-5-haiku-latest"],
      "costPerToken": 0.000008
    },
    {
      "id": "groq",
      "name": "Groq Llama",
      "type": "paid", 
      "status": "available",
      "models": ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"], 
      "costPerToken": 0.000001
    },
    {
      "id": "ollama",
      "name": "Ollama (Local)",
      "type": "free",
      "status": "available",
      "models": ["llama3.1:8b", "mistral:7b", "codellama:13b"],
      "costPerToken": 0
    }
  ],
  "chatMessages": [
    {
      "id": "msg-1",
      "sessionId": "session-1", 
      "sender": "user",
      "message": "Can you check the backup folder instead of the main compliance folder?",
      "timestamp": "2025-09-17T10:02:30Z"
    },
    {
      "id": "msg-2",
      "sessionId": "session-1",
      "sender": "ai", 
      "message": "I'll switch to checking the backup folder. Let me update the search path to /IT Compliance/Backups/ and look for the same file patterns there.",
      "timestamp": "2025-09-17T10:02:45Z"
    }
  ]
};

// Application State
let appState = {
  currentPage: 'dashboard',
  selectedChecks: new Set(),
  activeSession: null,
  filteredChecks: [...appData.complianceChecks],
  selectedEvidence: new Set()
};

// Utility Functions
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

function getStatusBadgeClass(status) {
  switch(status.toLowerCase()) {
    case 'pending': return 'status-badge--pending';
    case 'in progress': return 'status-badge--progress';
    case 'completed': return 'status-badge--completed';
    case 'approved': return 'status-badge--approved';
    default: return 'status-badge--pending';
  }
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// Navigation
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const targetPage = link.dataset.page;
      switchPage(targetPage);
      
      // Update active nav state
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

function switchPage(pageId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // Show target page
  document.getElementById(pageId + '-page').classList.add('active');
  appState.currentPage = pageId;
  
  // Initialize page-specific content
  switch(pageId) {
    case 'dashboard':
      renderComplianceTable();
      break;
    case 'active-sessions':
      initActiveSession();
      break;
    case 'evidence-library':
      renderEvidenceLibrary();
      break;
  }
}

// Dashboard Functions
function renderComplianceTable() {
  const tbody = document.getElementById('compliance-table-body');
  tbody.innerHTML = '';
  
  appState.filteredChecks.forEach(check => {
    const row = document.createElement('tr');
    if (appState.selectedChecks.has(check.id)) {
      row.classList.add('selected');
    }
    
    row.innerHTML = `
      <td><input type="checkbox" data-check-id="${check.id}" ${appState.selectedChecks.has(check.id) ? 'checked' : ''}></td>
      <td>${check.checkType}</td>
      <td>${check.checkName}</td>
      <td>${check.area}</td>
      <td>${check.owner}</td>
      <td>${check.spoc}</td>
      <td>${check.taskStatus}</td>
      <td><span class="status-badge ${getStatusBadgeClass(check.status)}">${check.status}</span></td>
      <td>${check.team}</td>
      <td><span class="automate-badge ${check.automate ? 'automate-badge--yes' : 'automate-badge--no'}">${check.automate ? 'Yes' : 'No'}</span></td>
      <td>${check.repetition}</td>
    `;
    
    tbody.appendChild(row);
  });
  
  updateStartCollectionButton();
}

function initTableFilters() {
  const searchFilter = document.getElementById('search-filter');
  const teamFilter = document.getElementById('team-filter');
  const statusFilter = document.getElementById('status-filter');
  const areaFilter = document.getElementById('area-filter');
  
  [searchFilter, teamFilter, statusFilter, areaFilter].forEach(filter => {
    filter.addEventListener('input', applyFilters);
  });
}

function applyFilters() {
  const searchTerm = document.getElementById('search-filter').value.toLowerCase();
  const teamFilter = document.getElementById('team-filter').value;
  const statusFilter = document.getElementById('status-filter').value;
  const areaFilter = document.getElementById('area-filter').value;
  
  appState.filteredChecks = appData.complianceChecks.filter(check => {
    const matchesSearch = !searchTerm || 
      check.checkName.toLowerCase().includes(searchTerm) ||
      check.checkType.toLowerCase().includes(searchTerm);
    const matchesTeam = !teamFilter || check.team === teamFilter;
    const matchesStatus = !statusFilter || check.status === statusFilter;
    const matchesArea = !areaFilter || check.area === areaFilter;
    
    return matchesSearch && matchesTeam && matchesStatus && matchesArea;
  });
  
  renderComplianceTable();
}

function initCheckboxes() {
  document.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox') {
      if (e.target.id === 'select-all') {
        const checkboxes = document.querySelectorAll('input[data-check-id]');
        checkboxes.forEach(cb => {
          cb.checked = e.target.checked;
          if (e.target.checked) {
            appState.selectedChecks.add(cb.dataset.checkId);
          } else {
            appState.selectedChecks.delete(cb.dataset.checkId);
          }
        });
        renderComplianceTable();
      } else if (e.target.dataset.checkId) {
        if (e.target.checked) {
          appState.selectedChecks.add(e.target.dataset.checkId);
        } else {
          appState.selectedChecks.delete(e.target.dataset.checkId);
        }
        updateStartCollectionButton();
        e.target.closest('tr').classList.toggle('selected', e.target.checked);
      }
    }
  });
}

function updateStartCollectionButton() {
  const button = document.getElementById('start-collection-btn');
  button.disabled = appState.selectedChecks.size === 0;
}

function initStartCollection() {
  document.getElementById('start-collection-btn').addEventListener('click', () => {
    if (appState.selectedChecks.size > 0) {
      startEvidenceCollection();
      switchPage('active-sessions');
      document.querySelector('[data-page="active-sessions"]').classList.add('active');
      document.querySelector('[data-page="dashboard"]').classList.remove('active');
    }
  });
}

// Active Sessions Functions
function startEvidenceCollection() {
  const sessionId = 'session-' + Date.now();
  appState.activeSession = {
    id: sessionId,
    selectedChecks: Array.from(appState.selectedChecks),
    status: 'collecting',
    createdAt: new Date().toISOString(),
    estimatedTime: Math.ceil(appState.selectedChecks.size * 5) + ' minutes',
    progressSteps: [
      {
        step: 1,
        title: 'Initializing evidence collection',
        status: 'completed',
        message: 'Session created successfully',
        timestamp: new Date().toISOString()
      }
    ]
  };
  
  showToast('Evidence collection session started', 'success');
}

function initActiveSession() {
  if (!appState.activeSession && appData.evidenceSessions.length > 0) {
    appState.activeSession = appData.evidenceSessions[0];
    appState.selectedChecks = new Set(appState.activeSession.selectedChecks);
  }
  
  if (appState.activeSession) {
    updateSessionInfo();
    renderProgressSteps();
    renderChatMessages();
    simulateProgress();
  }
}

function updateSessionInfo() {
  document.getElementById('selected-checks-count').textContent = appState.selectedChecks.size;
  document.getElementById('estimated-time').textContent = appState.activeSession?.estimatedTime || '0 minutes';
}

function renderProgressSteps() {
  if (!appState.activeSession) return;
  
  const container = document.getElementById('steps-container');
  container.innerHTML = '';
  
  appState.activeSession.progressSteps.forEach(step => {
    const stepElement = document.createElement('div');
    stepElement.className = 'step-item';
    
    const iconContent = getStepIcon(step.status);
    
    stepElement.innerHTML = `
      <div class="step-icon step-icon--${step.status}">${iconContent}</div>
      <div class="step-content">
        <div class="step-title">Step ${step.step}: ${step.title}</div>
        <div class="step-message">${step.message}</div>
        ${step.timestamp ? `<div class="step-timestamp">${formatDate(step.timestamp)}</div>` : ''}
      </div>
    `;
    
    container.appendChild(stepElement);
  });
  
  updateOverallProgress();
}

function getStepIcon(status) {
  switch(status) {
    case 'completed': return '✅';
    case 'in_progress': return '🔍';
    case 'pending': return '⏳';
    case 'error': return '❌';
    default: return '❓';
  }
}

function updateOverallProgress() {
  if (!appState.activeSession) return;
  
  const completedSteps = appState.activeSession.progressSteps.filter(s => s.status === 'completed').length;
  const totalSteps = appState.activeSession.progressSteps.length;
  const percentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  
  document.getElementById('overall-progress').style.width = percentage + '%';
  document.getElementById('overall-progress-text').textContent = Math.round(percentage) + '% Complete';
}

function simulateProgress() {
  if (!appState.activeSession || appState.activeSession.status === 'completed') return;
  
  setTimeout(() => {
    const currentSteps = appState.activeSession.progressSteps;
    const inProgressIndex = currentSteps.findIndex(s => s.status === 'in_progress');
    
    if (inProgressIndex >= 0) {
      // Complete current step
      currentSteps[inProgressIndex].status = 'completed';
      currentSteps[inProgressIndex].message = 'Step completed successfully';
      currentSteps[inProgressIndex].timestamp = new Date().toISOString();
      
      // Start next step if available
      const nextIndex = inProgressIndex + 1;
      if (nextIndex < currentSteps.length) {
        currentSteps[nextIndex].status = 'in_progress';
        currentSteps[nextIndex].message = 'Processing...';
        currentSteps[nextIndex].timestamp = new Date().toISOString();
        
        // Add AI message
        addAIMessage(`Started ${currentSteps[nextIndex].title.toLowerCase()}`);
      } else {
        appState.activeSession.status = 'completed';
        addAIMessage('Evidence collection completed successfully!');
        showToast('Evidence collection completed', 'success');
      }
      
      renderProgressSteps();
      
      // Continue simulation
      if (appState.activeSession.status !== 'completed') {
        simulateProgress();
      }
    }
  }, 3000 + Math.random() * 2000); // 3-5 second intervals
}

// Chat Functions
function renderChatMessages() {
  const container = document.getElementById('chat-messages');
  container.innerHTML = '';
  
  const messages = [...appData.chatMessages];
  if (appState.activeSession) {
    // Add session-specific messages
    messages.push({
      id: 'welcome',
      sender: 'ai',
      message: 'Hello! I\'m starting the evidence collection process. You can ask me questions or provide guidance as I work.',
      timestamp: appState.activeSession.createdAt
    });
  }
  
  messages.forEach(message => {
    const messageElement = document.createElement('div');
    messageElement.className = `chat-message chat-message--${message.sender}`;
    messageElement.textContent = message.message;
    container.appendChild(messageElement);
  });
  
  container.scrollTop = container.scrollHeight;
}

function addAIMessage(text) {
  const container = document.getElementById('chat-messages');
  const messageElement = document.createElement('div');
  messageElement.className = 'chat-message chat-message--ai';
  messageElement.textContent = text;
  container.appendChild(messageElement);
  container.scrollTop = container.scrollHeight;
}

function addUserMessage(text) {
  const container = document.getElementById('chat-messages');
  const messageElement = document.createElement('div');
  messageElement.className = 'chat-message chat-message--user';
  messageElement.textContent = text;
  container.appendChild(messageElement);
  container.scrollTop = container.scrollHeight;
}

function initChatInput() {
  const input = document.getElementById('chat-input-field');
  const sendBtn = document.getElementById('send-chat-btn');
  
  function sendMessage() {
    const message = input.value.trim();
    if (message) {
      addUserMessage(message);
      input.value = '';
      
      // Simulate AI response
      setTimeout(() => {
        const responses = [
          "I understand. Let me adjust the collection process accordingly.",
          "Good suggestion! I'll incorporate that into the current step.",
          "Thanks for the feedback. I'll modify my approach.",
          "I'll take that into account as I continue collecting evidence."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addAIMessage(randomResponse);
      }, 1000 + Math.random() * 2000);
    }
  }
  
  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  });
}

function initChatControls() {
  document.getElementById('pause-btn').addEventListener('click', () => {
    showToast('Collection paused', 'info');
    addAIMessage('Collection paused. Click resume when ready to continue.');
  });
  
  document.getElementById('skip-btn').addEventListener('click', () => {
    showToast('Step skipped', 'info');
    addAIMessage('Skipping current step and moving to the next one.');
  });
}

// Evidence Library Functions
function renderEvidenceLibrary() {
  const container = document.getElementById('evidence-grid');
  container.innerHTML = '';
  
  appData.evidenceItems.forEach(item => {
    const evidenceElement = document.createElement('div');
    evidenceElement.className = 'evidence-item';
    if (appState.selectedEvidence.has(item.id)) {
      evidenceElement.classList.add('selected');
    }
    
    evidenceElement.innerHTML = `
      <input type="checkbox" data-evidence-id="${item.id}" ${appState.selectedEvidence.has(item.id) ? 'checked' : ''} style="position: absolute; top: 12px; right: 12px;">
      <div class="evidence-header">
        <div class="evidence-icon">📄</div>
        <div class="evidence-info">
          <div class="evidence-name">${item.fileName}</div>
          <div class="evidence-source">${item.sourcePath}</div>
        </div>
      </div>
      <div class="evidence-metadata">
        <span>${item.fileSize}</span>
        <span>${formatDate(item.collectedAt)}</span>
      </div>
      <div class="evidence-actions">
        <button class="btn btn--sm btn--primary" onclick="approveEvidence('${item.id}')">Approve</button>
        <button class="btn btn--sm btn--secondary" onclick="rejectEvidence('${item.id}')">Reject</button>
      </div>
    `;
    
    evidenceElement.addEventListener('click', (e) => {
      if (e.target.type !== 'checkbox' && e.target.tagName !== 'BUTTON') {
        const checkbox = evidenceElement.querySelector('input[type="checkbox"]');
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change'));
      }
    });
    
    container.appendChild(evidenceElement);
  });
}

function approveEvidence(evidenceId) {
  showToast('Evidence approved', 'success');
  const item = appData.evidenceItems.find(e => e.id === evidenceId);
  if (item) {
    item.status = 'approved';
  }
}

function rejectEvidence(evidenceId) {
  showToast('Evidence rejected', 'info');
  const item = appData.evidenceItems.find(e => e.id === evidenceId);
  if (item) {
    item.status = 'rejected';
  }
}

function initEvidenceControls() {
  document.addEventListener('change', (e) => {
    if (e.target.dataset.evidenceId) {
      if (e.target.checked) {
        appState.selectedEvidence.add(e.target.dataset.evidenceId);
        e.target.closest('.evidence-item').classList.add('selected');
      } else {
        appState.selectedEvidence.delete(e.target.dataset.evidenceId);
        e.target.closest('.evidence-item').classList.remove('selected');
      }
    }
  });
  
  document.getElementById('batch-approve-btn').addEventListener('click', () => {
    if (appState.selectedEvidence.size > 0) {
      showToast(`${appState.selectedEvidence.size} evidence items approved`, 'success');
      appState.selectedEvidence.clear();
      renderEvidenceLibrary();
    }
  });
  
  document.getElementById('batch-reject-btn').addEventListener('click', () => {
    if (appState.selectedEvidence.size > 0) {
      showToast(`${appState.selectedEvidence.size} evidence items rejected`, 'info');
      appState.selectedEvidence.clear();
      renderEvidenceLibrary();
    }
  });
}

// Initialize Application
function initApp() {
  initNavigation();
  initTableFilters();
  initCheckboxes();
  initStartCollection();
  initChatInput();
  initChatControls();
  initEvidenceControls();
  
  // Render initial content
  renderComplianceTable();
  
  showToast('Compliance Hub loaded successfully', 'success');
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);