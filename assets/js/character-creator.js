// Character Creator JavaScript
// Handles all character customization logic and preview rendering

// Character Data Structure
const characterData = {
    id: null,
    name: '',
    userId: null,
    class: 'warrior',
    gender: 'male',
    bodyType: 'slim',
    height: 170,
    age: 20,
    
    // Appearance
    skinTone: 'light',
    faceShape: 'oval',
    
    // Eyes
    eyeColor: 'blue',
    eyeShape: 'anime',
    eyeSize: 'medium',
    
    // Hair
    hairStyle: 'long',
    hairColor: 'black',
    
    // Facial Features
    eyebrows: 'normal',
    nose: 'petite',
    mouth: 'small',
    facialMarking: 'none',
    
    // Accessories
    glasses: 'none',
    hat: 'none',
    cape: 'none',
    
    // Clothing & Equipment
    outfitStyle: 'casual',
    shoes: 'casual',
    armor: 'medium',
    
    // Metadata
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

// Color Maps
const colorMaps = {
    skinTone: {
        light: '#f4a460',
        medium: '#d2a679',
        tan: '#bc8f8f',
        dark: '#8b6f47',
        fantasy: '#cd5c5c'
    },
    eyeColor: {
        blue: '#4a90e2',
        green: '#7cb342',
        brown: '#8b4513',
        purple: '#a020f0',
        pink: '#ff1493'
    },
    hairColor: {
        black: '#1a1a1a',
        brown: '#8b7355',
        blonde: '#ffd700',
        red: '#ff6b6b',
        purple: '#a020f0',
        cyan: '#00bfff',
        white: '#f5f5f5'
    }
};

// Initialize the character creator
function initCharacterCreator() {
    // Load saved character if it exists
    loadCharacterFromLocalStorage();
    
    // Initialize preview
    updateCharacterPreview();
    
    // Add event listeners
    document.getElementById('characterName').addEventListener('input', (e) => {
        characterData.name = e.target.value;
    });

    document.getElementById('characterClass').addEventListener('change', (e) => {
        characterData.class = e.target.value;
    });

    bindCharacterControls();

    // Slider value updates
    document.querySelector('input[type="range"][min="150"]').addEventListener('input', (e) => {
        document.getElementById('heightValue').textContent = e.target.value + 'cm';
    });

    document.querySelector('input[type="range"][min="16"]').addEventListener('input', (e) => {
        document.getElementById('ageValue').textContent = e.target.value;
    });

    // Initialize active states for buttons
    updateButtonStates();
}

function bindCharacterControls() {
    document.querySelectorAll('[data-action="update-character"]').forEach((control) => {
        const eventName = control.matches('input[type="range"]') ? 'input' : 'click';
        control.addEventListener(eventName, () => {
            const value = control.matches('input[type="range"]') ? control.value : control.dataset.value;
            updateCharacter(control.dataset.field, value);
        });
    });

    document.querySelector('[data-action="reset-character"]')?.addEventListener('click', resetCharacter);
    document.querySelector('[data-action="randomize-character"]')?.addEventListener('click', randomizeCharacter);
    document.querySelector('[data-action="save-character"]')?.addEventListener('click', saveCharacter);
    document.querySelector('[data-action="go-dashboard"]')?.addEventListener('click', goToDashboard);

    document.querySelectorAll('[data-action="close-modal"]').forEach((button) => {
        button.addEventListener('click', () => {
            closeModal(button.dataset.modalId);
        });
    });
}

// Update character with new value
function updateCharacter(property, value) {
    // Handle special cases
    if (property === 'height') {
        characterData.height = parseInt(value);
        document.getElementById('heightValue').textContent = value + 'cm';
    } else if (property === 'age') {
        characterData.age = parseInt(value);
        document.getElementById('ageValue').textContent = value;
    } else if (property === 'eyeSize') {
        const sizes = { 1: 'Small', 2: 'Medium', 3: 'Large' };
        characterData.eyeSize = sizes[value];
        document.getElementById('eyeSizeValue').textContent = sizes[value];
    } else {
        characterData[property] = value;
    }

    // Update button states
    updateButtonStates();

    // Update preview
    updateCharacterPreview();

    // Auto-save to local storage
    saveCharacterToLocalStorage();
}

// Update button active states
function updateButtonStates() {
    // Update gender buttons
    document.querySelectorAll('[data-gender]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.gender === characterData.gender);
    });

    // Update body type buttons
    document.querySelectorAll('[data-body]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.body === characterData.bodyType);
    });

    // Update face shape buttons
    document.querySelectorAll('[data-face]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.face === characterData.faceShape);
    });

    // Update eye shape buttons
    document.querySelectorAll('[data-eyes]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.eyes === characterData.eyeShape);
    });

    // Update hair style buttons
    document.querySelectorAll('[data-hair]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.hair === characterData.hairStyle);
    });

    // Update eyebrow buttons
    document.querySelectorAll('[data-brow]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.brow === characterData.eyebrows);
    });

    // Update nose buttons
    document.querySelectorAll('[data-nose]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.nose === characterData.nose);
    });

    // Update mouth buttons
    document.querySelectorAll('[data-mouth]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mouth === characterData.mouth);
    });

    // Update facial marking buttons
    document.querySelectorAll('[data-mark]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mark === characterData.facialMarking);
    });

    // Update glasses buttons
    document.querySelectorAll('[data-glasses]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.glasses === characterData.glasses);
    });

    // Update hat buttons
    document.querySelectorAll('[data-hat]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.hat === characterData.hat);
    });

    // Update cape buttons
    document.querySelectorAll('[data-cape]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.cape === characterData.cape);
    });

    // Update outfit buttons
    document.querySelectorAll('[data-outfit]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.outfit === characterData.outfitStyle);
    });

    // Update shoes buttons
    document.querySelectorAll('[data-shoes]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.shoes === characterData.shoes);
    });

    // Update armor buttons
    document.querySelectorAll('[data-armor]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.armor === characterData.armor);
    });

    // Update color options
    document.querySelectorAll('[data-color]').forEach(btn => {
        // Skin tone
        if (btn.dataset.color === characterData.skinTone && btn.parentElement.previousElementSibling?.textContent === 'Skin Tone') {
            btn.classList.add('active');
        } else if (btn.dataset.color === characterData.eyeColor && btn.parentElement.previousElementSibling?.textContent === 'Eye Color') {
            btn.classList.add('active');
        } else if (btn.dataset.color === characterData.hairColor && btn.parentElement.previousElementSibling?.textContent === 'Hair Color') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Update character preview
function updateCharacterPreview() {
    // Update preview info
    document.getElementById('previewGender').textContent = capitalizeFirst(characterData.gender);
    document.getElementById('previewHair').textContent = capitalizeFirst(characterData.hairColor);
    document.getElementById('previewEyes').textContent = capitalizeFirst(characterData.eyeColor);
    document.getElementById('previewSkin').textContent = capitalizeFirst(characterData.skinTone);

    // Render character using Canvas (anime style)
    renderAnimeCharacter();
}

// Render anime-style character using Canvas
function renderAnimeCharacter() {
    const canvas = document.getElementById('characterPreview');
    
    // Clear previous content
    canvas.innerHTML = '';

    // Create SVG for anime character (scalable, clean lines)
    const svg = createCharacterSVG();
    canvas.appendChild(svg);
}

// Create SVG representation of anime character
function createCharacterSVG() {
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 300 500');
    svg.setAttribute('width', '300');
    svg.setAttribute('height', '500');
    svg.setAttribute('style', 'max-width: 100%;');

    // Background
    const bg = document.createElementNS(svgNS, 'rect');
    bg.setAttribute('width', '300');
    bg.setAttribute('height', '500');
    bg.setAttribute('fill', 'url(#bgGradient)');
    svg.appendChild(bg);

    // Define gradients
    const defs = document.createElementNS(svgNS, 'defs');
    
    const bgGradient = document.createElementNS(svgNS, 'linearGradient');
    bgGradient.setAttribute('id', 'bgGradient');
    bgGradient.setAttribute('x1', '0%');
    bgGradient.setAttribute('y1', '0%');
    bgGradient.setAttribute('x2', '0%');
    bgGradient.setAttribute('y2', '100%');
    
    const stop1 = document.createElementNS(svgNS, 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('style', 'stop-color:rgba(26,26,46,0.5);stop-opacity:1');
    bgGradient.appendChild(stop1);
    
    const stop2 = document.createElementNS(svgNS, 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('style', 'stop-color:rgba(22,33,62,0.5);stop-opacity:1');
    bgGradient.appendChild(stop2);
    
    defs.appendChild(bgGradient);
    svg.appendChild(defs);

    // Draw character parts
    drawCharacterHead(svg);
    drawCharacterBody(svg);
    drawCharacterAccessories(svg);

    return svg;
}

// Draw head
function drawCharacterHead(svg) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const skinColor = colorMaps.skinTone[characterData.skinTone];

    // Head shape
    const head = document.createElementNS(svgNS, 'circle');
    head.setAttribute('cx', '150');
    head.setAttribute('cy', '120');
    head.setAttribute('r', '65');
    head.setAttribute('fill', skinColor);
    head.setAttribute('stroke', '#000');
    head.setAttribute('stroke-width', '2');
    svg.appendChild(head);

    // Hair
    drawHair(svg, skinColor);

    // Eyes
    drawEyes(svg);

    // Eyebrows
    drawEyebrows(svg);

    // Nose
    drawNose(svg);

    // Mouth
    drawMouth(svg);

    // Facial markings
    if (characterData.facialMarking !== 'none') {
        drawFacialMarkings(svg);
    }

    // Accessories on face
    if (characterData.glasses !== 'none') {
        drawGlasses(svg);
    }

    if (characterData.hat !== 'none') {
        drawHat(svg);
    }
}

// Draw hair
function drawHair(svg, skinColor) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const hairColor = colorMaps.hairColor[characterData.hairColor];

    switch (characterData.hairStyle) {
        case 'long':
            const longHair = document.createElementNS(svgNS, 'path');
            longHair.setAttribute('d', 'M 100 100 Q 80 120 75 200 Q 73 300 150 320 Q 227 300 225 200 Q 220 120 200 100 Q 180 70 150 60 Q 120 70 100 100');
            longHair.setAttribute('fill', hairColor);
            longHair.setAttribute('stroke', '#000');
            longHair.setAttribute('stroke-width', '2');
            svg.appendChild(longHair);
            break;
        case 'short':
            const shortHair = document.createElementNS(svgNS, 'path');
            shortHair.setAttribute('d', 'M 100 100 Q 90 95 85 110 Q 80 130 150 55 Q 220 130 215 110 Q 210 95 200 100');
            shortHair.setAttribute('fill', hairColor);
            shortHair.setAttribute('stroke', '#000');
            shortHair.setAttribute('stroke-width', '2');
            svg.appendChild(shortHair);
            break;
        case 'bob':
            const bobHair = document.createElementNS(svgNS, 'path');
            bobHair.setAttribute('d', 'M 100 100 Q 85 110 80 150 Q 75 180 150 190 Q 225 180 220 150 Q 215 110 200 100');
            bobHair.setAttribute('fill', hairColor);
            bobHair.setAttribute('stroke', '#000');
            bobHair.setAttribute('stroke-width', '2');
            svg.appendChild(bobHair);
            break;
        case 'wavy':
            const wavyHair = document.createElementNS(svgNS, 'path');
            wavyHair.setAttribute('d', 'M 100 100 Q 85 120 80 180 Q 75 240 100 280 Q 150 310 200 280 Q 225 240 220 180 Q 215 120 200 100');
            wavyHair.setAttribute('fill', hairColor);
            wavyHair.setAttribute('stroke', '#000');
            wavyHair.setAttribute('stroke-width', '2');
            svg.appendChild(wavyHair);
            break;
        case 'spiky':
            // Draw multiple spikes
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const x = 150 + Math.cos(angle) * 60;
                const y = 120 + Math.sin(angle) * 60;
                const spike = document.createElementNS(svgNS, 'polygon');
                spike.setAttribute('points', `150,120 ${x},${y} ${x - 10},${y}`);
                spike.setAttribute('fill', hairColor);
                spike.setAttribute('stroke', '#000');
                spike.setAttribute('stroke-width', '1');
                svg.appendChild(spike);
            }
            break;
        case 'twintails':
            const leftTail = document.createElementNS(svgNS, 'path');
            leftTail.setAttribute('d', 'M 110 100 Q 60 120 50 220');
            leftTail.setAttribute('stroke', hairColor);
            leftTail.setAttribute('stroke-width', '20');
            leftTail.setAttribute('stroke-linecap', 'round');
            leftTail.setAttribute('fill', 'none');
            svg.appendChild(leftTail);

            const rightTail = document.createElementNS(svgNS, 'path');
            rightTail.setAttribute('d', 'M 190 100 Q 240 120 250 220');
            rightTail.setAttribute('stroke', hairColor);
            rightTail.setAttribute('stroke-width', '20');
            rightTail.setAttribute('stroke-linecap', 'round');
            rightTail.setAttribute('fill', 'none');
            svg.appendChild(rightTail);
            break;
    }
}

// Draw eyes
function drawEyes(svg) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const eyeColor = colorMaps.eyeColor[characterData.eyeColor];

    const eyePositions = [
        { cx: 120, cy: 115 },
        { cx: 180, cy: 115 }
    ];

    eyePositions.forEach(pos => {
        // Eye white
        const eye = document.createElementNS(svgNS, 'ellipse');
        eye.setAttribute('cx', pos.cx);
        eye.setAttribute('cy', pos.cy);
        eye.setAttribute('rx', '15');
        eye.setAttribute('ry', '22');
        eye.setAttribute('fill', '#fff');
        eye.setAttribute('stroke', '#000');
        eye.setAttribute('stroke-width', '2');
        svg.appendChild(eye);

        // Iris
        const iris = document.createElementNS(svgNS, 'circle');
        iris.setAttribute('cx', pos.cx);
        iris.setAttribute('cy', pos.cy + 5);
        iris.setAttribute('r', '10');
        iris.setAttribute('fill', eyeColor);
        svg.appendChild(iris);

        // Pupil
        const pupil = document.createElementNS(svgNS, 'circle');
        pupil.setAttribute('cx', pos.cx + 3);
        pupil.setAttribute('cy', pos.cy + 2);
        pupil.setAttribute('r', '6');
        pupil.setAttribute('fill', '#000');
        svg.appendChild(pupil);

        // Shine
        const shine = document.createElementNS(svgNS, 'circle');
        shine.setAttribute('cx', pos.cx + 5);
        shine.setAttribute('cy', pos.cy);
        shine.setAttribute('r', '3');
        shine.setAttribute('fill', '#fff');
        svg.appendChild(shine);
    });
}

