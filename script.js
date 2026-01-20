// CONFIGURATION
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_KEY = 'your-anon-key';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// DOM ELEMENTS
const contentArea = document.getElementById('contentArea');
const imageGrid = document.getElementById('imageGrid');
const tagCloud = document.getElementById('tagCloud');
const authModal = document.getElementById('authModal');
const displayUsername = document.getElementById('displayUsername');

let currentUser = localStorage.getItem('aero_user') || null;

// INITIALIZE
window.onload = () => {
    if (!currentUser) {
        authModal.classList.remove('hidden');
    } else {
        displayUsername.innerText = currentUser;
    }
    loadPosts();
    loadTags();
    setupRealtimeChat();
};

// --- CORE FUNCTIONS ---

async function loadPosts() {
    let { data: posts, error } = await _supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return console.error(error);
    
    imageGrid.innerHTML = '';
    posts.forEach(post => {
        const card = document.createElement('div');
        card.className = 'post-card aero-glass p-2';
        card.innerHTML = `
            <img src="${post.file_url}" loading="lazy">
            <div class="p-2">
                <div class="text-[10px] text-blue-600 font-bold">${post.tags.join(', ')}</div>
                <div class="text-[9px] text-gray-500">By: ${post.author}</div>
            </div>
        `;
        imageGrid.appendChild(card);
    });
    document.getElementById('postCount').innerText = posts.length;
}

async function loadTags() {
    let { data: posts } = await _supabase.from('posts').select('tags');
    let counts = {};
    posts.forEach(p => p.tags.forEach(t => counts[t] = (counts[t] || 0) + 1));
    
    tagCloud.innerHTML = Object.entries(counts)
        .sort((a,b) => b[1] - a[1])
        .slice(0, 15)
        .map(([tag, count]) => `<span class="cursor-pointer hover:underline text-xs block" onclick="filterByTag('${tag}')">${tag} (${count})</span>`)
        .join('');
}

// Handle Profile Creation (Unique Name)
document.getElementById('saveProfile').onclick = async () => {
    const name = document.getElementById('newUsername').value.trim();
    if (name.length < 3) return alert("Too short!");

    // Check if name taken
    const { data } = await _supabase.from('profiles').select('*').eq('username', name);
    
    if (data.length > 0) {
        alert("This identity is already active in the network.");
    } else {
        await _supabase.from('profiles').insert([{ username: name }]);
        localStorage.setItem('aero_user', name);
        currentUser = name;
        displayUsername.innerText = name;
        authModal.classList.add('hidden');
    }
};

// Navigation Logic
window.showPage = (pageId) => {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.getElementById(pageId + 'Page').classList.remove('hidden');
};

// Upload Logic
document.getElementById('submitPost').onclick = async () => {
    const file = document.getElementById('fileInput').files[0];
    const tags = document.getElementById('tagInput').value.split(' ').map(t => t.trim());

    if (!file || !currentUser) return alert("Missing data!");

    const path = `public/${Date.now()}_${file.name}`;
    const { data: uploadData, error } = await _supabase.storage.from('forum-files').upload(path, file);

    if (error) return alert("Upload failed");

    const { data: { publicUrl } } = _supabase.storage.from('forum-files').getPublicUrl(path);

    await _supabase.from('posts').insert([
        { file_url: publicUrl, tags: tags, author: currentUser }
    ]);

    alert("Transmission complete.");
    location.reload();
};

// Real-time Chat
function setupRealtimeChat() {
    const channel = _supabase.channel('room1');
    
    channel.on('broadcast', { event: 'msg' }, ({ payload }) => {
        addMessageToUI(payload.user, payload.text);
    }).subscribe();

    document.getElementById('sendChat').onclick = () => {
        const text = document.getElementById('chatInput').value;
        channel.send({
            type: 'broadcast',
            event: 'msg',
            payload: { user: currentUser, text }
        });
        addMessageToUI('You', text);
        document.getElementById('chatInput').value = '';
    };
}

function addMessageToUI(user, text) {
    const log = document.getElementById('chatMessages');
    log.innerHTML += `<p><strong>${user}:</strong> ${text}</p>`;
    log.scrollTop = log.scrollHeight;
}
