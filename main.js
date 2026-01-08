/**
 * Particula - Music Particle Visualizer
 * Version: 1.1.0
 * 
 * An interactive music-driven particle visualizer built with WebGL (Three.js)
 * Reacts to sound, frequency, and rhythm to create dynamic audiovisual experiences
 */

import * as THREE from 'three';
import { AudioLoader, AudioListener, Audio, AudioAnalyser } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as dat from 'https://cdn.jsdelivr.net/npm/dat.gui/build/dat.gui.module.js';

const VERSION = '1.1.0';
console.log(`Particula v${VERSION} - Script started`);

// ============================================
// LUCIDE ICONS HELPER
// ============================================
// Create Lucide icon SVG inline (since we can't use lucide.createIcons() dynamically)
function createLucideIcon(name, size = 20, strokeWidth = 2) {
    const icons = {
        'moon': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
        'sun': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
        'play': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>`,
        'pause': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/></svg>`,
        'mic': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>`,
        'music': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
        'check-square': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>`,
        'square': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>`,
        'volume-2': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`,
        'maximize': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>`,
        'minimize': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg>`,
        'star': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    };
    return icons[name] || '';
}

// ============================================
// THEME SYSTEM - Light/Dark Mode
// ============================================
window.ThemeManager = {
    currentTheme: localStorage.getItem('particula-theme') || 'dark',

    themes: {
        dark: {
            name: 'dark',
            bgPrimary: 'rgba(0, 0, 0, 0.85)',
            bgSecondary: 'rgba(0, 0, 0, 0.7)',
            bgTertiary: 'rgba(30, 30, 30, 0.9)',
            textPrimary: '#ffffff',
            textSecondary: '#aaaaaa',
            textMuted: '#888888',
            border: 'rgba(255, 255, 255, 0.2)',
            accent: '#3263d1',
            accentHover: '#4a7ae8',
            buttonBg: '#333333',
            buttonHover: '#444444',
            sliderBg: '#4a4a4a',
            sliderFill: '#3263d1',
            canvasBg: '#000000',
            shadowColor: 'rgba(0, 0, 0, 0.5)',
            icon: 'sun', // Show sun icon in dark mode to switch to light mode
            // Audio slider colors (vibrant for dark mode)
            audioTrackBg: '#444',
            audioTrackBorder: '#666',
            audioThumbBg: '#0099ff',
            audioThumbHover: '#33bbff',
            audioTimelineThumb: '#00ffff'
        },
        light: {
            name: 'light',
            bgPrimary: 'rgba(255, 255, 255, 0.95)',
            bgSecondary: 'rgba(245, 245, 245, 0.9)',
            bgTertiary: 'rgba(230, 230, 230, 0.95)',
            textPrimary: '#1a1a1a',
            textSecondary: '#555555',
            textMuted: '#888888',
            border: 'rgba(0, 0, 0, 0.15)',
            accent: '#888888', // Gray tone instead of purple
            accentHover: '#666666',
            buttonBg: '#e0e0e0',
            buttonHover: '#d0d0d0',
            sliderBg: '#cccccc',
            sliderFill: '#888888', // Gray tone instead of purple
            canvasBg: '#f5f5f5',
            shadowColor: 'rgba(0, 0, 0, 0.15)',
            icon: 'moon', // Show moon icon in light mode to switch to dark mode
            // Audio slider colors (muted/desaturated for light mode)
            audioTrackBg: '#d0d0d0',
            audioTrackBorder: '#bbb',
            audioThumbBg: '#6688aa',
            audioThumbHover: '#5577aa',
            audioTimelineThumb: '#6699aa'
        }
    },

    init() {
        this.applyTheme(this.currentTheme);
        this.injectThemeStyles();
    },

    injectThemeStyles() {
        const style = document.createElement('style');
        style.id = 'theme-styles';
        style.textContent = `
            /* Global font */
            body, button, input, select, textarea, .dg, .dg * {
                font-family: 'Noto Sans KR', sans-serif !important;
            }
            
            /* Theme transition */
            #mainUI, #audioControls, .dg.main, .dg.ac, .dg ul, .dg li {
                transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
            }
            
            /* Light theme specific overrides for dat.GUI */
            body.light-theme .dg.main {
                background: var(--bg-tertiary) !important;
            }
            body.light-theme .dg.main .close-button {
                background: var(--bg-secondary) !important;
                color: var(--text-primary) !important;
            }
            body.light-theme .dg li:not(.folder) {
                background: var(--bg-secondary) !important;
                border-bottom-color: var(--border) !important;
            }
            body.light-theme .dg li.folder {
                background: var(--bg-tertiary) !important;
            }
            body.light-theme .dg li.title {
                background: #888888 !important; /* Gray tone instead of purple */
                color: white !important;
            }
            body.light-theme .dg .cr.number input[type=text],
            body.light-theme .dg .cr.string input[type=text] {
                background: var(--bg-primary) !important;
                color: var(--text-primary) !important;
                border: 1px solid var(--border) !important;
            }
            body.light-theme .dg .c select {
                background: var(--bg-primary) !important;
                color: var(--text-primary) !important;
            }
            body.light-theme .dg .property-name {
                color: var(--text-primary) !important;
            }
            body.light-theme .dg .c .slider {
                background: var(--slider-bg) !important;
            }
            body.light-theme .dg .c .slider-fg {
                background: var(--slider-fill) !important;
            }
            
            /* Force remove all purple tones in light mode for dat.GUI */
            body.light-theme .dg li.title,
            body.light-theme .dg .folder-title,
            body.light-theme .dg .folder-name {
                background: #888888 !important; /* Gray instead of purple */
            }
            body.light-theme .dg .c .slider-fg {
                background: #888888 !important; /* Gray slider fill */
            }
            /* Override any purple colors in dat.GUI */
            body.light-theme .dg * {
                border-color: transparent !important;
            }
            body.light-theme .dg li.title,
            body.light-theme .dg .folder-title {
                border-left-color: #888888 !important; /* Gray folder indicator */
            }
            
            /* Theme toggle button */
            #themeToggle {
                background: transparent;
                border: none;
                width: 32px;
                height: 32px;
                cursor: pointer;
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                color: var(--text-primary, #ffffff);
            }
            #themeToggle:hover {
                transform: scale(1.1);
            }
            /* Dark mode: sun icon should be visible */
            body.dark-theme #themeToggle {
                color: var(--text-primary, #ffffff) !important;
            }
            /* Light mode: moon icon should be visible */
            body.light-theme #themeToggle {
                color: var(--text-primary, #1a1a1a) !important;
            }
            
            /* Fullscreen toggle button */
            #fullscreenToggle {
                background: transparent;
                border: none;
                width: 32px;
                height: 32px;
                cursor: pointer;
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                color: var(--text-primary, #ffffff);
            }
            #fullscreenToggle:hover {
                transform: scale(1.1);
                opacity: 1 !important;
            }
            body.dark-theme #fullscreenToggle {
                color: var(--text-primary, #ffffff) !important;
            }
            body.light-theme #fullscreenToggle {
                color: var(--text-primary, #1a1a1a) !important;
            }
            
            /* Splash star button */
            #splashStarBtn {
                background: transparent;
                border: none;
                width: 28px;
                height: 28px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                color: var(--text-primary, #ffffff);
                opacity: 0.7;
            }
            #splashStarBtn:hover {
                opacity: 1;
                transform: scale(1.1);
            }
            body.dark-theme #splashStarBtn {
                color: var(--text-primary, #ffffff) !important;
            }
            body.light-theme #splashStarBtn {
                color: var(--text-primary, #1a1a1a) !important;
            }
            
            /* Fullscreen mode: hide other UI elements */
            :fullscreen #mainUI > div:first-child button:not(#fullscreenToggle),
            :-webkit-full-screen #mainUI > div:first-child button:not(#fullscreenToggle),
            :-moz-full-screen #mainUI > div:first-child button:not(#fullscreenToggle),
            :-ms-fullscreen #mainUI > div:first-child button:not(#fullscreenToggle) {
                display: none !important;
            }
            
            :fullscreen #mainUI > div:not(:first-child),
            :-webkit-full-screen #mainUI > div:not(:first-child),
            :-moz-full-screen #mainUI > div:not(:first-child),
            :-ms-fullscreen #mainUI > div:not(:first-child) {
                display: none !important;
            }
            
            :fullscreen #audioControls,
            :-webkit-full-screen #audioControls,
            :-moz-full-screen #audioControls,
            :-ms-fullscreen #audioControls {
                display: none !important;
            }
            
            /* Remove text shadow in light mode */
            body.light-theme, body.light-theme *, body.light-theme button, body.light-theme input, body.light-theme select {
                text-shadow: none !important;
            }
            
            /* Gray tone for preset buttons in light mode */
            body.light-theme #presetContent button {
                background: rgba(136, 136, 136, 0.3) !important;
                border-color: rgba(136, 136, 136, 0.5) !important;
            }
            body.light-theme #presetContent button:hover {
                background: rgba(136, 136, 136, 0.6) !important;
                border-color: rgba(136, 136, 136, 0.9) !important;
            }
        `;
        document.head.appendChild(style);
    },

    applyTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return;

        this.currentTheme = themeName;
        localStorage.setItem('particula-theme', themeName);

        // Set CSS variables on root
        const root = document.documentElement;
        root.style.setProperty('--bg-primary', theme.bgPrimary);
        root.style.setProperty('--bg-secondary', theme.bgSecondary);
        root.style.setProperty('--bg-tertiary', theme.bgTertiary);
        root.style.setProperty('--text-primary', theme.textPrimary);
        root.style.setProperty('--text-secondary', theme.textSecondary);
        root.style.setProperty('--text-muted', theme.textMuted);
        root.style.setProperty('--border', theme.border);
        root.style.setProperty('--accent', theme.accent);
        root.style.setProperty('--accent-hover', theme.accentHover);
        root.style.setProperty('--button-bg', theme.buttonBg);
        root.style.setProperty('--button-hover', theme.buttonHover);
        root.style.setProperty('--slider-bg', theme.sliderBg);
        root.style.setProperty('--slider-fill', theme.sliderFill);
        root.style.setProperty('--shadow-color', theme.shadowColor);

        // Audio slider CSS variables
        root.style.setProperty('--audio-track-bg', theme.audioTrackBg);
        root.style.setProperty('--audio-track-border', theme.audioTrackBorder);
        root.style.setProperty('--audio-thumb-bg', theme.audioThumbBg);
        root.style.setProperty('--audio-thumb-hover', theme.audioThumbHover);
        root.style.setProperty('--audio-timeline-thumb', theme.audioTimelineThumb);
        // Light mode specific variables
        root.style.setProperty('--audio-track-bg-light', this.themes.light.audioTrackBg);
        root.style.setProperty('--audio-track-border-light', this.themes.light.audioTrackBorder);
        root.style.setProperty('--audio-thumb-bg-light', this.themes.light.audioThumbBg);
        root.style.setProperty('--audio-thumb-hover-light', this.themes.light.audioThumbHover);
        root.style.setProperty('--audio-timeline-thumb-light', this.themes.light.audioTimelineThumb);

        // Toggle body class
        document.body.classList.remove('dark-theme', 'light-theme');
        document.body.classList.add(`${themeName}-theme`);

        // Update existing UI elements
        this.updateUIElements(theme);

        // Update toggle button icon if it exists
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            toggleBtn.innerHTML = createLucideIcon(theme.icon, 18);
            toggleBtn.title = themeName === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환';
            toggleBtn.style.color = theme.textPrimary;
        }

        // Update fullscreen button color
        const fullscreenBtn = document.getElementById('fullscreenToggle');
        if (fullscreenBtn) {
            fullscreenBtn.style.color = theme.textPrimary;
        }

        // Update splash star button color
        const splashStarBtn = document.getElementById('splashStarBtn');
        if (splashStarBtn) {
            splashStarBtn.style.color = theme.textPrimary;
        }

        // Update splash modal colors
        const splashModal = document.getElementById('splashModal');
        if (splashModal) {
            const splashContent = splashModal.querySelector('div');
            if (splashContent) {
                splashContent.style.background = theme.bgPrimary;
                splashContent.style.borderColor = theme.accent;
            }
        }
    },

    // Reference to Three.js scene and spheres (set after they are created)
    scene: null,
    spheres: null,
    originalColors: new Map(), // Store original colors for each sphere

    setScene(sceneRef) {
        this.scene = sceneRef;
        // Apply current theme to scene
        this.updateSceneBackground(this.themes[this.currentTheme]);
    },

    setSpheres(spheresRef) {
        this.spheres = spheresRef;
        // Store original colors
        this.storeOriginalColors();
        // Apply current theme to particles
        if (this.currentTheme === 'light') {
            this.invertParticleColors();
        }
    },

    storeOriginalColors() {
        if (!this.spheres) return;
        this.spheres.forEach((sphere, index) => {
            if (!this.originalColors.has(index)) {
                this.originalColors.set(index, {
                    colorStart: sphere.params.colorStart,
                    colorEnd: sphere.params.colorEnd
                });
            }
        });
    },

    // Convert color to dark version for light mode (ensure visibility)
    toDarkColor(hex) {
        // Remove # if present
        hex = hex.replace('#', '');
        // Parse RGB
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);

        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        // If color is too bright, darken it significantly
        if (luminance > 0.5) {
            // Darken the color by reducing RGB values
            r = Math.floor(r * 0.3);
            g = Math.floor(g * 0.3);
            b = Math.floor(b * 0.3);
        } else {
            // Already dark enough, just slightly adjust
            r = Math.floor(r * 0.5);
            g = Math.floor(g * 0.5);
            b = Math.floor(b * 0.5);
        }

        const darkR = r.toString(16).padStart(2, '0');
        const darkG = g.toString(16).padStart(2, '0');
        const darkB = b.toString(16).padStart(2, '0');
        return `#${darkR}${darkG}${darkB}`;
    },

    // Vibrant dark colors for light mode - high saturation, visible on light background
    lightModeColors: [
        { colorStart: '#8B0040', colorEnd: '#00408B' },  // Sphere 1: deep magenta to deep blue
        { colorStart: '#006633', colorEnd: '#663300' },  // Sphere 2: forest green to brown
        { colorStart: '#4B0082', colorEnd: '#008B8B' },  // Sphere 3: indigo to teal
        { colorStart: '#8B4500', colorEnd: '#004500' },  // Sphere 4: dark orange to dark green
        { colorStart: '#660066', colorEnd: '#006666' },  // Sphere 5: purple to cyan
    ],

    invertParticleColors() {
        if (!this.spheres) return;
        this.spheres.forEach((sphere, index) => {
            // Store original if not stored
            if (!this.originalColors.has(index)) {
                this.originalColors.set(index, {
                    colorStart: sphere.params.colorStart,
                    colorEnd: sphere.params.colorEnd
                });
            }

            // Use predefined dark colors for light mode
            const darkColors = this.lightModeColors[index] || this.lightModeColors[0];
            sphere.params.colorStart = darkColors.colorStart;
            sphere.params.colorEnd = darkColors.colorEnd;

            // Force update the geometry colors
            this.forceUpdateSphereColors(sphere);

            // Change blending mode for light mode (Additive doesn't work on light bg)
            if (sphere.material) {
                sphere.material.blending = THREE.NormalBlending;
                sphere.material.opacity = 1.0;
                sphere.material.needsUpdate = true;
            }
        });
    },

    restoreParticleColors() {
        if (!this.spheres) return;
        this.spheres.forEach((sphere, index) => {
            const original = this.originalColors.get(index);
            if (original) {
                sphere.params.colorStart = original.colorStart;
                sphere.params.colorEnd = original.colorEnd;

                // Force update the geometry colors
                this.forceUpdateSphereColors(sphere);

                // Restore blending mode for dark mode
                if (sphere.material) {
                    sphere.material.blending = THREE.AdditiveBlending;
                    sphere.material.opacity = 0.8;
                    sphere.material.needsUpdate = true;
                }
            }
        });
    },

    forceUpdateSphereColors(sphere) {
        if (!sphere || !sphere.geometry || !sphere.colors) return;

        const color1 = new THREE.Color(sphere.params.colorStart);
        const color2 = new THREE.Color(sphere.params.colorEnd);
        const positions = sphere.geometry.attributes.position.array;
        const count = positions.length / 3;

        for (let i = 0; i < count; i++) {
            const t = i / count;
            const color = new THREE.Color().lerpColors(color1, color2, t);
            sphere.colors[i * 3] = color.r;
            sphere.colors[i * 3 + 1] = color.g;
            sphere.colors[i * 3 + 2] = color.b;
        }

        sphere.geometry.attributes.color.needsUpdate = true;
    },

    updateSceneBackground(theme) {
        if (this.scene) {
            const bgColor = theme.name === 'dark' ? 0x000000 : 0xf0f0f0;
            this.scene.background = new THREE.Color(bgColor);
        }
    },

    updateParticleColors(theme) {
        if (theme.name === 'light') {
            this.invertParticleColors();
        } else {
            this.restoreParticleColors();
        }
    },

    updateUIElements(theme) {
        const themeName = this.currentTheme; // Get current theme name
        // Update Three.js scene background
        this.updateSceneBackground(theme);

        // Update particle colors (invert for light mode)
        this.updateParticleColors(theme);

        // Update mainUI
        const mainUI = document.getElementById('mainUI');
        if (mainUI) {
            mainUI.style.background = theme.bgPrimary;
            mainUI.style.borderColor = theme.border;
        }

        // Update audioControls
        const audioControls = document.getElementById('audioControls');
        if (audioControls) {
            audioControls.style.background = theme.bgSecondary;
        }

        // Update all buttons in audioControls
        const buttons = document.querySelectorAll('#audioControls button, #mainUI button:not(#themeToggle):not(#fullscreenToggle)');
        buttons.forEach(btn => {
            if (!btn.closest('.dg')) {
                btn.style.background = theme.buttonBg;
                btn.style.color = theme.textPrimary;
            }
        });

        // Update select elements
        const selects = document.querySelectorAll('#audioControls select');
        selects.forEach(select => {
            select.style.background = theme.buttonBg;
            select.style.color = theme.textPrimary;
        });

        // Update tab buttons
        const tabs = document.querySelectorAll('#mainUI > div:first-child button');
        tabs.forEach(tab => {
            if (tab.id !== 'themeToggle' && tab.id !== 'fullscreenToggle') {
                const accentColor = themeName === 'light' ? '#888888' : '#3263d1';
                const isActive = tab.style.borderBottom && (tab.style.borderBottom.includes(accentColor) || tab.style.borderBottom.includes('#3263d1') || tab.style.borderBottom.includes('#8844ff'));
                if (isActive) {
                    tab.style.borderBottom = `2px solid ${accentColor}`;
                    tab.style.color = theme.textPrimary;
                } else {
                    tab.style.color = theme.textMuted;
                }
            }
        });

        // Update FPS display
        const fpsDisplay = document.getElementById('fpsCounter');
        if (fpsDisplay) {
            // Update background and color based on theme
            if (themeName === 'light') {
                fpsDisplay.style.background = 'transparent';
            } else {
                fpsDisplay.style.background = 'rgba(0, 0, 0, 0.7)';
            }
            // Color will be updated in animate function based on performance
        }

        // Update preset buttons
        const presetButtons = document.querySelectorAll('#presetContent button');
        presetButtons.forEach(btn => {
            if (themeName === 'light') {
                // Gray tone for light mode
                btn.style.background = 'rgba(136, 136, 136, 0.3)';
                btn.style.borderColor = 'rgba(136, 136, 136, 0.5)';
            } else {
                // Blue tone for dark mode
                btn.style.background = 'rgba(50, 99, 209, 0.3)';
                btn.style.borderColor = 'rgba(50, 99, 209, 0.5)';
            }
            btn.style.color = theme.textPrimary;
        });

        // Update sliders
        const sliders = document.querySelectorAll('#presetContent input[type="range"]');
        sliders.forEach(slider => {
            slider.style.setProperty('--slider-bg', theme.sliderBg);
            slider.style.setProperty('--slider-fill', theme.sliderFill);
        });

        // Update labels
        const labels = document.querySelectorAll('#presetContent span, #presetContent label, #presetContent div');
        labels.forEach(label => {
            if (!label.querySelector('button') && !label.querySelector('input')) {
                label.style.color = theme.textPrimary;
            }
        });

        // Force update dat.GUI colors in light mode (remove all purple tones)
        if (themeName === 'light') {
            // Update all folder titles
            const folderTitles = document.querySelectorAll('.dg li.title, .dg .folder-title');
            folderTitles.forEach(title => {
                title.style.background = '#888888 !important';
                title.style.backgroundColor = '#888888';
            });

            // Update all slider fills
            const sliderFills = document.querySelectorAll('.dg .c .slider-fg');
            sliderFills.forEach(fill => {
                fill.style.background = '#888888 !important';
                fill.style.backgroundColor = '#888888';
            });

            // Update any elements with purple background
            const allDGElements = document.querySelectorAll('.dg *');
            allDGElements.forEach(el => {
                const bgColor = window.getComputedStyle(el).backgroundColor;
                // Check if background contains purple tones (rgb values around 136, 68, 255)
                if (bgColor.includes('136') && bgColor.includes('68') && bgColor.includes('255')) {
                    el.style.backgroundColor = '#888888';
                }
            });
        }
    },

    toggle() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    }
};