// Draw eyebrows
function drawEyebrows(svg) {
    const svgNS = 'http://www.w3.org/2000/svg';

    const browPositions = [
        { x1: 105, y1: 95, x2: 135, y2: 90 },
        { x1: 165, y1: 90, x2: 195, y2: 95 }
    ];

    browPositions.forEach((pos, idx) => {
        const brow = document.createElementNS(svgNS, 'path');
        brow.setAttribute('d', `M ${pos.x1} ${pos.y1} Q ${(pos.x1 + pos.x2) / 2} ${pos.y1 - 5} ${pos.x2} ${pos.y2}`);
        brow.setAttribute('stroke', '#000');
        brow.setAttribute('stroke-width', characterData.eyebrows === 'thick' ? '4' : '2');
        brow.setAttribute('fill', 'none');
        brow.setAttribute('stroke-linecap', 'round');
        svg.appendChild(brow);
    });
}

// Draw nose
function drawNose(svg) {
    const svgNS = 'http://www.w3.org/2000/svg';

    const nose = document.createElementNS(svgNS, 'line');
    nose.setAttribute('x1', '150');
    nose.setAttribute('y1', '120');
    nose.setAttribute('x2', '150');
    nose.setAttribute('y2', '140');
    nose.setAttribute('stroke', '#000');
    nose.setAttribute('stroke-width', '2');
    svg.appendChild(nose);
}

