// Dashboard Character Management
// Handles loading and displaying saved character data

let currentCharacter = null;
let characters = [];

/**
 * Initialize dashboard on page load
 */
async function initDashboard() {
    try {
        // Get user info from session
        const userId = getUserIdFromSession();
        const authToken = getAuthToken();

        if (!userId || !authToken) {
            console.log('User not authenticated, redirecting to login');
            window.location.href = '/pages/auth/login/login.html';
            return;
        }

        // Load character data
        await loadCharacters(userId);

        // If no character exists, prompt to create one
        if (characters.length === 0) {
            showCreateCharacterPrompt();
        } else {
            // Load and display the most recent character
            currentCharacter = characters[0];
            displayCharacter(currentCharacter);
            initCharacterViewer(currentCharacter);
        }

    } catch (error) {
        console.error('Error initializing dashboard:', error);
    }
}

/**
 * Load all characters for the user
 */
async function loadCharacters(userId) {
    try {
        const response = await fetch(`/api/characters/user/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + getAuthToken()
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load characters');
        }

        const result = await response.json();
        characters = result.characters || [];

    } catch (error) {
        console.error('Error loading characters:', error);
        characters = [];
    }
}

/**
 * Display character information on dashboard
 */
function displayCharacter(character) {
    if (!character) return;

    // Update header with character name
    const headerTitle = document.querySelector('.dashboard-header h1');
    if (headerTitle) {
        headerTitle.textContent = `${character.name} - ${character.class.toUpperCase()}`;
    }

    // Update character stats
    updateCharacterDisplay(character);
}

/**
 * Update character display elements
 */
function updateCharacterDisplay(character) {
    // Update stats section
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        // Level and class info
        const levelInfo = document.createElement('div');
        levelInfo.style.cssText = 'margin-bottom: 20px; padding: 15px; background: rgba(255, 107, 107, 0.1); border-radius: 8px;';
        levelInfo.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #b0b0b0;">Level</span>
                <span style="color: #ff6b6b; font-weight: 600; font-size: 1.2rem;">${character.level || 1}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span style="color: #b0b0b0;">Class</span>
                <span style="color: #ff6b6b; font-weight: 600;">${capitalizeFirst(character.class)}</span>
            </div>
        `;
        
        const firstChild = statsSection.firstChild;
        if (firstChild) {
            statsSection.insertBefore(levelInfo, firstChild.nextSibling);
        }
    }

    // Update appearance info
    updateAppearanceDisplay(character);
}

/**
 * Update appearance information display
 */
function updateAppearanceDisplay(character) {
    // Update preview info
    document.getElementById('previewGender').textContent = capitalizeFirst(character.gender || 'Unknown');
    document.getElementById('previewHair').textContent = capitalizeFirst(character.hair_color || 'Unknown');
    document.getElementById('previewEyes').textContent = capitalizeFirst(character.eye_color || 'Unknown');
    document.getElementById('previewSkin').textContent = capitalizeFirst(character.skin_tone || 'Unknown');
}

/**
 * Initialize 3D character viewer with saved character data
 */
function initCharacterViewer(character) {
    const canvas = document.getElementById('canvas3d');
    const container = canvas.parentElement;
    
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    // Camera setup
    const width = container.clientWidth;
    const height = 400;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 3;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create character avatar based on saved data
    const avatar = createCharacterAvatar(character, scene);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xff6b6b, 0.6);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        avatar.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();

    // Handle resize
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        camera.aspect = newWidth / height;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, height);
    });
}

/**
 * Create 3D character avatar from saved data
 */