// Initialize theme system
ThemeManager.init();

// Cleanup function - Remove all old UI elements
function cleanupPreviousElements() {
    // Remove old preset containers (but preserve new tab UI)
    const oldPresetContainers = [
        '#presetContainer', '#presetUI',
        '.preset-container', '.preset-ui'
    ];

    oldPresetContainers.forEach(selector => {
        try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                // Never remove mainUI, presetContent, detailContent
                if (el.id !== 'mainUI' && el.id !== 'presetContent' && el.id !== 'detailContent') {
                    el.remove();
                }
            });
        } catch (e) { }
    });

    // Remove old preset elements by ID pattern, but preserve new UI
    try {
        document.querySelectorAll('[id*="preset"]').forEach(el => {
            if (el.id !== 'presetContent' &&
                !el.closest('#mainUI') && !el.closest('#presetContent') && !el.closest('#detailContent')) {
                el.remove();
            }
        });
    } catch (e) { }

    // NEVER remove GUI elements - they're essential for the detail settings tab
    // The GUI (mainGui) is created and must be preserved
    // Skip GUI removal entirely during cleanup
    // const oldGUI = document.querySelectorAll('.dg.main, .dg.ac, .dg');
    // GUI removal is disabled - we need it for the detail settings tab

    // Remove old control elements (but keep audioControls - it's the new audio UI)
    const oldControls = [
        '.audio-control', '.controls-container',
        '#presetSelect', '#presetInput', '#saveButton', '#resetButton',
        '#deleteButton', '#exportButton', '#importButton'
    ];

    // Only remove old songSelect, playPause, volume if they're NOT inside audioControls
    const oldAudioControls = ['#songSelect', '#playPause', '#volume', '#volumeControl'];
    oldAudioControls.forEach(selector => {
        try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                // Only remove if not inside audioControls
                if (!el.closest('#audioControls')) {
                    el.remove();
                }
            });
        } catch (e) { }
    });

    oldControls.forEach(selector => {
        try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => el.remove());
        } catch (e) { }
    });

    // Remove any divs with old UI IDs or classes (but preserve audioControls, mainUI, and tab UI)
    document.querySelectorAll('div').forEach(div => {
        const id = div.id || '';
        const className = div.className || '';

        // Never remove audioControls, mainUI, or tab UI elements
        if (id === 'audioControls' || id === 'mainUI' || id === 'presetContent' ||
            id === 'detailContent') {
            return;
        }

        // Never remove elements inside mainUI
        if (div.closest('#mainUI')) {
            return;
        }

        if (
            (id.includes('preset') && id !== 'presetContent') ||
            (id.includes('control') && id !== 'audioControls') ||
            (className.includes('preset') && !className.includes('presetContent')) ||
            (className.includes('control') && !className.includes('audioControls'))
        ) {
            // Check if it's not our new UI
            if (div.id !== 'mainUI' && div.id !== 'presetContent' && div.id !== 'detailContent') {
                div.remove();
            }
        }
    });

    // Remove old buttons and selects that are not part of new UI
    document.querySelectorAll('button, select').forEach(el => {
        const id = el.id || '';
        const parent = el.parentElement;

        // Keep buttons/selects that are part of new UI or audioControls
        if (parent && (parent.id === 'mainUI' || parent.id === 'presetContent' || parent.id === 'detailContent' || parent.id === 'audioControls')) {
            return;
        }

        // Remove old preset-related buttons/selects
        if (id.includes('preset') || id.includes('Preset') ||
            (parent && (parent.id.includes('preset') || parent.id.includes('Preset')))) {
            el.remove();
        }
    });
}

// Run cleanup immediately and also hide GUI before it's created
cleanupPreviousElements();

// COLOR PICKER TOGGLE SYSTEM - Show only when clicked, hide when clicking outside
(function setupColorPickerToggle() {
    // Track which picker is currently open
    let currentOpenPicker = null;

    // Function to hide all color pickers by setting inline style
    function hideAllColorPickers() {
        document.querySelectorAll('.selector').forEach(picker => {
            picker.style.cssText = 'display: none !important; visibility: hidden !important;';
        });
        currentOpenPicker = null;
    }

    // Function to show a specific color picker
    function showColorPicker(picker) {
        if (picker) {
            picker.style.cssText = 'display: block !important; visibility: visible !important; position: absolute; z-index: 10000;';
            currentOpenPicker = picker;
        }
    }

    // Function to setup click handlers for color swatches
    function setupColorSwatchClickHandlers() {
        // Find all color controller elements (li.color elements)
        const colorControllers = document.querySelectorAll('li.color');

        colorControllers.forEach(controller => {
            // Skip if already setup
            if (controller.dataset.pickerSetup) return;
            controller.dataset.pickerSetup = 'true';

            // Find the selector (color picker) inside
            const selector = controller.querySelector('.selector');
            if (!selector) return;

            // Hide it initially
            selector.style.cssText = 'display: none !important; visibility: hidden !important;';

            // Find the color preview element (div.c)
            const colorPreview = controller.querySelector('div.c');
            if (!colorPreview) return;

            // Add click handler to toggle picker
            colorPreview.addEventListener('click', (e) => {
                e.stopPropagation();

                // Check if this picker is already open
                const isOpen = currentOpenPicker === selector;

                // Hide all pickers first
                hideAllColorPickers();

                // If it wasn't open, open it now
                if (!isOpen) {
                    showColorPicker(selector);
                }
            });
        });
    }

    // Close pickers when clicking outside
    document.addEventListener('click', (e) => {
        // Check if e.target is a DOM element and has closest method
        if (!e.target || typeof e.target.closest !== 'function') {
            return;
        }
        // Check if click is inside a color picker or color preview
        const isInsideColorPicker = e.target.closest('.selector');
        const isColorPreview = e.target.closest('li.color div.c');

        if (!isInsideColorPicker && !isColorPreview) {
            hideAllColorPickers();
        }
    });

    // Also close on mousedown outside
    document.addEventListener('mousedown', (e) => {
        // Check if e.target is a DOM element and has closest method
        if (!e.target || typeof e.target.closest !== 'function') {
            return;
        }
        const isInsideColorPicker = e.target.closest('.selector');
        const isColorPreview = e.target.closest('li.color div.c');

        if (!isInsideColorPicker && !isColorPreview) {
            hideAllColorPickers();
        }
    });

    // Setup handlers when DOM is ready and when new elements are added
    function initColorPickers() {
        setupColorSwatchClickHandlers();
        // Hide all pickers on init
        hideAllColorPickers();
    }

    // Run setup after a delay to ensure GUI is created
    setTimeout(initColorPickers, 100);
    setTimeout(initColorPickers, 500);
    setTimeout(initColorPickers, 1000);
    setTimeout(initColorPickers, 2000);

    // Also use MutationObserver to catch dynamically added color controllers
    const colorPickerObserver = new MutationObserver((mutations) => {
        setupColorSwatchClickHandlers();
        // Check if any new selectors were added and hide them
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    const selectors = node.querySelectorAll ? node.querySelectorAll('.selector') : [];
                    selectors.forEach(selector => {
                        if (selector !== currentOpenPicker) {
                            selector.style.cssText = 'display: none !important; visibility: hidden !important;';
                        }
                    });
                    if (node.classList && node.classList.contains('selector') && node !== currentOpenPicker) {
                        node.style.cssText = 'display: none !important; visibility: hidden !important;';
                    }
                }
            });
        });
    });

    if (document.body) {
        colorPickerObserver.observe(document.body, { childList: true, subtree: true });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            colorPickerObserver.observe(document.body, { childList: true, subtree: true });
        });
    }
})();

// Add CSS to hide old UI elements initially - must be in head before any elements are created
const hideGUIStyle = document.createElement('style');
hideGUIStyle.id = 'hideGUIStyle';
hideGUIStyle.textContent = `
    /* Hide all old UI elements immediately (but allow in detailContent) */
    .dg.main, .dg.ac, .dg {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
    }
    /* Show GUI when inside detailContent */
    #detailContent .dg.main,
    #detailContent .dg.ac,
    #detailContent .dg {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        pointer-events: auto !important;
    }
    
    
    #presetContainer, #presetUI, .preset-container, #presetContent:not(#presetContent) {
        display: none !important;
    }
    /* Hide any elements with old preset IDs */
    [id*="preset"]:not(#presetContent) {
        display: none !important;
    }
`;
if (document.head) {
    document.head.insertBefore(hideGUIStyle, document.head.firstChild);
} else {
    document.addEventListener('DOMContentLoaded', () => {
        document.head.insertBefore(hideGUIStyle, document.head.firstChild);
    });
}

console.log('Cleanup completed');