// Draw mouth
function drawMouth(svg) {
    const svgNS = 'http://www.w3.org/2000/svg';

    let mouth;
    switch (characterData.mouth) {
        case 'small':
            mouth = document.createElementNS(svgNS, 'path');
            mouth.setAttribute('d', 'M 140 160 Q 150 168 160 160');
            mouth.setAttribute('stroke', '#ff6b6b');
            mouth.setAttribute('stroke-width', '2');
            mouth.setAttribute('fill', 'none');
            mouth.setAttribute('stroke-linecap', 'round');
            break;
        case 'normal':
            mouth = document.createElementNS(svgNS, 'path');
            mouth.setAttribute('d', 'M 135 160 Q 150 172 165 160');
            mouth.setAttribute('stroke', '#ff6b6b');
            mouth.setAttribute('stroke-width', '2');
            mouth.setAttribute('fill', 'none');
            mouth.setAttribute('stroke-linecap', 'round');
            break;
        case 'wide':
            mouth = document.createElementNS(svgNS, 'path');
            mouth.setAttribute('d', 'M 130 160 Q 150 175 170 160');
            mouth.setAttribute('stroke', '#ff6b6b');
            mouth.setAttribute('stroke-width', '2');
            mouth.setAttribute('fill', 'none');
            mouth.setAttribute('stroke-linecap', 'round');
            break;
        case 'pouty':
            mouth = document.createElementNS(svgNS, 'circle');
            mouth.setAttribute('cx', '150');
            mouth.setAttribute('cy', '162');
            mouth.setAttribute('r', '6');
            mouth.setAttribute('fill', '#ff6b6b');
            break;
    }
    if (mouth) svg.appendChild(mouth);
}

