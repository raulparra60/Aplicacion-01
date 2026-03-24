// Client status styling map
const statusColors = {
    lead: { text: "🌟 Prospecto", color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.2)" },
    active: { text: "🔥 Activo", color: "#10b981", bg: "rgba(16, 185, 129, 0.2)" },
    pending: { text: "⏳ En Pausa", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.2)" },
    completed: { text: "✅ Completado", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.2)" }
};

// Initial state
let clients = JSON.parse(localStorage.getItem('clients')) || [];
let currentEditingId = null;
let currentFilter = 'all';

// DOM Elements
const form = document.getElementById('add-client-form');
const clientsGrid = document.getElementById('clients-grid');
const emptyState = document.getElementById('empty-state');
const filterBtns = document.querySelectorAll('.filter-btn');

const modal = document.getElementById('edit-modal');
const closeModalBtn = document.querySelector('.close-modal');
const modalClientName = document.getElementById('modal-client-name');
const statusBtns = document.querySelectorAll('.status-btn');
const deleteBtn = document.getElementById('delete-client-btn');

// Initialize app
function init() {
    renderClients();
    setupEventListeners();
}

// Generate unique ID for clients
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Save to localStorage
function saveClients() {
    localStorage.setItem('clients', JSON.stringify(clients));
}

// Add new client
function addClient(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const status = document.getElementById('status').value;
    
    const newClient = {
        id: generateId(),
        name,
        email,
        phone,
        status,
        createdAt: new Date().toISOString()
    };
    
    clients.push(newClient);
    saveClients();
    renderClients();
    
    // Reset form
    form.reset();
    
    // Add success animation to button
    const btn = form.querySelector('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span>¡Añadido!</span> <i class="fa-solid fa-check"></i>';
    btn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
    }, 2000);
}

// Render clients to grid
function renderClients() {
    clientsGrid.innerHTML = '';
    
    const filteredClients = currentFilter === 'all' 
        ? clients 
        : clients.filter(c => c.status === currentFilter);
        
    if (filteredClients.length === 0) {
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';
        
        filteredClients.forEach((client, index) => {
            const statusConfig = statusColors[client.status];
            
            const card = document.createElement('div');
            card.className = 'client-card';
            card.style.setProperty('--status-color', statusConfig.color);
            card.style.animationDelay = `${index * 0.05}s`;
            
            card.innerHTML = `
                <div class="card-header">
                    <div class="client-name">${client.name}</div>
                </div>
                <div class="client-contact">
                    <div class="contact-item">
                        <i class="fa-solid fa-envelope"></i> ${client.email}
                    </div>
                    ${client.phone ? `
                    <div class="contact-item">
                        <i class="fa-solid fa-phone"></i> ${client.phone}
                    </div>
                    ` : ''}
                </div>
                <button class="status-badge" 
                    style="--status-bg: ${statusConfig.bg}; --status-text: ${statusConfig.color};"
                    data-id="${client.id}">
                    ${statusConfig.text} <i class="fa-solid fa-pen" style="margin-left: 6px; font-size: 0.7em;"></i>
                </button>
            `;
            
            clientsGrid.appendChild(card);
        });
    }
}

// Open modal to edit status
function openModal(id) {
    const client = clients.find(c => c.id === id);
    if (!client) return;
    
    currentEditingId = id;
    modalClientName.textContent = client.name;
    
    // Highlight current status
    statusBtns.forEach(btn => {
        if (btn.dataset.value === client.status) {
            btn.style.borderColor = statusColors[client.status].color;
            btn.style.background = 'rgba(255,255,255,0.1)';
        } else {
            btn.style.borderColor = '';
            btn.style.background = '';
        }
    });
    
    modal.classList.add('active');
}

// Close modal
function closeModal() {
    modal.classList.remove('active');
    setTimeout(() => { currentEditingId = null; }, 300);
}

// Update client status
function updateStatus(newStatus) {
    if (!currentEditingId) return;
    
    const clientIndex = clients.findIndex(c => c.id === currentEditingId);
    if (clientIndex !== -1) {
        clients[clientIndex].status = newStatus;
        saveClients();
        renderClients();
    }
    
    closeModal();
}

// Delete client
function deleteClient() {
    if (!currentEditingId) return;
    
    if (confirm('¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.')) {
        clients = clients.filter(c => c.id !== currentEditingId);
        saveClients();
        renderClients();
        closeModal();
    }
}

// Set up all event listeners
function setupEventListeners() {
    form.addEventListener('submit', addClient);
    
    clientsGrid.addEventListener('click', (e) => {
        const badge = e.target.closest('.status-badge');
        if (badge) {
            openModal(badge.dataset.id);
        }
    });
    
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    statusBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            updateStatus(btn.dataset.value);
        });
    });
    
    deleteBtn.addEventListener('click', deleteClient);
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderClients();
        });
    });
}

// Initialize application
init();