// Fixed position GUI and presets
const guiAndPresetsStyleFix = document.createElement('style');
guiAndPresetsStyleFix.textContent = `
    /* Hide GUI initially until moved to tab */
    .dg.main:not(#detailContent .dg.main) {
        display: none !important;
    }
    .dg.main {
        position: static !important;
        width: 100% !important;
        margin: 0 !important;
        z-index: 1 !important;
    }
    .dg.ac {
        z-index: 1 !important;
    }
    #detailContent .dg.main,
    #detailContent .dg-main-in-tab,
    #detailContent [class*="dg"] {
        background: transparent !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        position: static !important;
        width: 100% !important;
        max-width: 100% !important;
    }
    #detailContent .dg.main *:not(.close):not(.close-top):not(.close-button):not(.close-bottom) {
        display: block !important;
        visibility: visible !important;
    }
    #detailContent .dg li {
        display: block !important;
        visibility: visible !important;
        background: rgba(0, 0, 0, 0.3) !important;
    }
    #detailContent .dg li.title {
        background: rgba(50, 99, 209, 0.3) !important;
    }
    body.light-theme #detailContent .dg li.title {
        background: rgba(136, 136, 136, 0.3) !important; /* Gray tone instead of purple */
    }
    #detailContent .dg ul {
        display: block !important;
        visibility: visible !important;
    }
    #detailContent .dg .property-name,
    #detailContent .dg .slider,
    #detailContent .dg input,
    #detailContent .dg select {
        display: inline-block !important;
        visibility: visible !important;
    }
    /* Remove old preset UI */
    #presetContainer, #presetUI, .preset-container {
        display: none !important;
    }
`;
document.head.appendChild(guiAndPresetsStyleFix);

// Remove the hide style after tab UI is created
setTimeout(() => {
    const hideStyle = document.getElementById('hideGUIStyle');
    if (hideStyle && document.getElementById('mainUI')) {
        hideStyle.remove();
    }
}, 1000);

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(ThemeManager.currentTheme === 'dark' ? 0x000000 : 0xf0f0f0);
// Register scene with ThemeManager for theme switching
ThemeManager.setScene(scene);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); // Reverted to 75 FOV
camera.position.z = 2.5; // Reverted to 2.5 for original density

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
    stencil: false,
    depth: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for 120fps performance
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// OrbitControls for mouse rotation
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true; // Smooth camera movement
orbitControls.dampingFactor = 0.05;
orbitControls.enableZoom = true;
orbitControls.enablePan = true;
orbitControls.minDistance = 1.0;
orbitControls.maxDistance = 10.0;
orbitControls.maxPolarAngle = Math.PI; // Allow full rotation

console.log('Scene and renderer initialized');

// Audio setup
let audioContext;
let analyser;
let audioElement;
let sourceNode = null;
let micStream;
let micSource = null;


// Audio Controls Container
const controls = document.createElement('div'); controls.id = 'audioControls';
controls.style.cssText = 'position: fixed; top: 10px; right: 300px; z-index: 1002; background: var(--bg-secondary, rgba(0,0,0,0.7)); padding: 10px; border-radius: 5px; display: flex; flex-direction: column; gap: 10px; align-items: flex-end; min-width: 200px; transition: background-color 0.3s ease;';
document.body.appendChild(controls);

// Add custom styles for range sliders
const style = document.createElement('style');
style.textContent = `
    input[type=range] {
        -webkit-appearance: none;
        width: 100%;
        background: transparent;
    }
    
    input[type=range]:focus {
        outline: none;
    }
    
    /* Dark mode (default) slider styles */
    input[type=range]::-webkit-slider-runnable-track {
        width: 100%;
        height: 8px;
        cursor: pointer;
        background: var(--audio-track-bg, #444);
        border-radius: 4px;
        border: 1px solid var(--audio-track-border, #666);
    }
    
    input[type=range]::-webkit-slider-thumb {
        height: 16px;
        width: 16px;
        border-radius: 50%;
        background: var(--audio-thumb-bg, #0099ff);
        cursor: pointer;
        -webkit-appearance: none;
        margin-top: -5px;
        transition: transform 0.1s, background 0.3s;
    }

    input[type=range]::-webkit-slider-thumb:hover {
        transform: scale(1.2);
        background: var(--audio-thumb-hover, #33bbff);
    }
    
    /* Timeline specific style for bar thumb */
    #timelineControl::-webkit-slider-thumb {
        height: 16px;
        width: 4px; /* Narrow bar */
        border-radius: 1px;
        background: var(--audio-timeline-thumb, #00ffff);
        margin-top: -5px;
    }
    
    #timelineControl::-webkit-slider-thumb:hover {
        transform: scaleY(1.2);
    }
    
    /* Light mode overrides */
    body.light-theme input[type=range]::-webkit-slider-runnable-track {
        background: var(--audio-track-bg-light, #d0d0d0);
        border-color: var(--audio-track-border-light, #bbb);
    }
    
    body.light-theme input[type=range]::-webkit-slider-thumb {
        background: var(--audio-thumb-bg-light, #5577aa);
    }
    
    body.light-theme input[type=range]::-webkit-slider-thumb:hover {
        background: var(--audio-thumb-hover-light, #4466aa);
    }
    
    body.light-theme #timelineControl::-webkit-slider-thumb {
        background: var(--audio-timeline-thumb-light, #5588aa);
    }
`;
document.head.appendChild(style);


// Top Row: Volume, Timeline, Toggle
const topRow = document.createElement('div');
topRow.style.cssText = 'display: flex; align-items: center; gap: 10px;';
controls.appendChild(topRow);

const volumeControl = document.createElement('input');
volumeControl.type = 'range';
volumeControl.min = 0;
volumeControl.max = 1;
volumeControl.step = 0.1;
volumeControl.value = 0.5;
volumeControl.style.width = '100px';
topRow.appendChild(volumeControl);

const timelineControl = document.createElement('input');
timelineControl.id = 'timelineControl';
timelineControl.type = 'range';
timelineControl.min = 0;
timelineControl.max = 100;
timelineControl.step = 1;
timelineControl.value = 0;
timelineControl.style.width = '200px';
topRow.appendChild(timelineControl);

// Audio source toggle buttons
const toggleContainer = document.createElement('div');
toggleContainer.style.cssText = 'display: flex; gap: 5px; align-items: center;';

const micToggle = document.createElement('button');
micToggle.innerHTML = createLucideIcon('check-square', 14) + ' ' + createLucideIcon('mic', 14);
micToggle.style.cssText = 'height: 32px; padding: 5px 8px; border-radius: 3px; background: #444; color: white; border: 1px solid #666; cursor: pointer; display: flex; align-items: center; gap: 4px; box-sizing: border-box;';
toggleContainer.appendChild(micToggle);

const divider = document.createElement('span');
divider.textContent = '|';
divider.style.cssText = 'color: #666; font-size: 12px; height: 32px; display: flex; align-items: center;';
toggleContainer.appendChild(divider);

const playerToggle = document.createElement('button');
playerToggle.innerHTML = createLucideIcon('square', 14) + ' ' + createLucideIcon('music', 14);
playerToggle.style.cssText = 'height: 32px; padding: 5px 8px; border-radius: 3px; background: #444; color: white; border: 1px solid #666; cursor: pointer; display: flex; align-items: center; gap: 4px; box-sizing: border-box;';
toggleContainer.appendChild(playerToggle);

topRow.appendChild(toggleContainer);

// Bottom Row: Song Select, Play Button (Hidden initially if mic is used, or shown if player is default)
const bottomRow = document.createElement('div');
bottomRow.style.cssText = 'display: flex; align-items: center; gap: 5px; width: 100%; justify-content: flex-end;';
controls.appendChild(bottomRow);

const songSelect = document.createElement('select');
songSelect.style.cssText = 'height: 32px; padding: 5px; border-radius: 3px; background: #333; color: white; border: 1px solid #666; flex-grow: 1; max-width: 250px; box-sizing: border-box;';
bottomRow.appendChild(songSelect);

const playPause = document.createElement('button');
playPause.innerHTML = createLucideIcon('play', 16);
playPause.style.cssText = 'height: 32px; padding: 5px 12px; border-radius: 3px; background: #444; color: white; border: 1px solid #666; cursor: pointer; display: flex; align-items: center; justify-content: center; box-sizing: border-box;';
bottomRow.appendChild(playPause);

let usingMic = false;

function updateToggleButtons() {
    if (usingMic) {
        micToggle.innerHTML = createLucideIcon('check-square', 14) + ' ' + createLucideIcon('mic', 14);
        playerToggle.innerHTML = createLucideIcon('square', 14) + ' ' + createLucideIcon('music', 14);
        bottomRow.style.display = 'none';
        volumeControl.style.display = 'none';
        timelineControl.style.display = 'none';
    } else {
        micToggle.innerHTML = createLucideIcon('square', 14) + ' ' + createLucideIcon('mic', 14);
        playerToggle.innerHTML = createLucideIcon('check-square', 14) + ' ' + createLucideIcon('music', 14);
        bottomRow.style.display = 'flex';
        volumeControl.style.display = 'block';
        timelineControl.style.display = 'block';
    }
}


micToggle.onclick = async () => {
    if (!usingMic) {
        await toggleInput();
    }
};

playerToggle.onclick = async () => {
    if (usingMic) {
        await toggleInput();
    }
};

// Initialize button states
updateToggleButtons();

playPause.onclick = togglePlay;
songSelect.onchange = changeSong;

console.log('Controls created');

// Noise generator
const noise = {
    p: new Array(256).fill(0).map((_, i) => i),
    perm: new Array(512),

    init() {
        for (let i = this.p.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.p[i], this.p[j]] = [this.p[j], this.p[i]];
        }
        for (let i = 0; i < 512; i++) {
            this.perm[i] = this.p[i & 255];
        }
    },

    fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); },
    lerp(t, a, b) { return a + t * (b - a); },

    grad(hash, x, y, z) {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h == 12 || h == 14 ? x : z;
        return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
    },

    noise3D(x, y, z) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);

        const u = this.fade(x);
        const v = this.fade(y);
        const w = this.fade(z);

        const A = this.perm[X] + Y;
        const AA = this.perm[A] + Z;
        const AB = this.perm[A + 1] + Z;
        const B = this.perm[X + 1] + Y;
        const BA = this.perm[B] + Z;
        const BB = this.perm[B + 1] + Z;

        return this.lerp(w, this.lerp(v, this.lerp(u, this.grad(this.perm[AA], x, y, z),
            this.grad(this.perm[BA], x - 1, y, z)),
            this.lerp(u, this.grad(this.perm[AB], x, y - 1, z),
                this.grad(this.perm[BB], x - 1, y - 1, z))),
            this.lerp(v, this.lerp(u, this.grad(this.perm[AA + 1], x, y, z - 1),
                this.grad(this.perm[BA + 1], x - 1, y, z - 1)),
                this.lerp(u, this.grad(this.perm[AB + 1], x, y - 1, z - 1),
                    this.grad(this.perm[BB + 1], x - 1, y - 1, z - 1))));
    }
};
noise.init();
console.log('Noise initialized');

// Beat manager
const beatManager = {
    currentWaveRadius: 0,
    waveStrength: 0,
    isWaveActive: false,

    triggerWave(rangeEnergy) {
        const maxEnergy = 255;
        const energyExcess = rangeEnergy - 200;
        this.waveStrength = (energyExcess / (maxEnergy - 200)) * 20.0;
        this.currentWaveRadius = 0;
        this.isWaveActive = true;
    },

    update(deltaTime) {
        if (this.isWaveActive) {
            this.currentWaveRadius += deltaTime * 1.0;
            this.waveStrength *= 0.98;

            if (this.currentWaveRadius > 1.0 || this.waveStrength < 0.1) {
                this.isWaveActive = false;
            }
        }
    },

    getWaveForce(position) {
        if (!this.isWaveActive) return 0;
        const distanceFromCenter = position.length();
        const distanceFromWave = Math.abs(distanceFromCenter - this.currentWaveRadius);
        if (distanceFromWave < 0.1) {
            return this.waveStrength * Math.exp(-distanceFromWave * 10);
        }
        return 0;
    }
};

async function toggleInput() {
    console.log('toggleInput called, usingMic:', usingMic);

    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
    }

    try {
        await audioContext.resume();
    } catch (error) {
        console.error('Failed to resume audio context:', error);
    }

    if (usingMic) {
        usingMic = false;
        updateToggleButtons();





        if (micSource) {
            micSource.disconnect();
            micSource = null;
        }

        if (sourceNode) {
            sourceNode.connect(analyser);
        }
        analyser.connect(audioContext.destination);

    } else {
        usingMic = true;
        updateToggleButtons();





        // Check if getUserMedia is available
        let getUserMedia = null;

        console.log('Checking for getUserMedia support...');
        console.log('navigator.mediaDevices:', navigator.mediaDevices);
        console.log('navigator.getUserMedia:', navigator.getUserMedia);
        console.log('navigator.webkitGetUserMedia:', navigator.webkitGetUserMedia);

        // Try modern API first
        if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
            console.log('Using modern navigator.mediaDevices.getUserMedia');
            getUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
        }
        // Try legacy APIs
        else if (navigator.getUserMedia) {
            console.log('Using legacy navigator.getUserMedia');
            getUserMedia = (constraints) => {
                return new Promise((resolve, reject) => {
                    navigator.getUserMedia(constraints, resolve, reject);
                });
            };
        } else if (navigator.webkitGetUserMedia) {
            console.log('Using legacy navigator.webkitGetUserMedia');
            getUserMedia = (constraints) => {
                return new Promise((resolve, reject) => {
                    navigator.webkitGetUserMedia(constraints, resolve, reject);
                });
            };
        } else if (navigator.mozGetUserMedia) {
            console.log('Using legacy navigator.mozGetUserMedia');
            getUserMedia = (constraints) => {
                return new Promise((resolve, reject) => {
                    navigator.mozGetUserMedia(constraints, resolve, reject);
                });
            };
        }

        if (!getUserMedia) {
            const errorMsg = '이 브라우저는 마이크 접근을 지원하지 않습니다.\n\n' +
                '가능한 해결 방법:\n' +
                '1. HTTPS 연결 사용 (localhost는 HTTP에서도 작동 가능)\n' +
                '2. Chrome, Firefox, Edge 등 최신 브라우저 사용\n' +
                '3. 브라우저 설정에서 마이크 권한 확인';
            console.error("getUserMedia not available. navigator:", navigator);
            usingMic = false;
            updateToggleButtons();
            alert(errorMsg);
            return;
        }

        try {
            micStream = await getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: false
                }
            });

            if (sourceNode) {
                sourceNode.disconnect();
            }

            micSource = audioContext.createMediaStreamSource(micStream);
            micSource.connect(analyser);
            try { analyser.disconnect(audioContext.destination); } catch (e) { }

            console.log('Microphone is active');

        } catch (error) {
            console.error("Microphone access failed:", error.name, error.message);
            usingMic = false;
            updateToggleButtons();

            let errorMessage = '마이크 접근 실패';
            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                errorMessage = '마이크 권한이 거부되었습니다.\n\n브라우저 설정에서 마이크 권한을 허용해주세요.';
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                errorMessage = '마이크를 찾을 수 없습니다.\n\n마이크가 연결되어 있는지 확인해주세요.';
            } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                errorMessage = '마이크에 접근할 수 없습니다.\n\n다른 애플리케이션에서 마이크를 사용 중일 수 있습니다.';
            } else {
                errorMessage = `마이크 접근 실패: ${error.message || error.name}\n\n브라우저에서 마이크 권한을 허용해주세요.`;
            }

            alert(errorMessage);
        }
    }
}

