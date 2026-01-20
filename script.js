/**
 * AEROBOORU - CORE ENGINE
 * Style: Frutiger Aero / Web 2.0
 * Backend: Supabase
 */

// --- INITIALIZATION ---
const SB_URL = 'https://gzwjqzyedpxlhgwknndl.supabase.co';
const SB_KEY = 'sb_publishable_r4jrV0e282f2TNc1QExFOQ_XuFxdHsC';
const _supabase = supabase.createClient(SB_URL, SB_KEY);

// State Management
let currentUser = localStorage.getItem('aero_username') || null;
let currentView = 'posts';
let activeTagFilter = '';

// --- CORE DOM ELEMENTS ---
const elements = {
    imageGrid: document.getElementById('imageGrid'),
    tagCloud: document.getElementById('tagCloud'),
    authModal: document.getElementById('authModal'),
    usernameDisplay: document.getElementById('displayUsername'),
    fileInput: document.getElementById('fileInput'),
    tagInput: document.getElementById('tagInput'),
    postCount: document.getElementById('postCount'),
    userCount: document.getElementById('userCount')
};

// --- STARTUP ---
window.addEventListener('DOMContentLoaded', () => {
    console.log("AeroBooru System Initialized...");
    checkUserSession();
    refreshUI();
    loadPosts();
    loadStats();
    
    // Auto-refresh stats every 60 seconds
    setInterval(loadStats, 60000);
});

// --- AUTHENTICATION & IDENTITY ---
function checkUserSession() {
    if (!currentUser) {
        elements.authModal.classList.remove('hidden');
    } else {
        elements.usernameDisplay.innerText = currentUser;
        elements.authModal.classList.add('hidden');
    }
}

async function registerIdentity() {
    const nameInput = document.getElementById('newUsername');
    const name = nameInput.value.trim().toLowerCase();

    if (name.length < 3) {
        alert("System Error: Identity string too short. Minimum 3 characters.");
        return;
    }

    // Check if username is taken in the 'profiles' table
    const { data, error } = await _supabase
        .from('profiles')
        .select('username')
        .eq('username', name);

    if (data && data.length > 0) {
        alert("Conflict: Identity already registered in the cloud.");
    } else {
        const { error: insertError } = await _supabase
            .from('profiles')
            .insert([{ username: name }]);

        if (insertError) {
            alert("Database Error: Could not register name.");
        } else {
            currentUser = name;
            localStorage.setItem('aero_username', name);
            checkUserSession();
            loadStats();
        }
    }
}

// --- BOORU LOGIC: POSTS & TAGS ---
async function loadPosts() {
    elements.imageGrid.innerHTML = '<div class="loading-spinner">Accessing Database...</div>';
    
    let query = _supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

    // Apply tag filtering if active
    if (activeTagFilter) {
        query = query.contains('tags', [activeTagFilter]);
    }

    const { data, error } = await query;

    if (error) {
        elements.imageGrid.innerHTML = '<p>Error loading transmission.</p>';
        return;
    }

    renderPosts(data);
    updateTagCloud(data);
}

function renderPosts(posts) {
    elements.imageGrid.innerHTML = '';
    
    if (posts.length === 0) {
        elements.imageGrid.innerHTML = '<p class="p-10 text-center italic">No data nodes found for this tag.</p>';
        return;
    }

    posts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'post-card aero-glass animate-fade-in';
        
        // Soybooru style: Small thumbnails that expand or link
        card.innerHTML = `
            <div class="glass-overlay"></div>
            <img src="${post.file_url}" alt="Aero Content" loading="lazy">
            <div class="post-info">
                <div class="tag-list">
                    ${post.tags.map(t => `<span class="tag-chip" onclick="filterByTag('${t}')">${t}</span>`).join('')}
                </div>
                <div class="post-meta">
                    <span>By: <strong>${post.author}</strong></span>
                    <span>${new Date(post.created_at).toLocaleDateString()}</span>
                </div>
            </div>
        `;
        elements.imageGrid.appendChild(card);
    });
}

async function updateTagCloud(posts) {
    // Generate a count of all tags currently in view
    const tagMap = {};
    posts.forEach(post => {
        post.tags.forEach(tag => {
            tagMap[tag] = (tagMap[tag] || 0) + 1;
        });
    });

    const sortedTags = Object.entries(tagMap).sort((a, b) => b[1] - a[1]);
    
    elements.tagCloud.innerHTML = sortedTags.map(([tag, count]) => `
        <div class="tag-item" onclick="filterByTag('${tag}')">
            <span class="tag-name">${tag}</span>
            <span class="tag-count">${count}</span>
        </div>
    `).join('');
}

function filterByTag(tag) {
    activeTagFilter = tag;
    document.getElementById('tagSearch').value = tag;
    loadPosts();
}

// --- UPLOAD SYSTEM ---
async function handleFileUpload() {
    const file = elements.fileInput.files[0];
    const rawTags = elements.tagInput.value;

    if (!file) return alert("Please select a file to transmit.");
    if (!currentUser) return alert("You must identify yourself first.");

    // Format tags: lowercase, unique, no weird chars
    const tags = rawTags.split(' ')
        .map(t => t.trim().toLowerCase())
        .filter(t => t !== "");

    // 1. Storage Upload
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { data: storageData, error: storageError } = await _supabase
        .storage
        .from('forum-files')
        .upload(filePath, file);

    if (storageError) {
        console.error(storageError);
        return alert("Critical Error: Storage transmission failed.");
    }

    // 2. Database Record
    const { data: { publicUrl } } = _supabase.storage.from('forum-files').getPublicUrl(filePath);

    const { error: dbError } = await _supabase
        .from('posts')
        .insert([{
            file_url: publicUrl,
            tags: tags,
            author: currentUser
        }]);

    if (dbError) {
        alert("Database Error: Record could not be saved.");
    } else {
        alert("Transmission Success!");
        window.location.reload();
    }
}

// --- UI & NAVIGATION ---
function showPage(pageId) {
    currentView = pageId;
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(`${pageId}Page`).classList.remove('hidden');
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function refreshUI() {
    // Set up button listeners
    const saveBtn = document.getElementById('saveProfile');
    if(saveBtn) saveBtn.onclick = registerIdentity;

    const submitBtn = document.getElementById('submitPost');
    if(submitBtn) submitBtn.onclick = handleFileUpload;

    const searchBtn = document.getElementById('searchBtn');
    if(searchBtn) searchBtn.onclick = () => filterByTag(document.getElementById('tagSearch').value);
}

async function loadStats() {
    const { count: postCount } = await _supabase.from('posts').select('*', { count: 'exact', head: true });
    const { count: userCount } = await _supabase.from('profiles').select('*', { count: 'exact', head: true });

    if (elements.postCount) elements.postCount.innerText = postCount || 0;
    if (elements.userCount) elements.userCount.innerText = userCount || 0;
}

// --- EVENT LISTENERS ---
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement.id === 'tagSearch') {
        filterByTag(document.getElementById('tagSearch').value);
    }
});