// Draw facial markings
function drawFacialMarkings(svg) {
    const svgNS = 'http://www.w3.org/2000/svg';

    switch (characterData.facialMarking) {
        case 'freckles':
            for (let i = 0; i < 6; i++) {
                const circle = document.createElementNS(svgNS, 'circle');
                circle.setAttribute('cx', 120 + Math.random() * 60);
                circle.setAttribute('cy', 130 + Math.random() * 40);
                circle.setAttribute('r', '2');
                circle.setAttribute('fill', '#8b4513');
                svg.appendChild(circle);
            }
            break;
        case 'scar':
            const scar = document.createElementNS(svgNS, 'path');
            scar.setAttribute('d', 'M 100 130 L 140 140 L 100 150');
            scar.setAttribute('stroke', '#ff6b6b');
            scar.setAttribute('stroke-width', '2');
            scar.setAttribute('fill', 'none');
            svg.appendChild(scar);
            break;
        case 'tattoo':
            const tattoo = document.createElementNS(svgNS, 'circle');
            tattoo.setAttribute('cx', '100');
            tattoo.setAttribute('cy', '120');
            tattoo.setAttribute('r', '8');
            tattoo.setAttribute('fill', 'none');
            tattoo.setAttribute('stroke', '#a020f0');
            tattoo.setAttribute('stroke-width', '2');
            svg.appendChild(tattoo);
            break;
    }
}