async function initAudio() {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;
        }

        if (!usingMic) {
            if (!audioElement) {
                audioElement = document.createElement('audio');
                audioElement.crossOrigin = "anonymous";
                audioElement.volume = volumeControl.value;
            }

            try {
                if (!sourceNode) {
                    sourceNode = audioContext.createMediaElementSource(audioElement);
                    sourceNode.connect(analyser);
                    analyser.connect(audioContext.destination);
                } else {
                    sourceNode.disconnect();
                    sourceNode.connect(analyser);
                }

            } catch (error) {
                console.error("Failed to connect audio element to analyser:", error.name, error.message);
            }

            // Hardcoded song list - add your songs here
            const songs = [
                { path: 'Songs/sample1.mp3', name: 'sample1.mp3' },
                { path: 'Songs/sample2.mp3', name: 'sample2.mp3' },
                { path: 'Songs/sample3.mp3', name: 'sample3.mp3' },
                { path: 'Songs/sample4.mp3', name: 'sample4.mp3' }
            ];

            songSelect.innerHTML = '';

            songs.forEach(song => {
                const option = document.createElement('option');
                option.value = song.path;
                option.textContent = song.name;
                songSelect.appendChild(option);
            });

            if (songs.length > 0 && !audioElement.src) {
                audioElement.src = songs[0].path;
            }

            volumeControl.oninput = e => {
                if (audioElement) {
                    audioElement.volume = e.target.value;
                }
            };

            setupTimelineControl();
        }

        console.log('Audio initialized');

    } catch (error) {
        console.error("Audio initialization failed:", error);
    }
}

function getAudioData(sphere) {
    if (!analyser || (!audioContext && !usingMic)) return {
        average: 0,
        frequencies: new Float32Array(),
        peakDetected: false,
        rangeEnergy: 0
    };

    try {
        const frequencies = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(frequencies);

        const gainMultiplier = sphere.params.gainMultiplier;
        frequencies.forEach((value, index) => {
            frequencies[index] = Math.min(value * gainMultiplier, 255);
        });

        const frequencyToIndex = (frequency) => Math.round(frequency / (audioContext.sampleRate / 2) * analyser.frequencyBinCount);

        const minFreqIndex = frequencyToIndex(sphere.params.minFrequency);
        const maxFreqIndex = frequencyToIndex(sphere.params.maxFrequency);
        const frequencyRange = frequencies.slice(minFreqIndex, maxFreqIndex + 1);
        const rangeEnergy = frequencyRange.reduce((a, b) => a + b, 0) / frequencyRange.length;

        const minFreqBeatIndex = frequencyToIndex(sphere.params.minFrequencyBeat); // Nové pásmo pro beaty
        const maxFreqBeatIndex = frequencyToIndex(sphere.params.maxFrequencyBeat);
        const frequencyRangeBeat = frequencies.slice(minFreqBeatIndex, maxFreqBeatIndex + 1);
        const rangeEnergyBeat = frequencyRangeBeat.reduce((a, b) => a + b, 0) / frequencyRangeBeat.length;

        sphere.peakDetection.energyHistory.push(rangeEnergy);
        if (sphere.peakDetection.energyHistory.length > sphere.peakDetection.historyLength) {
            sphere.peakDetection.energyHistory.shift();
        }

        const averageEnergy = sphere.peakDetection.energyHistory.reduce((a, b) => a + b, 0) /
            sphere.peakDetection.energyHistory.length;

        const now = performance.now();
        const peakDetected = rangeEnergy > averageEnergy * sphere.params.peakSensitivity &&
            now - sphere.peakDetection.lastPeakTime > sphere.peakDetection.minTimeBetweenPeaks;

        if (peakDetected) {
            sphere.peakDetection.lastPeakTime = now;
            console.log(`Sphere ${sphere.index + 1} PEAK DETECTED! Energy: ${rangeEnergy}, Average: ${averageEnergy} `);
        }


        return {
            average: rangeEnergy / 255,
            frequencies,
            peakDetected,
            rangeEnergy: rangeEnergy,
            rangeEnergyBeat: rangeEnergyBeat
        };

    } catch (error) {
        console.error("Audio analysis failed:", error);
        return {
            average: 0,
            frequencies: new Float32Array(),
            peakDetected: false,
            rangeEnergy: 0
        };
    }
}


function updateTimeline() {
    if (audioElement && !audioElement.paused && audioElement.duration) {
        const percent = (audioElement.currentTime / audioElement.duration) * 100;
        timelineControl.value = percent;
    }
}

function setupTimelineControl() {
    audioElement.addEventListener('loadedmetadata', () => {
        timelineControl.value = 0;
        console.log('Song duration:', audioElement.duration);
    });

    audioElement.addEventListener('timeupdate', updateTimeline);

    timelineControl.addEventListener('input', (e) => {
        if (audioElement.duration) {
            const time = (e.target.value / 100) * audioElement.duration;
            audioElement.currentTime = time;
        }
    });
}

function togglePlay() {
    if (usingMic) return;

    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    if (!sourceNode && audioElement) {
        try {
            sourceNode = audioContext.createMediaElementSource(audioElement);
            sourceNode.connect(analyser);
            analyser.connect(audioContext.destination);
        } catch (error) {
            console.error("Audio connection failed:", error);
            return;
        }
    }

    if (audioElement.paused) {
        audioElement.play()
            .then(() => playPause.innerHTML = createLucideIcon('pause', 16))
            .catch(error => console.error("Playback failed:", error));
    } else {
        audioElement.pause();
        playPause.innerHTML = createLucideIcon('play', 16);
    }
}

function changeSong() {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    audioElement.src = songSelect.value;
    audioElement.load();

    if (!sourceNode) {
        try {
            sourceNode = audioContext.createMediaElementSource(audioElement);
            sourceNode.connect(analyser);
            analyser.connect(audioContext.destination);
        } catch (error) {
            console.error("Audio connection failed:", error);
            return;
        }
    }

    audioElement.play()
        .then(() => {
            playPause.innerHTML = createLucideIcon('pause', 16);
            console.log("Playback started");
        })
        .catch(error => console.error("Playback failed:", error));

    timelineControl.value = 0;
}

function generateNewNoiseScale(params, lastNoiseScale) {
    if (!params.dynamicNoiseScale) {
        return params.noiseScale;
    }

    let { minNoiseScale, maxNoiseScale, noiseStep } = params;

    // --- PŘIDANÁ POJISTKA A DROBNÉ LOGY ---
    if (minNoiseScale >= maxNoiseScale) {
        console.warn(`Fixing minNoiseScale(${minNoiseScale}) >= maxNoiseScale(${maxNoiseScale}).`);
        maxNoiseScale = minNoiseScale + 0.1; // Natvrdo posunout, aby byl rozdíl aspoň 0.1
    }

    let range = maxNoiseScale - minNoiseScale;
    if (range < 0.1) {
        console.warn(`Range < 0.1 => Forcing minimal range = 0.1`);
        range = 0.1;
        maxNoiseScale = minNoiseScale + range;
    }

    if (noiseStep > range) {
        console.warn(`noiseStep(${noiseStep}) > range(${range}) => Forcing noiseStep = range / 2`);
        noiseStep = range / 2;
    }

    // LastNoiseScale valid range
    lastNoiseScale = Math.max(minNoiseScale, Math.min(lastNoiseScale, maxNoiseScale));

    const stepsUp = Math.floor((maxNoiseScale - lastNoiseScale) / noiseStep);
    const stepsDown = Math.floor((lastNoiseScale - minNoiseScale) / noiseStep);

    if (stepsUp === 0 && stepsDown === 0) {
        return lastNoiseScale;
    }

    const direction = Math.random() < 0.5 && stepsDown > 0 ? -1 : 1;
    const steps = direction === 1
        ? Math.floor(Math.random() * (stepsUp + 1))
        : Math.floor(Math.random() * (stepsDown + 1));

    let newValue = lastNoiseScale + direction * steps * noiseStep;

    newValue = Math.max(minNoiseScale, Math.min(newValue, maxNoiseScale));

    return newValue;
}

// Reinit particles
function reinitializeParticlesForSphere(sphere, sphereParams, sphereGeometry) {
    console.log(`Reinitializing sphere ${sphere.index + 1} with ${sphereParams.particleCount} particles`);

    const newPositions = new Float32Array(sphereParams.particleCount * 3);
    const newColors = new Float32Array(sphereParams.particleCount * 3);
    const newVelocities = new Float32Array(sphereParams.particleCount * 3);
    const newBasePositions = new Float32Array(sphereParams.particleCount * 3);
    const newLifetimes = new Float32Array(sphereParams.particleCount);
    const newMaxLifetimes = new Float32Array(sphereParams.particleCount);
    const newBeatEffects = new Float32Array(sphereParams.particleCount);

    for (let i = 0; i < sphereParams.particleCount; i++) {
        const i3 = i * 3;
        const pos = getInitialParticlePosition(sphereParams);
        const x = pos.x;
        const y = pos.y;
        const z = pos.z;

        newPositions[i3] = x;
        newPositions[i3 + 1] = y;
        newPositions[i3 + 2] = z;

        newBasePositions[i3] = x;
        newBasePositions[i3 + 1] = y;
        newBasePositions[i3 + 2] = z;

        newVelocities[i3] = 0;
        newVelocities[i3 + 1] = 0;
        newVelocities[i3 + 2] = 0;

        const lt = Math.random() * sphereParams.particleLifetime;
        newLifetimes[i] = lt;
        newMaxLifetimes[i] = lt;

        newBeatEffects[i] = 0;
    }

    sphereGeometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
    sphereGeometry.setAttribute('color', new THREE.BufferAttribute(newColors, 3));

    updateColorsForSphere(sphereParams, sphereGeometry, newColors);

    return {
        newPositions,
        newColors,
        newVelocities,
        newBasePositions,
        newLifetimes,
        newMaxLifetimes,
        newBeatEffects
    };
}

function updateColorsForSphere(sphereParams, sphereGeometry, sphereColors) {
    const color1 = new THREE.Color(sphereParams.colorStart);
    const color2 = new THREE.Color(sphereParams.colorEnd);

    for (let i = 0; i < sphereParams.particleCount; i++) {
        const t = i / sphereParams.particleCount;
        sphereColors[i * 3] = color1.r * (1 - t) + color2.r * t;
        sphereColors[i * 3 + 1] = color1.g * (1 - t) + color2.g * t;
        sphereColors[i * 3 + 2] = color1.b * (1 - t) + color2.b * t;
    }
    sphereGeometry.attributes.color.needsUpdate = true;
}


// Main GUI panel
const mainGui = new dat.GUI();

// Immediately hide GUI to prevent flash of old UI
setTimeout(() => {
    const guiElement = document.querySelector('.dg.main');
    if (guiElement) {
        guiElement.style.display = 'none';
        guiElement.style.visibility = 'hidden';
        guiElement.style.opacity = '0';
    }
}, 0);

// FOG PARAMS
const fogParams = {
    enabled: true,
    color: '#000000',
    near: 2.7,
    far: 3.7,
};

// After fog update
function updateFog() {
    if (!fogParams.enabled) {
        scene.fog = null;
    } else {
        const color = new THREE.Color(fogParams.color);
        scene.fog = new THREE.Fog(color, fogParams.near, fogParams.far);

    }
    renderer.render(scene, camera); // Překreslení scény
}

// Fog init
if (fogParams.enabled) {
    updateFog();
}

// Adding to main GUI
mainGui.add(fogParams, 'enabled').name('Fog Enabled').onChange(updateFog);
const fogColorController = mainGui.addColor(fogParams, 'color').name('Fog Color').onChange(updateFog);
// Immediately close color picker if it opened
setTimeout(() => {
    if (typeof closeColorPickers === 'function') closeColorPickers();
    if (fogColorController && typeof fogColorController.close === 'function') {
        try { fogColorController.close(); } catch (e) { }
    }
}, 50);
mainGui.add(fogParams, 'near', 0.1, 5, 0.1).name('Fog Near').onChange(updateFog);
mainGui.add(fogParams, 'far', 0.1, 5, 0.1).name('Fog Far').onChange(updateFog);

// Main GUI particleCount (reduced default for better performance)
mainGui.add({
    globalParticleCount: 5000
}, 'globalParticleCount', 1000, 50000).step(1000).onChange(value => {
    spheres.forEach((sphere, index) => {
        sphere.params.particleCount = value;
        const {
            newPositions,
            newColors,
            newVelocities,
            newBasePositions,
            newLifetimes,
            newMaxLifetimes,
            newBeatEffects
        } = reinitializeParticlesForSphere(
            sphere, sphere.params, sphere.geometry
        );

        sphere.positions = newPositions;
        sphere.colors = newColors;
        sphere.velocities = newVelocities;
        sphere.basePositions = newBasePositions;
        sphere.lifetimes = newLifetimes;
        sphere.maxLifetimes = newMaxLifetimes;
        sphere.beatEffects = newBeatEffects;

        sphere.geometry.attributes.position.needsUpdate = true;
        sphere.geometry.attributes.color.needsUpdate = true;

        const sphereFolder = mainGui.__folders[`Sphere ${index + 1} `];
        if (sphereFolder) {
            const particleCountController = sphereFolder.__controllers.find(controller => controller.property === 'particleCount');
            if (particleCountController) {
                particleCountController.updateDisplay();
            }
        }
    });
});

window.spheres = [];

function getInitialParticlePosition(params) {
    const shape = params.shape || 'sphere';
    const radius = THREE.MathUtils.lerp(0, params.sphereRadius, params.innerSphereRadius);

    let x, y, z;

    if (shape === 'box') {
        // Uniform distribution in a box (wider for rectangular screens)
        x = (Math.random() - 0.5) * radius * 3.5;
        y = (Math.random() - 0.5) * radius * 2.0;
        z = (Math.random() - 0.5) * radius * 1.0;
    } else if (shape === 'horizontal') {
        // Uniform distribution in a wide horizontal belt
        x = (Math.random() - 0.5) * radius * 5.0;
        y = (Math.random() - 0.5) * radius * 0.5;
        z = (Math.random() - 0.5) * radius * 1.0;
    } else if (shape === 'vortex') {
        // Distribution in a cylinder
        const theta = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * radius;
        x = r * Math.cos(theta);
        z = r * Math.sin(theta);
        y = (Math.random() - 0.5) * radius * 2.5;
    } else {
        // Default: Sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = Math.cbrt(Math.random()) * radius;
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
    }

    return { x, y, z };
}

