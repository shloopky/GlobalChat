// Games Database - Add your games here!
const games = [
    {
        title: "Example Game 1",
        description: "Add your first game here! Replace this with your game's description.",
        icon: "🎮",
        file: "games/game1.html"
    },
    {
        title: "Example Game 2",
        description: "Your second amazing game goes here!",
        icon: "🕹️",
        file: "games/game2.html"
    },
    {
        title: "Example Game 3",
        description: "Another awesome game waiting to be added!",
        icon: "🎯",
        file: "games/game3.html"
    },
    {
        title: "Add Your Game",
        description: "Put your HTML game files in the /games folder and add them to the games array in script.js!",
        icon: "➕",
        file: ""
    }
];

// Loading Screen
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        loader.classList.add('hidden');
        
        // Remove loader from DOM after animation
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500);
    }, 2000); // 2 second loading screen
});

// Load Games
function loadGames() {
    const gamesContainer = document.getElementById('games-container');
    gamesContainer.innerHTML = '';
    
    games.forEach((game, index) => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card';
        gameCard.style.animationDelay = `${index * 0.1}s`;
        
        gameCard.innerHTML = `
            <div class="game-icon">${game.icon}</div>
            <div class="game-title">${game.title}</div>
            <div class="game-description">${game.description}</div>
            ${game.file ? `<button class="play-btn" onclick="openGame('${game.file}', '${game.title}')">Play Now</button>` : ''}
        `;
        
        gamesContainer.appendChild(gameCard);
    });
}

// Open Game in Modal
function openGame(gameFile, gameTitle) {
    const modal = document.getElementById('game-modal');
    const frame = document.getElementById('game-frame');
    const title = document.getElementById('modal-game-title');
    
    title.textContent = gameTitle;
    frame.src = gameFile;
    modal.classList.add('active');
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

// Close Game Modal
function closeGame() {
    const modal = document.getElementById('game-modal');
    const frame = document.getElementById('game-frame');
    
    modal.classList.remove('active');
    frame.src = '';
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
document.getElementById('game-modal').addEventListener('click', (e) => {
    if (e.target.id === 'game-modal') {
        closeGame();
    }
});

// Close modal with ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeGame();
    }
});

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Initialize
loadGames();

// Add floating particles effect
function createParticle() {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.width = Math.random() * 10 + 5 + 'px';
    particle.style.height = particle.style.width;
    particle.style.background = 'rgba(255, 255, 255, 0.5)';
    particle.style.borderRadius = '50%';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = '100%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '1';
    particle.style.animation = `float ${Math.random() * 3 + 3}s linear`;
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
        particle.remove();
    }, 6000);
}

// Add CSS animation for particles
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        to {
            transform: translateY(-100vh) translateX(${Math.random() * 200 - 100}px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Create particles periodically
setInterval(createParticle, 300);
