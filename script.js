// CONFIGURATION
const SUPABASE_URL = "https://ghcvqapshprauuitzycb.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_l8L1joeMuf4VyAU2V00h9A_CLcsheub";

// Initialize Lucide Icons
lucide.createIcons();

const dangerLevels = [
    { label: 'SAFE', color: 'text-green-400', desc: 'Wholesome results', hex: '#22c55e' },
    { label: 'EUCLID', color: 'text-yellow-400', desc: 'Slightly quirky', hex: '#eab308' },
    { label: 'KETER', color: 'text-orange-400', desc: 'Getting weird', hex: '#f97316' },
    { label: 'THAUMIEL', color: 'text-red-400', desc: 'Very edgy', hex: '#dc2626' },
    { label: 'APOLLYON', color: 'text-red-600', desc: 'Maximum chaos', hex: '#991b1b' }
];

const urlInput = document.getElementById('urlInput');
const dangerRange = document.getElementById('dangerRange');
const dangerLabel = document.getElementById('dangerLabel');
const dangerDesc = document.getElementById('dangerDesc');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultsArea = document.getElementById('resultsArea');
const scanlines = document.getElementById('scanlines');

// Setup Scanlines UI
for (let i = 0; i < 50; i++) {
    const line = document.createElement('div');
    line.className = 'scanline';
    scanlines.appendChild(line);
}

dangerRange.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    const level = dangerLevels[val];
    dangerLabel.textContent = level.label;
    dangerLabel.className = `text-2xl font-bold ${level.color}`;
    dangerDesc.textContent = level.desc;
    const percentage = (val / 4) * 100;
    dangerRange.style.background = `linear-gradient(to right, ${level.hex} ${percentage}%, #292524 ${percentage}%)`;
});

async function analyzeSite() {
    const url = urlInput.value.trim();
    if (!url) return;

    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '⚠ ANALYZING ⚠';
    analyzeBtn.classList.add('animate-pulse', 'bg-yellow-900', 'text-yellow-200');
    scanlines.style.display = 'block';
    resultsArea.classList.add('hidden');

    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/analyze-link`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ url, danger: dangerRange.value })
        });

        const data = await response.json();
        // Extracting text from Anthropic response structure
        const rawContent = data.content[0].text;
        const parsed = JSON.parse(rawContent.replace(/```json|```/g, "").trim());
        renderResults(parsed);
    } catch (err) {
        console.error(err);
        renderResults({
            sites: [],
            classification: "SYSTEM ERROR",
            warning: "Function not found or API key missing in Supabase secrets."
        });
    } finally {
        setTimeout(() => {
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = 'INITIATE ANALYSIS';
            analyzeBtn.classList.remove('animate-pulse', 'bg-yellow-900', 'text-yellow-200');
            scanlines.style.display = 'none';
        }, 1200);
    }
}

function renderResults(data) {
    resultsArea.classList.remove('hidden');
    resultsArea.innerHTML = `
        <div class="mb-4 pb-4 border-b border-stone-800">
            <div class="text-xs text-stone-500 mb-1">CLASSIFICATION:</div>
            <div class="text-green-400 font-bold">${data.classification || "UNKNOWN"}</div>
        </div>
        ${data.warning ? `<div class="mb-6 p-4 bg-yellow-900/20 border border-yellow-700 text-yellow-300 text-sm">${data.warning}</div>` : ''}
        <div class="space-y-4">
            ${data.sites.map((site, i) => `
                <div class="border border-stone-800 p-4 hover:border-green-800">
                    <div class="text-green-400 font-bold text-xs mb-1">SCP-LINK-${i + 1}</div>
                    <div class="text-white mb-1">${site.name}</div>
                    <a href="${site.url}" target="_blank" class="text-blue-400 text-sm underline break-all">${site.url}</a>
                    <div class="mt-2 text-sm text-stone-400 italic">${site.reason}</div>
                </div>
            `).join('')}
        </div>
    `;
}

analyzeBtn.addEventListener('click', analyzeSite);