function createSphereVisualization(index) {

    // Spheres default frequencies
    const defaultFrequencies = [
        { minFrequency: 20, maxFrequency: 80 },  // Sub-bass
        { minFrequency: 120, maxFrequency: 250 }, // Bass
        { minFrequency: 250, maxFrequency: 800 }, // Mid
        { minFrequency: 1000, maxFrequency: 4000 }, // High mid
        { minFrequency: 5000, maxFrequency: 10000 } // High
    ];

    const sphereParams = {
        enabled: index === 0,
        sphereRadius: 1.0,
        innerSphereRadius: 0.25,
        shape: 'sphere',
        rotationSpeed: 0.001,
        rotationSpeedMin: 0,
        rotationSpeedMax: 0.065,
        rotationSmoothness: 0.3,
        particleCount: 5000, // Reduced for better performance
        particleSize: 0.003,
        particleLifetime: 3.0,
        minFrequency: defaultFrequencies[index]?.minFrequency || 0,
        maxFrequency: defaultFrequencies[index]?.maxFrequency || 22050,
        minFrequencyBeat: defaultFrequencies[index]?.minFrequency || 0,
        maxFrequencyBeat: defaultFrequencies[index]?.maxFrequency || 22050,
        noiseScale: 4.0,
        dynamicNoiseScale: true,
        minNoiseScale: 0.5,
        maxNoiseScale: 5.0,
        noiseStep: 0.2,
        noiseSpeed: 0.1,
        turbulenceStrength: 0.005,
        colorStart: '#ff3366',
        colorEnd: '#3366ff',
        volumeChangeThreshold: 0.1,
        peakSensitivity: 1.1,
        beatThreshold: 200,
        baseWaveStrength: 20.0,
        beatStrength: 0.01,
        gainMultiplier: 1,
        visualStyle: 'modern',
        shape: 'sphere'
    };

    const sphereGeometry = new THREE.BufferGeometry();
    const spherePositions = new Float32Array(sphereParams.particleCount * 3);
    const sphereColors = new Float32Array(sphereParams.particleCount * 3);
    const velocities = new Float32Array(sphereParams.particleCount * 3);
    const basePositions = new Float32Array(sphereParams.particleCount * 3);
    const lifetimes = new Float32Array(sphereParams.particleCount);
    const maxLifetimes = new Float32Array(sphereParams.particleCount);
    const beatEffects = new Float32Array(sphereParams.particleCount);

    // Init particles
    for (let i = 0; i < sphereParams.particleCount; i++) {
        const i3 = i * 3;
        const radius = THREE.MathUtils.lerp(0, sphereParams.sphereRadius, sphereParams.innerSphereRadius);
        const pos = getInitialParticlePosition(sphereParams);
        const x = pos.x;
        const y = pos.y;
        const z = pos.z;

        spherePositions[i3] = x;
        spherePositions[i3 + 1] = y;
        spherePositions[i3 + 2] = z;

        basePositions[i3] = x;
        basePositions[i3 + 1] = y;
        basePositions[i3 + 2] = z;

        velocities[i3] = 0;
        velocities[i3 + 1] = 0;
        velocities[i3 + 2] = 0;

        const lt = Math.random() * sphereParams.particleLifetime;
        lifetimes[i] = lt;
        maxLifetimes[i] = lt;

        beatEffects[i] = 0;
    }

    sphereGeometry.setAttribute('position', new THREE.BufferAttribute(spherePositions, 3));
    sphereGeometry.setAttribute('color', new THREE.BufferAttribute(sphereColors, 3));

    const sphereMaterial = new THREE.PointsMaterial({
        size: sphereParams.particleSize,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        fog: true
    });

    const sphereParticleSystem = new THREE.Points(sphereGeometry, sphereMaterial);
    scene.add(sphereParticleSystem);

    // Sphere visibility `enabled`
    sphereParticleSystem.visible = sphereParams.enabled;

    const sphere = {
        index: index,
        params: sphereParams,
        geometry: sphereGeometry,
        colors: sphereColors,
        material: sphereMaterial,
        particleSystem: sphereParticleSystem,
        positions: spherePositions,
        velocities: velocities,
        basePositions: basePositions,
        lifetimes: lifetimes,
        maxLifetimes: maxLifetimes,
        beatEffects: beatEffects,
        lastNoiseScale: sphereParams.noiseScale,
        lastValidVolume: 0,
        lastRotationSpeed: 0
    };

    sphere.peakDetection = {
        energyHistory: [],
        historyLength: 30,
        lastPeakTime: 0,
        minTimeBetweenPeaks: 200
    };

    // Colors update
    updateColorsForSphere(sphereParams, sphereGeometry, sphereColors);

    // GUI folder
    const sphereFolder = mainGui.addFolder('Sphere ' + (index + 1));

    sphereFolder.add(sphere.params, 'particleCount', 1000, 100000).step(1000)
        .onChange(() => {
            const {
                newPositions,
                newColors,
                newVelocities,
                newBasePositions,
                newLifetimes,
                newMaxLifetimes,
                newBeatEffects
            } = reinitializeParticlesForSphere(
                sphere, sphere.params, sphere.geometry
            );

            sphere.positions = newPositions;
            sphere.colors = newColors;
            sphere.velocities = newVelocities;
            sphere.basePositions = newBasePositions;
            sphere.lifetimes = newLifetimes;
            sphere.maxLifetimes = newMaxLifetimes;
            sphere.beatEffects = newBeatEffects;

            sphere.geometry.attributes.position.needsUpdate = true;
            sphere.geometry.attributes.color.needsUpdate = true;
        });

    sphereFolder.add(sphere.params, 'particleSize', 0.001, 0.01).step(0.001)
        .onChange(value => {
            sphere.material.size = value;
        });

    if (index === 0) {
        sphereFolder.add({
            copyToOthers: () => {
                for (let i = 1; i < spheres.length; i++) {
                    Object.assign(spheres[i].params, JSON.parse(JSON.stringify(sphere.params)));

                    const {
                        newPositions,
                        newColors,
                        newVelocities,
                        newBasePositions,
                        newLifetimes,
                        newMaxLifetimes,
                        newBeatEffects
                    } = reinitializeParticlesForSphere(
                        spheres[i], spheres[i].params, spheres[i].geometry
                    );

                    spheres[i].positions = newPositions;
                    spheres[i].colors = newColors;
                    spheres[i].velocities = newVelocities;
                    spheres[i].basePositions = newBasePositions;
                    spheres[i].lifetimes = newLifetimes;
                    spheres[i].maxLifetimes = newMaxLifetimes;
                    spheres[i].beatEffects = newBeatEffects;

                    spheres[i].geometry.attributes.position.needsUpdate = true;
                    spheres[i].geometry.attributes.color.needsUpdate = true;


                    spheres[i].particleSystem.visible = spheres[i].params.enabled;

                    const targetFolder = mainGui.__folders[`Sphere ${i + 1} `];
                    if (targetFolder) {
                        targetFolder.__controllers.forEach(controller => controller.updateDisplay());
                    }
                }
                mainGui.updateDisplay();
                console.log('Parameters copied from Sphere 1 to Spheres 2-5.');
            }
        }, 'copyToOthers').name('Copy to Spheres 2-5');
    }
    sphereFolder.add(sphere.params, 'particleLifetime', 1, 20).step(1);

    sphereFolder.add(sphere.params, 'sphereRadius', 0.05, 3.0).step(0.05);
    sphereFolder.add(sphere.params, 'shape', ['sphere', 'box', 'vortex', 'horizontal']).name('Boundary Shape');
    sphereFolder.add(sphere.params, 'innerSphereRadius', 0, 1).step(0.01)
        .onChange(() => {
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
        });

    sphereFolder.add(sphere.params, 'rotationSpeedMin', 0, 0.02).step(0.001);
    sphereFolder.add(sphere.params, 'rotationSpeedMax', 0, 0.1).step(0.001);
    sphereFolder.add(sphere.params, 'rotationSmoothness', 0.01, 1).step(0.01);
    sphereFolder.add(sphere.params, 'volumeChangeThreshold', 0.01, 0.2).step(0.01);

    sphereFolder.add(sphereParams, 'minFrequency', 0, 22050).step(1).name('Min Frequency (Hz)')
        .onChange(value => sphereParams.minFrequency = value);
    sphereFolder.add(sphereParams, 'maxFrequency', 0, 22050).step(1).name('Max Frequency (Hz)')
        .onChange(value => sphereParams.maxFrequency = value);

    // GUI defaults
    const minFreqController = sphereFolder.__controllers.find(c => c.property === 'minFrequency');
    const maxFreqController = sphereFolder.__controllers.find(c => c.property === 'maxFrequency');
    if (minFreqController) minFreqController.setValue(sphereParams.minFrequency);
    if (maxFreqController) maxFreqController.setValue(sphereParams.maxFrequency);

    sphereFolder.add(sphere.params, 'noiseScale', 0.1, 10.0).step(0.1);
    sphereFolder.add(sphere.params, 'minNoiseScale', 0.0, 10.0).step(0.1).name('Min NoiseScale')
        .onChange(() => {
            if (sphere.params.minNoiseScale > sphere.params.maxNoiseScale) {
                sphere.params.minNoiseScale = sphere.params.maxNoiseScale;
            }
            updateNoiseStep(sphere.params);
        });
    sphereFolder.add(sphere.params, 'maxNoiseScale', 0.0, 10.0).step(0.1).name('Max NoiseScale')
        .onChange(() => {
            if (sphere.params.maxNoiseScale < sphere.params.minNoiseScale) {
                sphere.params.maxNoiseScale = sphere.params.minNoiseScale;
            }
            updateNoiseStep(sphere.params);
        });
    sphereFolder.add(sphere.params, 'noiseStep', 0.1, 5.0).step(0.1).name('Noise Step')
        .onChange(() => {
            updateNoiseStep(sphere.params);
        });
    function updateNoiseStep(params) {
        const range = params.maxNoiseScale - params.minNoiseScale;
        if (params.noiseStep > range) {
            params.noiseStep = range / 2;
        }
    }
    sphereFolder.add(sphere.params, 'noiseSpeed', 0, 1.0).step(0.01);

    sphereFolder.add(sphere.params, 'peakSensitivity', 1.01, 2).step(0.01);
    sphereFolder.add(sphere.peakDetection, 'historyLength', 10, 1200).step(1).name('History Length');
    sphereFolder.add(sphere.peakDetection, 'minTimeBetweenPeaks', 50, 5000).step(10).name('Min Time Between Peaks');

    sphereFolder.add(sphere.params, 'turbulenceStrength', 0, 0.03).step(0.0001);
    const colorStartController = sphereFolder.addColor(sphere.params, 'colorStart')
        .onChange(() => updateColorsForSphere(sphere.params, sphere.geometry, sphere.colors));
    const colorEndController = sphereFolder.addColor(sphere.params, 'colorEnd')
        .onChange(() => updateColorsForSphere(sphere.params, sphere.geometry, sphere.colors));
    // Immediately close color pickers if they opened
    setTimeout(() => {
        if (typeof closeColorPickers === 'function') closeColorPickers();
        if (colorStartController && typeof colorStartController.close === 'function') {
            try { colorStartController.close(); } catch (e) { }
        }
        if (colorEndController && typeof colorEndController.close === 'function') {
            try { colorEndController.close(); } catch (e) { }
        }
    }, 50);

    sphereFolder.add(sphereParams, 'minFrequencyBeat', 0, 22050).step(1).name('Min Freq Beat (Hz)')
        .onChange(value => sphereParams.minFrequencyBeat = value);
    sphereFolder.add(sphereParams, 'maxFrequencyBeat', 0, 22050).step(1).name('Max Freq Beat (Hz)')
        .onChange(value => sphereParams.maxFrequencyBeat = value);

    sphereFolder.add(sphere.params, 'beatThreshold', 50, 255).step(1);
    sphereFolder.add(sphere.params, 'beatStrength', 0, 0.05).step(0.001);
    sphereFolder.add(sphere.params, 'gainMultiplier', 1.0, 3.0).step(0.1);
    sphereFolder.add(sphere.params, 'dynamicNoiseScale');
    sphereFolder.add(sphere.params, 'enabled').onChange(value => {
        sphere.particleSystem.visible = value;
    });
    sphereFolder.add(sphere.params, 'visualStyle', ['modern', 'original']).name('Visual Style');

    sphereFolder.close();

    return sphere;
}

for (let i = 0; i < 5; i++) {
    const sphereVis = createSphereVisualization(i);
    spheres.push(sphereVis);
}

// Register spheres with ThemeManager for color inversion on theme change
ThemeManager.setSpheres(spheres);


// Only sphere 1 allowed
spheres.forEach((sphere, index) => {
    if (index !== 0) {
        sphere.params.enabled = false;
        sphere.particleSystem.visible = false;
    }
});

function getSmoothVolume(params, lastValidVolume, volumeChangeThreshold) {
    if (!analyser) return { volume: 0, shouldUpdate: false };

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
    }
    const average = sum / bufferLength;
    const normalizedVolume = average / 255;

    let shouldUpdate = true;
    if (lastValidVolume === 0) {
        lastValidVolume = normalizedVolume;
    } else {
        const change = Math.abs(normalizedVolume - lastValidVolume);
        if (change <= volumeChangeThreshold) {
            lastValidVolume = normalizedVolume;
        } else {
            shouldUpdate = false;
        }
    }

    return { volume: lastValidVolume, shouldUpdate };
}

let lastTime = 0;
// Detect display refresh rate (60Hz, 120Hz, etc.)
let targetFPS = 120; // Default
let frameCount = 0;
let fpsCheckTime = performance.now();
let currentFPS = 0;

// FPS Display
const fpsDisplay = document.createElement('div');
fpsDisplay.id = 'fpsCounter';
fpsDisplay.style.cssText = `
    position: fixed;
    top: 10px;
    left: 10px;
    z-index: 10000;
    background: rgba(0, 0, 0, 0.7);
    color: #3263d1;
    padding: 8px 12px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    font-weight: bold;
    user-select: none;
    pointer-events: none;
`;
document.body.appendChild(fpsDisplay);

// Update FPS display style based on theme
function updateFPSDisplayStyle() {
    const isLightMode = window.ThemeManager && window.ThemeManager.currentTheme === 'light';
    if (isLightMode) {
        fpsDisplay.style.background = 'transparent';
    } else {
        fpsDisplay.style.background = 'rgba(0, 0, 0, 0.7)';
    }
}