function createCharacterAvatar(character, scene) {
    const avatar = new THREE.Group();
    scene.add(avatar);

    // Color maps
    const skinColors = {
        light: 0xf4a460,
        medium: 0xd2a679,
        tan: 0xbc8f8f,
        dark: 0x8b6f47,
        fantasy: 0xcd5c5c
    };

    const eyeColors = {
        blue: 0x4a90e2,
        green: 0x7cb342,
        brown: 0x8b4513,
        purple: 0xa020f0,
        pink: 0xff1493
    };

    const hairColors = {
        black: 0x1a1a1a,
        brown: 0x8b7355,
        blonde: 0xffd700,
        red: 0xff6b6b,
        purple: 0xa020f0,
        cyan: 0x00bfff,
        white: 0xf5f5f5
    };

    const skinColor = skinColors[character.skin_tone] || 0xf4a460;
    const eyeColor = eyeColors[character.eye_color] || 0x4a90e2;
    const hairColor = hairColors[character.hair_color] || 0x1a1a1a;

    // Head
    const headGeometry = new THREE.SphereGeometry(0.6, 32, 32);
    const skinMaterial = new THREE.MeshPhongMaterial({
        color: skinColor,
        emissive: 0x333333,
        shininess: 60
    });
    const head = new THREE.Mesh(headGeometry, skinMaterial);
    head.position.y = 0.7;
    avatar.add(head);

    // Hair
    const hairGeometry = new THREE.SphereGeometry(0.7, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6);
    const hairMaterial = new THREE.MeshPhongMaterial({ color: hairColor });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.y = 0.9;
    avatar.add(hair);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const eyeMaterial = new THREE.MeshPhongMaterial({ color: eyeColor });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 0.95, 0.55);
    avatar.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 0.95, 0.55);
    avatar.add(rightEye);

    // Eyes shine
    const shineGeometry = new THREE.SphereGeometry(0.06, 8, 8);
    const shineMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x888888 });
    
    const leftShine = new THREE.Mesh(shineGeometry, shineMaterial);
    leftShine.position.set(-0.1, 1.0, 0.7);
    avatar.add(leftShine);

    const rightShine = new THREE.Mesh(shineGeometry, shineMaterial);
    rightShine.position.set(0.3, 1.0, 0.7);
    avatar.add(rightShine);

    // Body based on outfit
    const outfitColors = {
        casual: 0x4a90e2,
        military: 0x2c3e50,
        fantasy: 0xa020f0,
        cyberpunk: 0x00ff41
    };

    const bodyColor = outfitColors[character.outfit_style] || 0x4a90e2;

    const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.5);
    const bodyMaterial = new THREE.MeshPhongMaterial({
        color: bodyColor,
        emissive: bodyColor,
        emissiveIntensity: 0.2
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = -0.5;
    avatar.add(body);

    // Arms
    const armGeometry = new THREE.BoxGeometry(0.25, 0.9, 0.3);
    const armMaterial = new THREE.MeshPhongMaterial({ color: skinColor });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.6, 0, 0);
    leftArm.rotation.z = 0.3;
    avatar.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.6, 0, 0);
    rightArm.rotation.z = -0.3;
    avatar.add(rightArm);

    // Legs
    const legGeometry = new THREE.BoxGeometry(0.25, 0.8, 0.3);
    const legMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.3, -1.3, 0);
    avatar.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.3, -1.3, 0);
    avatar.add(rightLeg);

    return avatar;
}

/**
 * Show prompt to create a character if none exists
 */
function showCreateCharacterPrompt() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
    `;

    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            padding: 40px;
            border-radius: 15px;
            border: 2px solid rgba(255, 107, 107, 0.3);
            max-width: 500px;
            width: 90%;
            text-align: center;
        ">
            <h2 style="color: #ff6b6b; margin-bottom: 15px; font-size: 1.5rem;">No Character Found</h2>
            <p style="color: #b0b0b0; margin-bottom: 25px; line-height: 1.6;">
                You haven't created a character yet. Create your unique anime character now to get started on your VEQZAI journey!
            </p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <button onclick="location.href='/character%20making.html'" style="
                    padding: 14px 20px;
                    background: linear-gradient(135deg, #ff6b6b, #ff8787);
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-family: 'Rajdhani', sans-serif;
                ">
                    Create Character
                </button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                    padding: 14px 20px;
                    background: rgba(255, 107, 107, 0.2);
                    color: #ff6b6b;
                    border: 1px solid rgba(255, 107, 107, 0.5);
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s;
                    font-family: 'Rajdhani', sans-serif;
                ">
                    Continue
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

/**
 * Update character from creator
 */
async function updateCharacterFromCreator() {
    const userId = getUserIdFromSession();
    if (!userId) return;

    await loadCharacters(userId);
    if (characters.length > 0) {
        currentCharacter = characters[0];
        displayCharacter(currentCharacter);
        location.reload(); // Refresh to show updated 3D model
    }
}

/**
 * Open character creator to edit current character
 */
function editCharacter() {
    if (currentCharacter) {
        localStorage.setItem('characterData', JSON.stringify(currentCharacter));
        window.location.href = '/character%20making.html';
    }
}

/**
 * Utility functions
 */
function capitalizeFirst(str) {
    if (!str) return 'Unknown';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getUserIdFromSession() {
    return localStorage.getItem('userId');
}

function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Initialize dashboard on page load
window.addEventListener('load', initDashboard);

// Check for character updates every 30 seconds
setInterval(async () => {
    const userId = getUserIdFromSession();
    if (userId) {
        await loadCharacters(userId);
    }
}, 30000);