// Draw glasses
function drawGlasses(svg) {
    const svgNS = 'http://www.w3.org/2000/svg';

    switch (characterData.glasses) {
        case 'round':
            // Left lens
            const leftLens = document.createElementNS(svgNS, 'circle');
            leftLens.setAttribute('cx', '120');
            leftLens.setAttribute('cy', '115');
            leftLens.setAttribute('r', '15');
            leftLens.setAttribute('fill', 'none');
            leftLens.setAttribute('stroke', '#000');
            leftLens.setAttribute('stroke-width', '2');
            svg.appendChild(leftLens);

            // Right lens
            const rightLens = document.createElementNS(svgNS, 'circle');
            rightLens.setAttribute('cx', '180');
            rightLens.setAttribute('cy', '115');
            rightLens.setAttribute('r', '15');
            rightLens.setAttribute('fill', 'none');
            rightLens.setAttribute('stroke', '#000');
            rightLens.setAttribute('stroke-width', '2');
            svg.appendChild(rightLens);

            // Bridge
            const bridge = document.createElementNS(svgNS, 'line');
            bridge.setAttribute('x1', '135');
            bridge.setAttribute('y1', '115');
            bridge.setAttribute('x2', '165');
            bridge.setAttribute('y2', '115');
            bridge.setAttribute('stroke', '#000');
            bridge.setAttribute('stroke-width', '2');
            svg.appendChild(bridge);
            break;
    }
}