function animate(currentTime) {
    requestAnimationFrame(animate);

    if (lastTime === 0) {
        lastTime = currentTime;
        return;
    }
    const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
    lastTime = currentTime;

    // Calculate and display FPS (optimized for 60Hz/120Hz/144Hz)
    frameCount++;
    const timeSinceLastCheck = currentTime - fpsCheckTime;

    if (timeSinceLastCheck >= 500) { // Update every 500ms for stability
        const elapsed = timeSinceLastCheck / 1000;
        currentFPS = Math.round(frameCount / elapsed);

        // Auto-detect refresh rate
        if (currentFPS > 130) targetFPS = 144;
        else if (currentFPS > 100) targetFPS = 120;
        else if (currentFPS > 80) targetFPS = 90;
        else if (currentFPS > 50) targetFPS = 60;
        else targetFPS = Math.max(30, Math.round(currentFPS / 10) * 10);

        fpsDisplay.textContent = `FPS: ${currentFPS} / ${targetFPS}Hz`;

        // Color coding based on performance
        const fpsRatio = currentFPS / targetFPS;
        const isLightMode = window.ThemeManager && window.ThemeManager.currentTheme === 'light';

        if (fpsRatio >= 0.9) {
            // Good performance - bright blue (#3263d1)
            fpsDisplay.style.color = isLightMode ? '#66aa66' : '#3263d1';
        } else if (fpsRatio >= 0.7) {
            // Medium performance - medium blue (slightly darker)
            fpsDisplay.style.color = isLightMode ? '#aaaa66' : '#4a7ae8';
        } else {
            // Low performance - darker blue
            fpsDisplay.style.color = isLightMode ? '#aa6666' : '#1e4fa8';
        }

        frameCount = 0;
        fpsCheckTime = currentTime;
    }

    // Beat wave update
    beatManager.update(deltaTime);

    // Sphere update
    spheres.forEach(sphere => {
        if (!sphere.params.enabled) return;

        const audioData = getAudioData(sphere);

        if (audioData.peakDetected) {
            if (sphere.params.dynamicNoiseScale) {
                sphere.params.noiseScale = generateNewNoiseScale(
                    sphere.params,
                    sphere.lastNoiseScale
                );
                sphere.lastNoiseScale = sphere.params.noiseScale;
            }
        }

        const { params, geometry, positions, velocities, basePositions, lifetimes, maxLifetimes, beatEffects } = sphere;

        // Beat detection sphere
        const beatDetected = audioData.rangeEnergyBeat > params.beatThreshold;

        // Beat wave sphere
        if (beatDetected && !beatManager.isWaveActive && params.beatStrength > 0) {
            beatManager.triggerWave(audioData.rangeEnergyBeat);
        }

        // Update particles - optimized for performance
        const pc = params.particleCount;

        // Performance optimization: dynamically adjust update step based on performance
        let updateStep = 1;
        if (currentFPS < 25) updateStep = 4;
        else if (currentFPS < 45) updateStep = 2;

        // Pre-calculate common values outside loop
        const audioEnergy = audioData.average;
        const isOriginal = params.visualStyle === 'original';

        const audioSpeedMultiplier = isOriginal ? 1.0 : (1.0 + audioEnergy * 2.5);
        const ns = params.noiseScale;
        const speed = params.noiseSpeed * audioSpeedMultiplier;
        const timeFactor = currentTime * 0.001;

        const turbulenceMultiplier = isOriginal ? 1.0 : (1.0 + audioEnergy * 1.5);
        const turbulenceStrength = params.turbulenceStrength * turbulenceMultiplier;

        // Movement normalization factor (independent of targetFPS)
        const moveScale = deltaTime * 60 * (isOriginal ? 1.0 : 2.0);

        for (let i = 0; i < pc; i += updateStep) {
            const i3 = i * 3;

            let x = positions[i3];
            let y = positions[i3 + 1];
            let z = positions[i3 + 2];

            let vx = velocities[i3];
            let vy = velocities[i3 + 1];
            let vz = velocities[i3 + 2];

            let lt = lifetimes[i];
            let be = beatEffects[i];

            // Update lifetime
            lt -= deltaTime;

            // Noise calc with audio-reactive speed (optimized)
            const noiseX = noise.noise3D(x * ns + timeFactor * speed, y * ns, z * ns);
            const noiseY = noise.noise3D(x * ns, y * ns + timeFactor * speed, z * ns);
            const noiseZ = noise.noise3D(x * ns, y * ns, z * ns + timeFactor * speed);

            // Turbulence with audio reaction
            vx += noiseX * turbulenceStrength;
            vy += noiseY * turbulenceStrength;
            vz += noiseZ * turbulenceStrength;

            // Beat effect - stronger and more reactive
            if (beatDetected) {
                be = 1.0;
            }
            be *= isOriginal ? 0.95 : 0.97;

            // Calculate distance once and reuse
            const distSq = x * x + y * y + z * z;
            const dist = Math.sqrt(distSq);

            if (be > 0.01 && dist > 0) {
                // směr z centra
                const invDist = 1.0 / dist;
                const dx = x * invDist;
                const dy = y * invDist;
                const dz = z * invDist;

                // Beat force with optional audio energy reaction (Modern only)
                const beatForce = be * params.beatStrength * (isOriginal ? 1.0 : (1.0 + audioEnergy * 2.0));
                vx += dx * beatForce;
                vy += dy * beatForce;
                vz += dz * beatForce;
            }

            // Add audio-reactive radial force (Modern only)
            if (!isOriginal && dist > 0.01) {
                const invDist = 1.0 / dist;
                const radialForce = audioEnergy * 0.02; // Audio-driven expansion
                vx += x * invDist * radialForce;
                vy += y * invDist * radialForce;
                vz += z * invDist * radialForce;
            }

            // Clamp velocity to prevent extreme jumps
            const maxV = 0.5;
            vx = Math.max(-maxV, Math.min(maxV, vx));
            vy = Math.max(-maxV, Math.min(maxV, vy));
            vz = Math.max(-maxV, Math.min(maxV, vz));

            // Update positions - normalized for any refresh rate (60Hz, 120Hz+)
            x += vx * moveScale;
            y += vy * moveScale;
            z += vz * moveScale;

            // Recalculate distance AFTER position update for accurate boundary control
            const currentDistSq = x * x + y * y + z * z;
            const currentDist = Math.sqrt(currentDistSq);

            // Slowing speed - original damping was 0.98. Modern is 0.99+.
            const baseDamping = isOriginal ? 0.98 : 0.99;
            const dampingValue = isOriginal ? baseDamping : (baseDamping + audioEnergy * 0.015);
            vx *= dampingValue;
            vy *= dampingValue;
            vz *= dampingValue;

            // Radius/Boundary Control with diverse shapes
            const shapeType = params.shape || 'sphere';
            const audioRadiusMultiplier = isOriginal ? 1.0 : (1.0 + audioEnergy * 0.15);
            const baseLimit = params.sphereRadius * audioRadiusMultiplier;
            const aspect = window.innerWidth / window.innerHeight;
            const screenLimitY = 1.8;
            const screenLimitX = screenLimitY * aspect;

            if (shapeType === 'box') {
                const limitX = Math.min(screenLimitX * 1.1, baseLimit * 1.8);
                const limitY = Math.min(screenLimitY, baseLimit);
                const limitZ = Math.min(screenLimitY * 0.5, baseLimit * 0.5);

                if (Math.abs(x) > limitX) { x = Math.sign(x) * limitX; vx *= -0.5; }
                if (Math.abs(y) > limitY) { y = Math.sign(y) * limitY; vy *= -0.5; }
                if (Math.abs(z) > limitZ) { z = Math.sign(z) * limitZ; vz *= -0.5; }
            } else if (shapeType === 'horizontal') {
                const limitX = Math.min(screenLimitX * 1.5, baseLimit * 3.0);
                const limitY = Math.min(screenLimitY * 0.3, baseLimit * 0.3);
                const limitZ = Math.min(screenLimitY * 0.5, baseLimit * 0.5);

                if (Math.abs(x) > limitX) { x = Math.sign(x) * limitX; vx *= -0.5; }
                if (Math.abs(y) > limitY) { y = Math.sign(y) * limitY; vy *= -0.5; }
                if (Math.abs(z) > limitZ) { z = Math.sign(z) * limitZ; vz *= -0.5; }
            } else if (shapeType === 'vortex' && !isOriginal) { // Only apply vortex bounds for modern vortex
                const ringDist = Math.sqrt(x * x + z * z);
                // Expand boundaries to fill screen (removed can shape limit)
                const limitR = Math.min(screenLimitX * 1.5, baseLimit * 3.0); // Much wider
                const limitY_v = Math.min(screenLimitY * 1.5, baseLimit * 2.0); // Taller

                if (ringDist > limitR) {
                    const invR = 1.0 / ringDist;
                    x = x * invR * limitR;
                    z = z * invR * limitR;
                    vx *= -0.2; vz *= -0.2;
                }
                if (Math.abs(y) > limitY_v) { y = Math.sign(y) * limitY_v; vy *= -0.5; }
            } else {
                // Sphere (Default & Original)
                // Original GitHub uses soft pullback instead of hard snap.
                const safeScreenRadius = screenLimitY;
                const effectiveRadius = isOriginal ? params.sphereRadius : Math.min(safeScreenRadius, baseLimit);

                if (currentDist > effectiveRadius && currentDist > 0) {
                    const invDist = 1.0 / currentDist;
                    const overflow = currentDist - effectiveRadius;

                    if (isOriginal) {
                        // Original behavior: soft pullback
                        const pullback = overflow * 0.1;
                        x -= x * invDist * pullback;
                        y -= y * invDist * pullback;
                        z -= z * invDist * pullback;
                        vx *= 0.92; vy *= 0.92; vz *= 0.92;
                    } else {
                        // Modern behavior: Hard snap for viewport safety
                        x = x * invDist * effectiveRadius;
                        y = y * invDist * effectiveRadius;
                        z = z * invDist * effectiveRadius;

                        const dx = x * invDist;
                        const dy = y * invDist;
                        const dz = z * invDist;
                        const vn = vx * dx + vy * dy + dz * vz;
                        if (vn > 0) {
                            const bounceDamping = 0.3 - audioEnergy * 0.1;
                            vx -= dx * vn * (1.0 + bounceDamping);
                            vy -= dy * vn * (1.0 + bounceDamping);
                            vz -= dz * vn * (1.0 + bounceDamping);
                        }
                    }
                }
            }

            // Reset of dead particles
            if (lt <= 0) {
                const pos = getInitialParticlePosition(params);
                x = pos.x;
                y = pos.y;
                z = pos.z;

                vx = 0;
                vy = 0;
                vz = 0;

                const newLt = Math.random() * params.particleLifetime;
                lt = newLt;
                maxLifetimes[i] = newLt;
                be = 0;

                basePositions[i3] = x;
                basePositions[i3 + 1] = y;
                basePositions[i3 + 2] = z;
            }

            positions[i3] = x;
            positions[i3 + 1] = y;
            positions[i3 + 2] = z;

            velocities[i3] = vx;
            velocities[i3 + 1] = vy;
            velocities[i3 + 2] = vz;

            lifetimes[i] = lt;
            beatEffects[i] = be;
        }

        geometry.attributes.position.needsUpdate = true;

        // Dyn rotation
        const { volume: smoothVolume, shouldUpdate } = getSmoothVolume(
            params,
            sphere.lastValidVolume,
            params.volumeChangeThreshold
        );

        if (shouldUpdate) {
            const targetRotationSpeed = THREE.MathUtils.lerp(
                params.rotationSpeedMin,
                params.rotationSpeedMax,
                smoothVolume
            );
            sphere.lastRotationSpeed = params.rotationSpeed +
                (targetRotationSpeed - params.rotationSpeed) *
                params.rotationSmoothness;
        }

        sphere.particleSystem.rotation.y += sphere.lastRotationSpeed;

        // Saving volume
        if (shouldUpdate) sphere.lastValidVolume = smoothVolume;
    });

    // Update orbit controls (for mouse rotation)
    orbitControls.update();

    renderer.render(scene, camera);
    updateTimeline();
}

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Maintain pixel ratio limit for 120fps
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    // OrbitControls automatically handles resize, no need to call handleResize()
});


// Ensure audioControls stays fixed (don't change its position)
document.querySelectorAll('.controls-container, .dg.main').forEach(control => {
    if (control.id !== 'audioControls') {
        control.style.position = 'absolute';
    }
});

console.log('Starting animation');
initAudio();
requestAnimationFrame(animate);

// Final cleanup before creating new UI (but don't remove anything if mainUI already exists)
if (!document.getElementById('mainUI')) {
    cleanupPreviousElements();
}

// Tab UI Structure

// Main UI Container (Right Top)
const mainUI = document.createElement('div');
mainUI.id = 'mainUI';
mainUI.style.cssText = `
position: fixed;
top: 10px;
right: 10px;
z-index: 1001;
background: var(--bg-primary, rgba(0, 0, 0, 0.85));
border-radius: 8px;
border: 1px solid var(--border, rgba(255, 255, 255, 0.2));
width: 280px;
display: flex;
flex-direction: column;
overflow: hidden;
max-height: 90vh;
box-shadow: 0 4px 20px var(--shadow-color, rgba(0, 0, 0, 0.5));
transition: background-color 0.3s ease, border-color 0.3s ease;
`;
document.body.appendChild(mainUI);

// Final cleanup after new UI is created (but preserve audioControls and mainUI)
setTimeout(() => {
    // Store references before cleanup
    const audioControlsElement = document.getElementById('audioControls');
    const mainUIElement = document.getElementById('mainUI');
    const presetContentElement = document.getElementById('presetContent');
    const detailContentElement = document.getElementById('detailContent');

    cleanupPreviousElements();

    // Restore audioControls if it was removed
    if (!document.getElementById('audioControls') && audioControlsElement) {
        document.body.appendChild(audioControlsElement);
    }

    // Restore mainUI if it was removed
    if (!document.getElementById('mainUI') && mainUIElement) {
        document.body.appendChild(mainUIElement);
    }

    // Restore presetContent if it was removed
    if (!document.getElementById('presetContent') && presetContentElement && mainUIElement) {
        const contentContainer = mainUIElement.querySelector('#presetContent') ||
            mainUIElement.querySelector('div > div:first-child');
        if (contentContainer) {
            contentContainer.appendChild(presetContentElement);
        }
    }

    // Restore detailContent if it was removed
    if (!document.getElementById('detailContent') && detailContentElement && mainUIElement) {
        const contentContainer = mainUIElement.querySelector('#detailContent') ||
            mainUIElement.querySelector('div > div:last-child');
        if (contentContainer) {
            contentContainer.appendChild(detailContentElement);
        }
    }

    // Ensure GUI exists and is properly positioned
    let guiElement = document.querySelector('.dg.main');

    // If GUI not found, check if mainGui exists and recreate it
    if (!guiElement && typeof mainGui !== 'undefined' && mainGui.domElement) {
        console.log('GUI not found in DOM, but mainGui exists. Using mainGui.domElement');
        guiElement = mainGui.domElement;
        if (guiElement && !guiElement.parentElement) {
            // GUI was removed, add it back
            document.body.appendChild(guiElement);
        }
    }

    if (!guiElement) {
        console.warn('GUI not found after cleanup. Checking if mainGui.domElement exists...');
        if (typeof mainGui !== 'undefined') {
            console.log('mainGui exists:', mainGui);
            console.log('mainGui.domElement:', mainGui.domElement);
            if (mainGui.domElement) {
                guiElement = mainGui.domElement;
                if (!guiElement.parentElement) {
                    document.body.appendChild(guiElement);
                }
            }
        }
    }

    if (guiElement && detailContentElement) {
        // Move GUI to detailContent if not already there
        if (guiElement.parentElement !== detailContentElement) {
            detailContentElement.appendChild(guiElement);
        }
        guiElement.style.display = 'none'; // Hidden initially (preset tab is active)
        console.log('GUI positioned in detailContent');
    } else {
        console.error('GUI element still not found after all attempts');
    }
}, 100);

