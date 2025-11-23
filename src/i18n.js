// i18n (Internationalization) System
// Supports English and Korean

export const translations = {
    en: {
        // UI Controls
        'file-label': 'Load GLTF File',
        'hdr-label': 'Load HDR File (.hdr, .exr)',
        'hdr-hint': 'Upload custom HDR environment map',
        'toggle-settings': '⚙️ Settings',

        // Camera Modes
        'first-person': '1st Person',
        'third-person': '3rd Person',
        'free-camera': 'Free Camera',

        // Settings Sections
        'player-settings': 'Player Settings',
        'post-processing': 'Post-Processing',
        'time-of-day': 'Time of Day',
        'graphics': 'Graphics',
        'environment-lighting': 'Environment & Lighting',
        'particles': 'Particle System',
        'glitch': 'Glitch Effect',
        'settings-management': 'Settings Management',

        // Player Settings
        'player-scale': 'Player Scale',
        'player-height': 'Eye Height',
        'player-speed': 'Movement Speed',
        'ground-level': 'Ground Level',
        'third-person-distance': '3rd Person Distance',
        'third-person-height': '3rd Person Height',

        // Post-Processing
        'enable-postprocessing': 'Enable Post-Processing',
        'enable-bloom': 'Bloom Effect',
        'enable-ssao': 'SSAO (Ambient Occlusion)',

        // Time of Day
        'enable-time-cycle': 'Enable Time Cycle',
        'time-of-day-label': 'Time of Day',
        'time-speed': 'Time Speed',
        'sun-intensity': 'Sun Intensity',

        // Graphics
        'enable-shadows': 'Enable Shadows',
        'enable-fog': 'Enable Fog',
        'pixel-ratio': 'Pixel Ratio',

        // Environment
        'environment': 'Environment',
        'environment-none': 'None',
        'environment-studio': 'Studio (Default)',
        'environment-natural': 'Natural',
        'environment-venice': 'Venice Sunset',
        'environment-custom': 'Custom HDR',
        'tone-mapping': 'Tone Mapping',
        'tone-linear': 'Linear',
        'tone-aces': 'ACES Filmic',
        'tone-cineon': 'Cineon',
        'tone-reinhard': 'Reinhard',
        'exposure': 'Exposure',
        'punctual-lights': 'Punctual Lights',
        'ambient-intensity': 'Ambient Intensity',
        'ambient-color': 'Ambient Color',
        'direct-intensity': 'Directional Intensity',
        'direct-color': 'Directional Color',
        'env-intensity': 'Environment Intensity',
        'show-background': 'Show Environment Background',
        'background-blur': 'Background Blur',

        // Particles
        'enable-particles': 'Enable Particles',
        'particle-shape': 'Particle Shape',
        'shape-sphere': 'Sphere',
        'shape-cube': 'Cube',
        'shape-torus': 'Torus',
        'shape-spiral': 'Spiral',
        'particle-size': 'Particle Size',
        'particle-speed': 'Particle Speed',

        // Glitch
        'enable-glitch': 'Enable Auto Glitch',
        'trigger-glitch': '⚡ Trigger Glitch',

        // Settings Management
        'save-settings': '💾 Save Current Settings',
        'load-settings': '📂 Load Saved Settings',
        'reset-settings': '🔄 Reset to Defaults',
        'export-settings': '📤 Export Settings',
        'import-settings-label': '📥 Import Settings',

        // Controls Info
        'controls': 'Controls',
        'movement': 'Movement: W/A/S/D',
        'jump': 'Jump: Space',
        'sprint': 'Sprint: Shift',
        'look': 'Look: Mouse',
        'free-up': 'Up: E (Free Camera)',
        'free-down': 'Down: Q (Free Camera)',
        'modes': 'Camera Modes',
        'mode-1': '1: First Person',
        'mode-2': '2: Third Person',
        'mode-3': '3: Free Camera',

        // Alerts
        'settings-saved': 'Settings saved!',
        'no-saved-settings': 'No saved settings found.',
        'settings-loaded': 'Settings loaded!',
        'settings-load-error': 'Failed to load settings.',
        'settings-reset-confirm': 'Reset all settings to default values?',
        'no-settings-to-export': 'No saved settings. Please save settings first.',
        'settings-imported': 'Settings imported!',
        'settings-import-error': 'Failed to import settings file.',
    },

    ko: {
        // UI Controls
        'file-label': 'GLTF 파일 불러오기',
        'hdr-label': 'HDR 파일 불러오기 (.hdr, .exr)',
        'hdr-hint': '커스텀 HDR 환경 맵 업로드',
        'toggle-settings': '⚙️ 설정',

        // Camera Modes
        'first-person': '1인칭',
        'third-person': '3인칭',
        'free-camera': '자유 카메라',

        // Settings Sections
        'player-settings': '플레이어 설정',
        'post-processing': '후처리 효과',
        'time-of-day': '시간대',
        'graphics': '그래픽',
        'environment-lighting': '환경 & 조명',
        'particles': '파티클 시스템',
        'glitch': '글리치 효과',
        'settings-management': '설정 관리',

        // Player Settings
        'player-scale': '플레이어 크기',
        'player-height': '눈 높이',
        'player-speed': '이동 속도',
        'ground-level': '지면 레벨',
        'third-person-distance': '3인칭 거리',
        'third-person-height': '3인칭 높이',

        // Post-Processing
        'enable-postprocessing': '후처리 활성화',
        'enable-bloom': '블룸 효과',
        'enable-ssao': 'SSAO (앰비언트 오클루전)',

        // Time of Day
        'enable-time-cycle': '시간 사이클 활성화',
        'time-of-day-label': '시간대',
        'time-speed': '시간 속도',
        'sun-intensity': '태양 강도',

        // Graphics
        'enable-shadows': '그림자 활성화',
        'enable-fog': '안개 활성화',
        'pixel-ratio': '픽셀 비율',

        // Environment
        'environment': '환경',
        'environment-none': '없음',
        'environment-studio': '스튜디오 (기본)',
        'environment-natural': '자연',
        'environment-venice': '베니스 석양',
        'environment-custom': '커스텀 HDR',
        'tone-mapping': '톤 매핑',
        'tone-linear': 'Linear',
        'tone-aces': 'ACES Filmic',
        'tone-cineon': 'Cineon',
        'tone-reinhard': 'Reinhard',
        'exposure': '노출',
        'punctual-lights': '직접 조명',
        'ambient-intensity': '앰비언트 강도',
        'ambient-color': '앰비언트 색상',
        'direct-intensity': '디렉셔널 강도',
        'direct-color': '디렉셔널 색상',
        'env-intensity': '환경 강도',
        'show-background': '환경 배경 표시',
        'background-blur': '배경 블러',

        // Particles
        'enable-particles': '파티클 활성화',
        'particle-shape': '파티클 형태',
        'shape-sphere': '구',
        'shape-cube': '큐브',
        'shape-torus': '토러스',
        'shape-spiral': '나선',
        'particle-size': '파티클 크기',
        'particle-speed': '파티클 속도',

        // Glitch
        'enable-glitch': '자동 글리치 활성화',
        'trigger-glitch': '⚡ 글리치 발동',

        // Settings Management
        'save-settings': '💾 현재 설정 저장',
        'load-settings': '📂 저장된 설정 불러오기',
        'reset-settings': '🔄 기본값으로 초기화',
        'export-settings': '📤 설정 내보내기',
        'import-settings-label': '📥 설정 가져오기',

        // Controls Info
        'controls': '조작법',
        'movement': '이동: W/A/S/D',
        'jump': '점프: Space',
        'sprint': '질주: Shift',
        'look': '시점: 마우스',
        'free-up': '상승: E (자유 카메라)',
        'free-down': '하강: Q (자유 카메라)',
        'modes': '카메라 모드',
        'mode-1': '1: 1인칭',
        'mode-2': '2: 3인칭',
        'mode-3': '3: 자유 카메라',

        // Alerts
        'settings-saved': '설정이 저장되었습니다!',
        'no-saved-settings': '저장된 설정이 없습니다.',
        'settings-loaded': '설정을 불러왔습니다!',
        'settings-load-error': '설정을 불러오는데 실패했습니다.',
        'settings-reset-confirm': '모든 설정을 기본값으로 초기화하시겠습니까?',
        'no-settings-to-export': '저장된 설정이 없습니다. 먼저 설정을 저장해주세요.',
        'settings-imported': '설정을 가져왔습니다!',
        'settings-import-error': '설정 파일을 불러오는데 실패했습니다.',
    }
};