// Draw hat
function drawHat(svg) {
    const svgNS = 'http://www.w3.org/2000/svg';

    switch (characterData.hat) {
        case 'cap':
            const cap = document.createElementNS(svgNS, 'path');
            cap.setAttribute('d', 'M 100 60 L 200 60 L 190 40 L 110 40 Z');
            cap.setAttribute('fill', '#333');
            cap.setAttribute('stroke', '#000');
            cap.setAttribute('stroke-width', '2');
            svg.appendChild(cap);
            break;
        case 'crown':
            // Simple crown shape
            const crowns = ['M 130 40 L 140 20 L 150 35 L 160 20 L 170 40'];
            const crown = document.createElementNS(svgNS, 'path');
            crown.setAttribute('d', crowns[0]);
            crown.setAttribute('fill', '#ffd700');
            crown.setAttribute('stroke', '#000');
            crown.setAttribute('stroke-width', '2');
            svg.appendChild(crown);
            break;
    }
}

// Draw body
function drawCharacterBody(svg) {
    const svgNS = 'http://www.w3.org/2000/svg';

    // Outfit color based on style
    const outfitColors = {
        casual: '#4a90e2',
        military: '#2c3e50',
        fantasy: '#a020f0',
        cyberpunk: '#00ff41'
    };

    const bodyColor = outfitColors[characterData.outfitStyle] || '#4a90e2';

    // Neck
    const neck = document.createElementNS(svgNS, 'rect');
    neck.setAttribute('x', '140');
    neck.setAttribute('y', '185');
    neck.setAttribute('width', '20');
    neck.setAttribute('height', '15');
    neck.setAttribute('fill', colorMaps.skinTone[characterData.skinTone]);
    neck.setAttribute('stroke', '#000');
    neck.setAttribute('stroke-width', '1');
    svg.appendChild(neck);

    // Body/Torso
    const body = document.createElementNS(svgNS, 'rect');
    body.setAttribute('x', '110');
    body.setAttribute('y', '200');
    body.setAttribute('width', '80');
    body.setAttribute('height', '100');
    body.setAttribute('fill', bodyColor);
    body.setAttribute('stroke', '#000');
    body.setAttribute('stroke-width', '2');
    svg.appendChild(body);

    // Arms
    const leftArm = document.createElementNS(svgNS, 'rect');
    leftArm.setAttribute('x', '70');
    leftArm.setAttribute('y', '210');
    leftArm.setAttribute('width', '40');
    leftArm.setAttribute('height', '25');
    leftArm.setAttribute('fill', colorMaps.skinTone[characterData.skinTone]);
    leftArm.setAttribute('stroke', '#000');
    leftArm.setAttribute('stroke-width', '2');
    svg.appendChild(leftArm);

    const rightArm = document.createElementNS(svgNS, 'rect');
    rightArm.setAttribute('x', '190');
    rightArm.setAttribute('y', '210');
    rightArm.setAttribute('width', '40');
    rightArm.setAttribute('height', '25');
    rightArm.setAttribute('fill', colorMaps.skinTone[characterData.skinTone]);
    rightArm.setAttribute('stroke', '#000');
    rightArm.setAttribute('stroke-width', '2');
    svg.appendChild(rightArm);

    // Legs
    const leftLeg = document.createElementNS(svgNS, 'rect');
    leftLeg.setAttribute('x', '120');
    leftLeg.setAttribute('y', '300');
    leftLeg.setAttribute('width', '20');
    leftLeg.setAttribute('height', '80');
    leftLeg.setAttribute('fill', '#333');
    leftLeg.setAttribute('stroke', '#000');
    leftLeg.setAttribute('stroke-width', '2');
    svg.appendChild(leftLeg);

    const rightLeg = document.createElementNS(svgNS, 'rect');
    rightLeg.setAttribute('x', '160');
    rightLeg.setAttribute('y', '300');
    rightLeg.setAttribute('width', '20');
    rightLeg.setAttribute('height', '80');
    rightLeg.setAttribute('fill', '#333');
    rightLeg.setAttribute('stroke', '#000');
    rightLeg.setAttribute('stroke-width', '2');
    svg.appendChild(rightLeg);

    // Cape
    if (characterData.cape !== 'none') {
        drawCape(svg, bodyColor);
    }
}

