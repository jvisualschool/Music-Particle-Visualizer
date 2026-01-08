// Preset UI - Top Right
const presetUI = document.createElement('div');
presetUI.id = 'presetUI';
presetUI.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 1001;
    background: rgba(0, 0, 0, 0.85);
    padding: 15px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    min-width: 200px;
`;

const presetTitle = document.createElement('div');
presetTitle.textContent = 'PRESETS';
presetTitle.style.cssText = `
    font-size: 12px;
    font-weight: bold;
    color: #fff;
    margin-bottom: 10px;
    letter-spacing: 2px;
`;
presetUI.appendChild(presetTitle);

const presetButtons = document.createElement('div');
presetButtons.style.cssText = 'display: flex; flex-direction: column; gap: 6px;';

const presets = {
    "Cosmic Storm": "극적인 우주 폭풍",
    "Neon Dreams": "네온 드림",
    "Deep Bass": "깊은 베이스",
    "Electric Pulse": "전기 펄스",
    "Galaxy Spiral": "은하 나선",
    "Fire Dance": "불의 춤",
    "Ocean Waves": "바다 파도",
    "Aurora Borealis": "오로라",
    "Supernova": "초신성",
    "Midnight Bloom": "한밤의 꽃"
};

Object.keys(presets).forEach(presetName => {
    const btn = document.createElement('button');
    btn.textContent = presets[presetName];
    btn.dataset.preset = presetName;
    btn.style.cssText = `
        padding: 8px 12px;
        background: rgba(136, 68, 255, 0.3);
        color: white;
        border: 1px solid rgba(136, 68, 255, 0.5);
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.2s;
        text-align: left;
    `;
    btn.onmouseover = () => {
        btn.style.background = 'rgba(136, 68, 255, 0.6)';
        btn.style.borderColor = 'rgba(136, 68, 255, 0.9)';
    };
    btn.onmouseout = () => {
        btn.style.background = 'rgba(136, 68, 255, 0.3)';
        btn.style.borderColor = 'rgba(136, 68, 255, 0.5)';
    };
    btn.onclick = () => loadPreset(presetName);
    presetButtons.appendChild(btn);
});

presetUI.appendChild(presetButtons);
document.body.appendChild(presetUI);

// Toggle button for dat.GUI
const guiToggle = document.createElement('button');
guiToggle.textContent = '⚙ Controls';
guiToggle.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 10px;
    z-index: 1001;
    padding: 10px 20px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
`;
document.body.appendChild(guiToggle);

let guiVisible = false;
guiToggle.onclick = () => {
    guiVisible = !guiVisible;
    const guiElement = document.querySelector('.dg.main');
    if (guiElement) {
        guiElement.style.display = guiVisible ? 'block' : 'none';
    }
    guiToggle.textContent = guiVisible ? '✕ Close' : '⚙ Controls';
};

// Load preset function
async function loadPreset(presetName) {
    try {
        const response = await fetch('dramatic_presets.json');
        const allPresets = await response.json();
        const preset = allPresets[presetName];

        if (!preset) {
            console.error('Preset not found:', presetName);
            return;
        }

        spheres.forEach((sphere, index) => {
            if (preset[index]) {
                const previousParticleCount = sphere.params.particleCount;
                Object.assign(sphere.params, preset[index]);

                if (sphere.params.particleCount !== previousParticleCount) {
                    const {
                        newPositions,
                        newColors,
                        newVelocities,
                        newBasePositions,
                        newLifetimes,
                        newMaxLifetimes,
                        newBeatEffects
                    } = reinitializeParticlesForSphere(sphere, sphere.params, sphere.geometry);

                    sphere.positions = newPositions;
                    sphere.colors = newColors;
                    sphere.velocities = newVelocities;
                    sphere.basePositions = newBasePositions;
                    sphere.lifetimes = newLifetimes;
                    sphere.maxLifetimes = newMaxLifetimes;
                    sphere.beatEffects = newBeatEffects;

                    sphere.geometry.attributes.position.needsUpdate = true;
                    sphere.geometry.attributes.color.needsUpdate = true;
                }

                sphere.particleSystem.visible = sphere.params.enabled;
            }
        });

        if (mainGui) {
            mainGui.updateDisplay();
        }

        console.log('Preset loaded:', presetName);
    } catch (error) {
        console.error('Failed to load preset:', error);
    }
}