export class I18n {
    constructor() {
        // Get saved language or default to English
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.translations = translations;
    }

    /**
     * Get translation for a key
     */
    t(key) {
        return this.translations[this.currentLanguage][key] || key;
    }

    /**
     * Set current language
     */
    setLanguage(lang) {
        if (!this.translations[lang]) {
            console.error(`Language "${lang}" not supported`);
            return;
        }

        this.currentLanguage = lang;
        localStorage.setItem('language', lang);
        this.updateUI();
    }

    /**
     * Get current language
     */
    getLanguage() {
        return this.currentLanguage;
    }

    /**
     * Update all UI elements with current language
     */
    updateUI() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);

            // Update text content or placeholder
            if (element.tagName === 'INPUT' && element.type !== 'checkbox' && element.type !== 'file') {
                element.placeholder = translation;
            } else if (element.tagName === 'OPTION') {
                element.textContent = translation;
            } else {
                element.textContent = translation;
            }
        });

        // Update elements with data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });

        // Update language indicator
        const langIndicators = document.querySelectorAll('.language-indicator');
        langIndicators.forEach(indicator => {
            indicator.textContent = this.currentLanguage === 'en' ? '🇺🇸 EN' : '🇰🇷 KO';
        });
    }

    /**
     * Get translated alert message
     */
    alert(key) {
        return window.alert(this.t(key));
    }

    /**
     * Get translated confirm message
     */
    confirm(key) {
        return window.confirm(this.t(key));
    }
}

// Create global i18n instance
export const i18n = new I18n();