// Draw cape
function drawCape(svg, bodyColor) {
    const svgNS = 'http://www.w3.org/2000/svg';
    
    const cape = document.createElementNS(svgNS, 'path');
    cape.setAttribute('d', 'M 110 210 Q 50 250 60 380 Q 70 390 110 350');
    cape.setAttribute('fill', '#ff6b6b');
    cape.setAttribute('stroke', '#000');
    cape.setAttribute('stroke-width', '2');
    svg.appendChild(cape);
}

// Draw accessories (placeholder)
function drawCharacterAccessories(svg) {
    // Accessories would be drawn here based on selections
}

// Randomize character
function randomizeCharacter() {
    const genders = ['male', 'female'];
    const bodyTypes = ['slim', 'athletic', 'muscular', 'curvy'];
    const faceShapes = ['oval', 'round', 'square', 'heart'];
    const eyeShapes = ['anime', 'sharp', 'soft', 'large'];
    const hairStyles = ['long', 'short', 'bob', 'wavy', 'spiky', 'twintails'];
    const skinTones = Object.keys(colorMaps.skinTone);
    const eyeColors = Object.keys(colorMaps.eyeColor);
    const hairColors = Object.keys(colorMaps.hairColor);
    const outfitStyles = ['casual', 'military', 'fantasy', 'cyberpunk'];
    const armors = ['none', 'light', 'medium', 'heavy'];

    characterData.gender = genders[Math.floor(Math.random() * genders.length)];
    characterData.bodyType = bodyTypes[Math.floor(Math.random() * bodyTypes.length)];
    characterData.faceShape = faceShapes[Math.floor(Math.random() * faceShapes.length)];
    characterData.eyeShape = eyeShapes[Math.floor(Math.random() * eyeShapes.length)];
    characterData.hairStyle = hairStyles[Math.floor(Math.random() * hairStyles.length)];
    characterData.skinTone = skinTones[Math.floor(Math.random() * skinTones.length)];
    characterData.eyeColor = eyeColors[Math.floor(Math.random() * eyeColors.length)];
    characterData.hairColor = hairColors[Math.floor(Math.random() * hairColors.length)];
    characterData.outfitStyle = outfitStyles[Math.floor(Math.random() * outfitStyles.length)];
    characterData.armor = armors[Math.floor(Math.random() * armors.length)];
    characterData.height = 150 + Math.floor(Math.random() * 50);
    characterData.age = 16 + Math.floor(Math.random() * 35);

    updateButtonStates();
    updateCharacterPreview();
    saveCharacterToLocalStorage();
}