// Tab Buttons with Theme Toggle
const tabContainer = document.createElement('div');
tabContainer.style.cssText = 'display: flex; align-items: center; border-bottom: 1px solid var(--border, rgba(255,255,255,0.2)); background: var(--bg-secondary, rgba(0,0,0,0.5));';

// Splash Modal Star Button (before preset tab)
const splashStarBtn = document.createElement('button');
splashStarBtn.id = 'splashStarBtn';
splashStarBtn.innerHTML = createLucideIcon('star', 16);
splashStarBtn.title = '앱 정보';
splashStarBtn.style.cssText = `
    background: transparent;
    border: none;
    width: 28px;
    height: 28px;
    margin-right: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    color: var(--text-primary, #ffffff);
    opacity: 0.7;
`;
splashStarBtn.addEventListener('mouseenter', () => {
    splashStarBtn.style.opacity = '1';
    splashStarBtn.style.transform = 'scale(1.1)';
});
splashStarBtn.addEventListener('mouseleave', () => {
    splashStarBtn.style.opacity = '0.7';
    splashStarBtn.style.transform = 'scale(1)';
});

const presetTab = document.createElement('button');
presetTab.textContent = '프리셋';
const initialAccent = ThemeManager.currentTheme === 'light' ? '#888888' : '#3263d1';
presetTab.style.cssText = `flex: 1; padding: 12px; border: none; background: transparent; color: var(--text-primary, white); cursor: pointer; font-weight: bold; border-bottom: 2px solid ${initialAccent}; white-space: nowrap;`;

const detailTab = document.createElement('button');
detailTab.textContent = '상세 설정';
detailTab.style.cssText = 'flex: 1; padding: 12px; border: none; background: transparent; color: var(--text-muted, #888); cursor: pointer; font-weight: bold; border-bottom: 2px solid transparent; white-space: nowrap;';

// Theme Toggle Button
const themeToggle = document.createElement('button');
themeToggle.id = 'themeToggle';
themeToggle.innerHTML = createLucideIcon(ThemeManager.themes[ThemeManager.currentTheme].icon, 18);
themeToggle.title = ThemeManager.currentTheme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환';
themeToggle.style.cssText = `
    background: transparent;
    border: none;
    width: 32px;
    height: 32px;
    margin: 0 8px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    flex-shrink: 0;
    color: var(--text-primary, #ffffff);
`;
themeToggle.addEventListener('click', () => {
    ThemeManager.toggle();
});
themeToggle.addEventListener('mouseenter', () => {
    themeToggle.style.transform = 'scale(1.1)';
});
themeToggle.addEventListener('mouseleave', () => {
    themeToggle.style.transform = 'scale(1)';
});

// Fullscreen Toggle Button
const fullscreenToggle = document.createElement('button');
fullscreenToggle.id = 'fullscreenToggle';
fullscreenToggle.innerHTML = createLucideIcon('maximize', 18);
fullscreenToggle.title = '전체화면';
fullscreenToggle.style.cssText = `
    background: transparent;
    border: none;
    width: 32px;
    height: 32px;
    margin: 0 8px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    flex-shrink: 0;
    color: var(--text-primary, #ffffff);
`;
fullscreenToggle.addEventListener('click', () => {
    toggleFullscreen();
});
fullscreenToggle.addEventListener('mouseenter', () => {
    fullscreenToggle.style.transform = 'scale(1.1)';
});
fullscreenToggle.addEventListener('mouseleave', () => {
    fullscreenToggle.style.transform = 'scale(1)';
});

// Fullscreen functions
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        // Enter fullscreen
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
        }
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

function updateFullscreenIcon() {
    const isFullscreen = !!document.fullscreenElement || !!document.webkitFullscreenElement || !!document.msFullscreenElement;

    // Update icon and title
    if (fullscreenToggle) {
        fullscreenToggle.innerHTML = isFullscreen ? createLucideIcon('minimize', 18) : createLucideIcon('maximize', 18);
        fullscreenToggle.title = isFullscreen ? '전체화면 취소' : '전체화면';

        // Set opacity to 50% in fullscreen mode
        if (isFullscreen) {
            fullscreenToggle.style.opacity = '0.5';
        } else {
            fullscreenToggle.style.opacity = '1';
        }
    }

    // Hide/show UI elements based on fullscreen state
    const splashStarBtn = document.getElementById('splashStarBtn');
    if (splashStarBtn) {
        splashStarBtn.style.display = isFullscreen ? 'none' : 'flex';
    }
    if (presetTab) {
        presetTab.style.display = isFullscreen ? 'none' : 'block';
    }
    if (detailTab) {
        detailTab.style.display = isFullscreen ? 'none' : 'block';
    }
    if (themeToggle) {
        themeToggle.style.display = isFullscreen ? 'none' : 'flex';
    }

    // Hide mainUI content but keep fullscreen button visible
    const mainUI = document.getElementById('mainUI');
    if (mainUI) {
        const contentContainer = mainUI.querySelector('div[style*="padding: 15px"]');
        if (contentContainer) {
            contentContainer.style.display = isFullscreen ? 'none' : 'block';
        }

        // Position tabContainer in fullscreen mode (top-right corner)
        const tabContainer = mainUI.querySelector('div:first-child');
        if (tabContainer) {
            if (isFullscreen) {
                tabContainer.style.position = 'fixed';
                tabContainer.style.top = '10px';
                tabContainer.style.right = '10px';
                tabContainer.style.left = 'auto';
                tabContainer.style.width = 'auto';
                tabContainer.style.zIndex = '10001';
                tabContainer.style.background = 'transparent';
                tabContainer.style.border = 'none';
            } else {
                tabContainer.style.position = '';
                tabContainer.style.top = '';
                tabContainer.style.right = '';
                tabContainer.style.left = '';
                tabContainer.style.width = '';
                tabContainer.style.zIndex = '';
                tabContainer.style.background = '';
                tabContainer.style.border = '';
            }
        }
    }

    // Hide audioControls in fullscreen
    const audioControls = document.getElementById('audioControls');
    if (audioControls) {
        audioControls.style.display = isFullscreen ? 'none' : 'flex';
    }
}

// Listen for fullscreen changes
document.addEventListener('fullscreenchange', updateFullscreenIcon);
document.addEventListener('webkitfullscreenchange', updateFullscreenIcon);
document.addEventListener('msfullscreenchange', updateFullscreenIcon);

// ESC key to exit fullscreen
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const isFullscreen = !!document.fullscreenElement || !!document.webkitFullscreenElement || !!document.msFullscreenElement;
        if (isFullscreen) {
            toggleFullscreen();
        }
    }
});

tabContainer.appendChild(splashStarBtn);
tabContainer.appendChild(presetTab);
tabContainer.appendChild(detailTab);
tabContainer.appendChild(themeToggle);
tabContainer.appendChild(fullscreenToggle);
mainUI.appendChild(tabContainer);

// Splash Modal
const splashModal = document.createElement('div');
splashModal.id = 'splashModal';
splashModal.style.cssText = `
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.75);
    z-index: 100000;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(8px);
    opacity: 0;
    transition: opacity 0.3s ease;
`;
document.body.appendChild(splashModal);

const splashContent = document.createElement('div');
splashContent.style.cssText = `
    position: relative;
    width: 90%;
    max-width: 485px;
    background: var(--bg-primary, rgba(0, 0, 0, 0.95));
    border-radius: 20px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    border: 1px solid var(--border, rgba(255, 255, 255, 0.1));
    transform: scale(0.95);
    transition: transform 0.3s ease;
`;
splashModal.appendChild(splashContent);

// Splash Image Container (16:9)
const splashImageContainer = document.createElement('div');
splashImageContainer.id = 'splashImageContainer';
splashImageContainer.style.cssText = `
    width: 100%;
    aspect-ratio: 16 / 9;
    background: linear-gradient(135deg, var(--accent, #3263d1) 0%, rgba(50, 99, 209, 0.3) 100%);
    border-radius: 12px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;
splashContent.appendChild(splashImageContainer);

// Splash image
const splashImage = document.createElement('img');
splashImage.src = 'splash.jpg';
splashImage.alt = 'Particula Splash';
splashImage.style.cssText = `
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
    transition: transform 0.5s ease;
`;
// Hover effect on image container
splashImageContainer.addEventListener('mouseenter', () => {
    splashImage.style.transform = 'scale(1.05)';
});
splashImageContainer.addEventListener('mouseleave', () => {
    splashImage.style.transform = 'scale(1.0)';
});

splashImage.onerror = function () {
    // If image fails to load, (e.g. 404), show a placeholder
    splashImage.style.display = 'none';
    const placeholder = document.createElement('div');
    placeholder.style.cssText = `
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-primary, #ffffff);
        font-size: 20px;
        font-weight: 500;
        background: rgba(0,0,0,0.2);
    `;
    placeholder.innerHTML = '<div style="text-align:center">Particula<br><span style="font-size:12px; opacity:0.7">Visualization</span></div>';
    splashImageContainer.appendChild(placeholder);
};
splashImageContainer.appendChild(splashImage);

// Function to set splash image (for dynamic updates)
window.setSplashImage = function (imageUrl) {
    splashImage.src = imageUrl;
};

// App Info
const appInfo = document.createElement('div');
appInfo.style.cssText = `
    width: 100%;
    text-align: center;
    color: var(--text-primary, #ffffff);
    font-family: 'Noto Sans KR', sans-serif;
`;
splashContent.appendChild(appInfo);

const appName = document.createElement('h1');
appName.textContent = 'Particula';
appName.style.cssText = `
    font-size: 26px;
    font-weight: 700;
    margin: 0 0 6px 0;
    color: var(--accent, #3263d1);
    font-family: 'Noto Sans KR', sans-serif;
    letter-spacing: -0.5px;
`;
appInfo.appendChild(appName);

const appSubtitle = document.createElement('p');
appSubtitle.textContent = 'Music-Driven Particle Visualizer';
appSubtitle.style.cssText = `
    font-size: 13px;
    margin: 0 0 20px 0;
    color: var(--text-secondary, #aaaaaa);
    font-family: 'Noto Sans KR', sans-serif;
    line-height: normal;
`;
appInfo.appendChild(appSubtitle);

// Tech Stack & Developer Info
const creditsContainer = document.createElement('div');
creditsContainer.style.cssText = `
    width: 100%;
    font-size: 12px;
    color: var(--text-secondary, #aaaaaa);
    background: var(--bg-secondary, rgba(255,255,255,0.05));
    border-radius: 12px;
    padding: 16px;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-sizing: border-box;
`;

const linkStyle = "color: var(--accent, #3263d1); text-decoration: none; font-weight: 600; transition: color 0.2s;";
const hoverAttr = "onmouseover=\"this.style.color='var(--accent-hover)'\" onmouseout=\"this.style.color='var(--accent)'\"";

creditsContainer.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 8px; border-bottom: 1px solid var(--border); margin-bottom: 4px;">
        <span><strong style="color: var(--text-primary);">Version</strong> 1.1.0</span>
        <span>2026</span>
    </div>
    
    <div style="margin-top: 4px;">
        <strong style="color: var(--text-primary); display: block; margin-bottom: 6px;">Tech Stack</strong>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; line-height: 1.5;">
            <a href="https://threejs.org/" target="_blank" style="${linkStyle}" ${hoverAttr}>Three.js</a> •
            <a href="https://get.webgl.org/" target="_blank" style="${linkStyle}" ${hoverAttr}>WebGL</a> •
            <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API" target="_blank" style="${linkStyle}" ${hoverAttr}>Web Audio API</a> •
            <a href="https://github.com/dataarts/dat.gui" target="_blank" style="${linkStyle}" ${hoverAttr}>dat.GUI</a>
        </div>
    </div>
    
    <div style="margin-top: 4px;">
        <strong style="color: var(--text-primary); display: block; margin-bottom: 6px;">Developers</strong>
        <div style="line-height: 1.5;">
            <a href="https://github.com/Humprt/particula" target="_blank" style="${linkStyle}" ${hoverAttr}>Humprt</a> & 
            <a href="mailto:jvisualschool@gmail.com" style="${linkStyle}" ${hoverAttr}>Jinho Jung</a>
        </div>
    </div>
`;
appInfo.appendChild(creditsContainer);

const closeHint = document.createElement('div');
closeHint.innerHTML = '<span style="border: 1px solid var(--border); padding: 1px 5px; border-radius: 4px; font-size: 10px;">ESC</span> or <span style="cursor:pointer; text-decoration:underline;">Click outside</span>';
closeHint.style.cssText = `
    margin-top: 20px;
    font-size: 11px;
    color: var(--text-muted, #888888);
    opacity: 0.7;
`;
appInfo.appendChild(closeHint);

// Open/Close Modal Functions
// Open/Close Modal Functions
function openSplashModal() {
    splashModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    // Trigger reflow for animation
    splashModal.offsetHeight;
    splashModal.style.opacity = '1';
    if (splashContent) splashContent.style.transform = 'scale(1)';
}

function closeSplashModal() {
    splashModal.style.opacity = '0';
    if (splashContent) splashContent.style.transform = 'scale(0.95)';
    setTimeout(() => {
        splashModal.style.display = 'none';
        document.body.style.overflow = '';
    }, 300);
}

// Star button click handler
splashStarBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    openSplashModal();
});

// ESC key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && splashModal.style.display === 'flex') {
        closeSplashModal();
    }
});

// Click outside modal to close
splashModal.addEventListener('click', (e) => {
    if (e.target === splashModal) {
        closeSplashModal();
    }
});

// Content Containers
const contentContainer = document.createElement('div');
contentContainer.style.cssText = 'padding: 15px; overflow-y: auto; flex: 1;';
mainUI.appendChild(contentContainer);

const presetContent = document.createElement('div');
presetContent.id = 'presetContent';
contentContainer.appendChild(presetContent);

const detailContent = document.createElement('div');
detailContent.id = 'detailContent';
detailContent.style.display = 'none';
contentContainer.appendChild(detailContent);

// Move dat.GUI to detailContent and style it
function moveGUIToDetailContent() {
    let guiElement = document.querySelector('.dg.main');

    // If not found, try using mainGui.domElement
    if (!guiElement && typeof mainGui !== 'undefined' && mainGui.domElement) {
        console.log('GUI not found by querySelector, using mainGui.domElement');
        guiElement = mainGui.domElement;
    }

    if (guiElement) {
        console.log('Moving GUI to detailContent');

        // Remove any inline styles that hide the GUI
        guiElement.style.removeProperty('display');
        guiElement.style.removeProperty('visibility');
        guiElement.style.removeProperty('opacity');

        guiElement.style.position = 'static';
        guiElement.style.width = '100%';
        guiElement.style.margin = '0';
        guiElement.style.maxWidth = '100%';
        guiElement.style.boxSizing = 'border-box';

        // Initially hidden because preset tab is active
        guiElement.style.display = 'none';

        // Move to detailContent if not already there
        if (guiElement.parentElement !== detailContent) {
            detailContent.appendChild(guiElement);
        }
        console.log('GUI moved to detailContent');

        // Hide all close buttons
        guiElement.querySelectorAll('.close-top, .close-button, .close-bottom, .close').forEach(btn => {
            btn.style.display = 'none';
        });

        // Make sure GUI is properly styled
        guiElement.classList.add('dg-main-in-tab');

        return true;
    } else {
        console.warn('GUI element not found!');
        return false;
    }
}