// Reset character to defaults
function resetCharacter() {
    characterData.gender = 'male';
    characterData.bodyType = 'slim';
    characterData.height = 170;
    characterData.age = 20;
    characterData.skinTone = 'light';
    characterData.faceShape = 'oval';
    characterData.eyeColor = 'blue';
    characterData.eyeShape = 'anime';
    characterData.eyeSize = 'medium';
    characterData.hairStyle = 'long';
    characterData.hairColor = 'black';
    characterData.eyebrows = 'normal';
    characterData.nose = 'petite';
    characterData.mouth = 'small';
    characterData.facialMarking = 'none';
    characterData.glasses = 'none';
    characterData.hat = 'none';
    characterData.cape = 'none';
    characterData.outfitStyle = 'casual';
    characterData.shoes = 'casual';
    characterData.armor = 'medium';

    // Reset form
    document.getElementById('characterName').value = '';
    document.getElementById('heightValue').textContent = '170cm';
    document.getElementById('ageValue').textContent = '20';

    updateButtonStates();
    updateCharacterPreview();
    saveCharacterToLocalStorage();
}

// Save character to database
function saveCharacter() {
    // Validate character name
    if (!characterData.name || characterData.name.trim() === '') {
        alert('Please enter a character name!');
        return;
    }

    if (characterData.name.length < 3) {
        alert('Character name must be at least 3 characters long!');
        return;
    }

    // Prepare character data
    const characterDataToSave = {
        ...characterData,
        userId: getUserIdFromSession(), // Get from session/auth
        updatedAt: new Date().toISOString()
    };

    // Send to server
    saveCharacterToServer(characterDataToSave);
}

// Save to server
async function saveCharacterToServer(data) {
    try {
        const response = await fetch('/api/characters/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getAuthToken() // Get from session
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed to save character');
        }

        const result = await response.json();
        characterData.id = result.characterId;

        // Show success modal
        showSuccessModal('Character saved successfully!');
        
        // Auto-save to local storage
        saveCharacterToLocalStorage();
    } catch (error) {
        console.error('Error saving character:', error);
        alert('Error saving character. Please try again.');
    }
}

// Show success modal
function showSuccessModal(message) {
    const modal = document.getElementById('successModal');
    document.getElementById('successMessage').textContent = message;
    modal.classList.add('active');
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Go to dashboard
function goToDashboard() {
    window.location.href = 'dashboard.html';
}

// Local storage functions
function saveCharacterToLocalStorage() {
    localStorage.setItem('characterData', JSON.stringify(characterData));
}

function loadCharacterFromLocalStorage() {
    const saved = localStorage.getItem('characterData');
    if (saved) {
        Object.assign(characterData, JSON.parse(saved));
        document.getElementById('characterName').value = characterData.name;
    }
}

// Utility functions
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getUserIdFromSession() {
    // This should get the user ID from the session/auth system
    return localStorage.getItem('userId') || 'unknown';
}

function getAuthToken() {
    // This should get the auth token from the session/auth system
    return localStorage.getItem('authToken') || '';
}

// Initialize on page load
window.addEventListener('load', initCharacterCreator);