// Try to move GUI immediately and also with delay
if (document.querySelector('.dg.main')) {
    moveGUIToDetailContent();
    // Close any color pickers that might be open on initialization
    setTimeout(closeColorPickers, 100);
} else {
    setTimeout(() => {
        if (!moveGUIToDetailContent()) {
            // Try again after a longer delay
            setTimeout(moveGUIToDetailContent, 1000);
        }
        // Close any color pickers after GUI is moved
        setTimeout(closeColorPickers, 200);
    }, 500);
}

// Function to close any open color pickers (must be declared before use)
function closeColorPickers() {
    // Method 1: Directly find and remove ALL color picker elements (most aggressive)
    const allPossibleSelectors = [
        '.dg.c',
        '.dg.color-picker',
        '[class*="color-picker"]',
        '[class*="dg c"]',
        'div.dg.c'
    ];

    allPossibleSelectors.forEach(selector => {
        try {
            const pickers = document.querySelectorAll(selector);
            pickers.forEach(picker => {
                // Force remove regardless of display style
                if (picker && picker.parentNode) {
                    picker.remove();
                }
            });
        } catch (e) { }
    });

    // Method 2: Find color pickers by checking all divs with specific classes
    const allDivs = document.querySelectorAll('div');
    allDivs.forEach(div => {
        if (div.className && (
            div.className.includes('dg c') ||
            div.className.includes('color-picker') ||
            (div.className.includes('dg') && div.style && div.style.position === 'absolute')
        )) {
            // Check if it looks like a color picker (has color-related content)
            const hasColorPickerContent = div.querySelector('input[type="text"]') ||
                div.querySelector('canvas') ||
                div.textContent.includes('#');
            if (hasColorPickerContent && div !== document.querySelector('.dg.main')) {
                div.remove();
            }
        }
    });

    // Method 3: Dispatch mousedown events to trigger dat.GUI's close mechanism
    const eventParams = { bubbles: true, cancelable: true, view: window };
    const mouseDown = new MouseEvent('mousedown', eventParams);

    window.dispatchEvent(mouseDown);
    document.dispatchEvent(mouseDown);
    document.body.dispatchEvent(mouseDown);
    document.documentElement.dispatchEvent(mouseDown);

    // Method 4: Close any open GUI controllers
    if (typeof mainGui !== 'undefined' && mainGui.__controllers) {
        mainGui.__controllers.forEach(controller => {
            if (controller && typeof controller.close === 'function') {
                try {
                    controller.close();
                } catch (e) { }
            }
        });
    }
}

// MutationObserver to automatically close color pickers when they appear
const colorPickerObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
                // Check if the added node is a color picker
                const hasClassC = node.classList && node.classList.contains('c');
                const hasColorPicker = node.classList && node.classList.contains('color-picker');
                const hasDgC = node.className && typeof node.className === 'string' && node.className.includes('dg c');

                if (hasClassC || hasColorPicker || hasDgC) {
                    // Immediately close it
                    setTimeout(() => {
                        node.remove();
                        closeColorPickers();
                    }, 10);
                }
                // Also check children
                const colorPickers = node.querySelectorAll && node.querySelectorAll('.dg.c, [class*="color-picker"]');
                if (colorPickers && colorPickers.length > 0) {
                    colorPickers.forEach(picker => picker.remove());
                }
            }
        });
    });
});

// Start observing
colorPickerObserver.observe(document.body, {
    childList: true,
    subtree: true
});

// Tab Logic
presetTab.onclick = () => {
    // Aggressively force close any open color pickers
    closeColorPickers();

    presetContent.style.display = 'block';
    detailContent.style.display = 'none';
    const accentColor = window.ThemeManager && window.ThemeManager.currentTheme === 'light' ? '#888888' : '#3263d1';
    presetTab.style.color = 'var(--text-primary, white)';
    presetTab.style.borderBottom = `2px solid ${accentColor}`;
    detailTab.style.color = 'var(--text-muted, #888)';
    detailTab.style.borderBottom = '2px solid transparent';

    // Hide GUI when preset tab is active
    const guiElement = document.querySelector('.dg.main');
    if (guiElement && guiElement.parentElement === detailContent) {
        guiElement.style.display = 'none';
    }
};

detailTab.onclick = () => {
    console.log('Detail tab clicked');
    // Close any open color pickers first
    closeColorPickers();

    presetContent.style.display = 'none';
    detailContent.style.display = 'block';
    const accentColor = window.ThemeManager && window.ThemeManager.currentTheme === 'light' ? '#888888' : '#3263d1';
    detailTab.style.color = 'var(--text-primary, white)';
    detailTab.style.borderBottom = `2px solid ${accentColor}`;
    presetTab.style.color = 'var(--text-muted, #888)';
    presetTab.style.borderBottom = '2px solid transparent';

    // Show GUI when detail tab is active
    let guiElement = document.querySelector('.dg.main');

    // If not found, try using mainGui.domElement
    if (!guiElement && typeof mainGui !== 'undefined' && mainGui.domElement) {
        console.log('Using mainGui.domElement');
        guiElement = mainGui.domElement;
    }

    // If GUI not found, try to move it
    if (!guiElement) {
        console.log('GUI not found, trying to move it');
        moveGUIToDetailContent();
        guiElement = document.querySelector('.dg.main') || (typeof mainGui !== 'undefined' ? mainGui.domElement : null);
    }

    // Try multiple times if GUI not found
    if (!guiElement) {
        setTimeout(() => {
            guiElement = document.querySelector('.dg.main') || (typeof mainGui !== 'undefined' ? mainGui.domElement : null);
            if (guiElement) {
                showGUIInDetailContent(guiElement);
            }
        }, 100);
        setTimeout(() => {
            guiElement = document.querySelector('.dg.main') || (typeof mainGui !== 'undefined' ? mainGui.domElement : null);
            if (guiElement) {
                showGUIInDetailContent(guiElement);
            }
        }, 500);
    }

    if (guiElement) {
        showGUIInDetailContent(guiElement);
    } else {
        console.error('GUI element not found when detail tab clicked!');
        console.log('mainGui exists:', typeof mainGui !== 'undefined');
        if (typeof mainGui !== 'undefined') {
            console.log('mainGui.domElement:', mainGui.domElement);
            if (mainGui.domElement) {
                showGUIInDetailContent(mainGui.domElement);
            }
        }
    }
};

function showGUIInDetailContent(guiElement) {
    console.log('Showing GUI in detailContent');

    // Ensure GUI is in detailContent
    if (guiElement.parentElement !== detailContent) {
        console.log('Moving GUI to detailContent');
        detailContent.appendChild(guiElement);
    }

    // Force show the GUI - remove all hiding styles
    guiElement.style.removeProperty('display');
    guiElement.style.removeProperty('visibility');
    guiElement.style.removeProperty('opacity');
    guiElement.style.setProperty('display', 'block', 'important');
    guiElement.style.setProperty('visibility', 'visible', 'important');
    guiElement.style.setProperty('opacity', '1', 'important');
    guiElement.style.position = 'static';
    guiElement.style.width = '100%';
    guiElement.style.maxWidth = '100%';

    // Also show all GUI children - use more specific selectors
    const allGUIChildren = guiElement.querySelectorAll('*');
    allGUIChildren.forEach(el => {
        // Don't hide close buttons
        if (!el.classList.contains('close') &&
            !el.classList.contains('close-top') &&
            !el.classList.contains('close-button') &&
            !el.classList.contains('close-bottom')) {
            el.style.removeProperty('display');
            el.style.removeProperty('visibility');
            el.style.removeProperty('opacity');
        }
    });

    // Force show specific GUI elements
    guiElement.querySelectorAll('.dg li, .dg ul, .dg .property-name, .dg .slider, .dg input, .dg select, .dg .c, .dg .slider-container').forEach(el => {
        el.style.setProperty('display', '', 'important');
        el.style.setProperty('visibility', 'visible', 'important');
    });

    console.log('GUI should be visible now. GUI element:', guiElement);
    console.log('GUI parent:', guiElement.parentElement);
    console.log('GUI display style:', window.getComputedStyle(guiElement).display);
}

// --- Sliders and Preset Buttons ---
const presetUI = presetContent; // Variable alias for compatibility

// Sliders
const slidersContainer = document.createElement('div');
slidersContainer.style.cssText = 'margin-bottom: 15px; border-bottom: 1px solid var(--border, rgba(255,255,255,0.2)); padding-bottom: 15px;';

function createSlider(label, min, max, val, step, onChange) {
    const container = document.createElement('div');
    container.style.cssText = 'margin-bottom: 10px; display: flex; flex-direction: column;';

    const labelDiv = document.createElement('div');
    labelDiv.textContent = label;
    labelDiv.style.cssText = 'color: var(--text-secondary, #ccc); font-size: 11px; margin-bottom: 3px;';

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = val;
    slider.style.width = '100%';
    slider.oninput = (e) => onChange(parseFloat(e.target.value));

    container.appendChild(labelDiv);
    container.appendChild(slider);
    return container;
}

slidersContainer.appendChild(createSlider('도트 크기 (Size)', 0.001, 0.03, 0.003, 0.001, (val) => {
    spheres.forEach(sphere => {
        sphere.params.particleSize = val;
        sphere.material.size = val;
    });
}));

slidersContainer.appendChild(createSlider('밀도 (Density)', 1000, 50000, 20000, 1000, (val) => {
    spheres.forEach((sphere, index) => {
        if (sphere.params.enabled) {
            sphere.params.particleCount = val;
            const res = reinitializeParticlesForSphere(sphere, sphere.params, sphere.geometry);

            sphere.positions = res.newPositions;
            sphere.colors = res.newColors;
            sphere.velocities = res.newVelocities;
            sphere.basePositions = res.newBasePositions;
            sphere.lifetimes = res.newLifetimes;
            sphere.maxLifetimes = res.newMaxLifetimes;
            sphere.beatEffects = res.newBeatEffects;

            sphere.geometry.attributes.position.needsUpdate = true;
            sphere.geometry.attributes.color.needsUpdate = true;
        }
    });
}));

presetUI.appendChild(slidersContainer);

// Presets
const presetTitle = document.createElement('div');
presetTitle.textContent = '기본 프리셋';
presetTitle.style.cssText = `
font-size: 12px;
font-weight: bold;
color: var(--text-primary, #fff);
margin-bottom: 10px;
margin-top: 15px;
letter-spacing: 1px;
`;
presetUI.appendChild(presetTitle);

const presetButtons = document.createElement('div');
presetButtons.style.cssText = 'display: flex; flex-direction: column; gap: 6px;';

const presets = {
    "Original": "오리지널"
};

Object.keys(presets).forEach(presetName => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = presets[presetName];
    btn.dataset.preset = presetName;
    btn.style.cssText = `
padding: 8px 12px;
background: rgba(50, 99, 209, 0.3);
color: white;
border: 1px solid rgba(50, 99, 209, 0.5);
border-radius: 4px;
cursor: pointer;
font-size: 13px;
transition: all 0.2s;
text-align: left;
`;
    btn.onmouseover = () => {
        btn.style.background = 'rgba(50, 99, 209, 0.6)';
        btn.style.borderColor = 'rgba(50, 99, 209, 0.9)';
    };
    btn.onmouseout = () => {
        btn.style.background = 'rgba(50, 99, 209, 0.3)';
        btn.style.borderColor = 'rgba(50, 99, 209, 0.5)';
    };
    btn.onclick = (e) => { e.preventDefault(); loadPreset(presetName); };
    presetButtons.appendChild(btn);
});

presetUI.appendChild(presetButtons);

// Remove unwanted handlers
document.querySelectorAll('.dg.ac').forEach(el => el.style.zIndex = '999');

// loadPreset function was already defined earlier in the file? 
// No, it was usually at the end. We need to make sure loadPreset is available.
// If loadPreset was defined BEFORE animate(), we are good.
// If it was defined AFTER animate(), we lost it. Let's check where it is.

async function loadPreset(presetName) {
    try {
        const response = await fetch(`dramatic_presets.json?t=${Date.now()}`);
        const allPresets = await response.json();
        const preset = allPresets[presetName];

        if (!preset) {
            console.error('Preset not found:', presetName);
            return;
        }

        console.log(`Loading preset: ${presetName} `);

        spheres.forEach((sphere, index) => {
            if (preset[index]) {
                const setting = preset[index];

                // Update basic params
                sphere.params.enabled = setting.enabled;
                sphere.params.particleCount = setting.particleCount;
                sphere.params.sphereRadius = setting.sphereRadius;
                sphere.params.innerSphereRadius = setting.innerSphereRadius;
                sphere.params.particleSize = setting.particleSize;
                sphere.params.noiseScale = setting.noiseScale;
                sphere.params.noiseSpeed = setting.noiseSpeed;
                sphere.params.turbulenceStrength = setting.turbulenceStrength;
                sphere.params.colorStart = setting.colorStart;
                sphere.params.colorEnd = setting.colorEnd;
                sphere.params.gainMultiplier = setting.gainMultiplier;
                sphere.params.shape = setting.shape || 'sphere';

                sphere.params.visualStyle = setting.visualStyle || 'modern';

                // Update material
                sphere.material.size = sphere.params.particleSize;
                sphere.particleSystem.visible = sphere.params.enabled;

                // Reinitialize particles with new settings
                const res = reinitializeParticlesForSphere(sphere, sphere.params, sphere.geometry);

                sphere.positions = res.newPositions;
                sphere.colors = res.newColors;
                sphere.velocities = res.newVelocities;
                sphere.basePositions = res.newBasePositions;
                sphere.lifetimes = res.newLifetimes;
                sphere.maxLifetimes = res.newMaxLifetimes;
                sphere.beatEffects = res.newBeatEffects;

                sphere.geometry.attributes.position.needsUpdate = true;
                sphere.geometry.attributes.color.needsUpdate = true;

                // Update colors visualization
                updateColorsForSphere(sphere.params, sphere.geometry, sphere.colors);
            }
        });

        // Update GUI display if possible
        if (typeof mainGui !== 'undefined') {
            mainGui.__controllers.forEach(c => c.updateDisplay());
            Object.values(mainGui.__folders).forEach(folder => {
                folder.__controllers.forEach(c => c.updateDisplay());
            });
        }

        // Update ThemeManager colors after preset load (for light mode)
        if (window.ThemeManager && window.ThemeManager.currentTheme === 'light') {
            window.ThemeManager.storeOriginalColors();
            window.ThemeManager.invertParticleColors();
        } else if (window.ThemeManager) {
            window.ThemeManager.storeOriginalColors();
        }

    } catch (error) {
        console.error('Error loading preset:', error);
    }
}

// Auto-load "Original" preset on page load
window.addEventListener('load', () => {
    // Small delay to ensure everything is initialized
    setTimeout(() => {
        loadPreset('Original');
        console.log('Auto-loaded Original preset');
    }, 100);
});
