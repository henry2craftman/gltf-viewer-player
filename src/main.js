import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CameraController } from './Camera.js';
import { Player } from './Player.js';
import { PostProcessingManager } from './PostProcessing.js';
import { TimeOfDaySystem } from './TimeOfDay.js';
import { ParticleSystem } from './ParticleSystem.js';
import { i18n } from './i18n.js';
import gsap from 'gsap';

class GLTFViewer {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.clock = new THREE.Clock();

        // Environment and lighting properties
        this.currentEnvironment = 'Studio';
        this.environments = {};
        this.pmremGenerator = null;
        this.ambientLight = null;
        this.punctualLightsEnabled = true;
        this.environmentIntensity = 1.0;
        this.showBackground = true;
        this.backgroundBlurLevel = 0.0;

        this.setupRenderer();
        this.setupScene();
        this.setupLights();
        this.setupGround();

        this.cameraController = new CameraController(this.canvas, this.renderer);
        this.player = new Player(this.scene);

        // Post-processing (wrapped in try-catch)
        this.postProcessing = null;
        try {
            this.postProcessing = new PostProcessingManager(
                this.renderer,
                this.scene,
                this.cameraController.camera
            );
        } catch (error) {
            console.warn('Post-processing initialization failed:', error);
        }

        // Time of day system
        this.timeOfDay = new TimeOfDaySystem(
            this.scene,
            this.directionalLight,
            this.hemisphereLight
        );

        // Particle system (like Igloo Inc.)
        this.particleSystem = new ParticleSystem(this.scene);

        this.gltfLoader = new GLTFLoader();
        this.rgbeLoader = new RGBELoader();
        this.loadedModel = null;

        // Initialize i18n
        this.i18n = i18n;
        this.i18n.updateUI();

        this.setupUI();
        this.setupSettings();
        this.animate();
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // Shadow settings
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // PBR-optimized settings
        this.renderer.physicallyCorrectLights = true; // Use physically correct lighting
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping; // Film-like tone mapping
        this.renderer.toneMappingExposure = 1.0; // Default exposure
        this.renderer.outputColorSpace = THREE.SRGBColorSpace; // sRGB color space

        // Enable logarithmic depth buffer for better depth precision
        this.renderer.logarithmicDepthBuffer = true;

        // Initialize PMREM generator for environment maps
        this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        this.pmremGenerator.compileEquirectangularShader();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000); // Black background like donmccurdy viewer
        this.scene.fog = new THREE.Fog(0x000000, 10, 100);

        // Create environment map for PBR reflections
        this.setupEnvironmentMap();
    }

    setupEnvironmentMap() {
        // Create default Studio environment
        this.createStudioEnvironment();
        this.setEnvironment('Studio');
    }

    createStudioEnvironment() {
        // Use Three.js built-in RoomEnvironment for realistic studio lighting
        const roomScene = new RoomEnvironment();
        const environmentTexture = this.pmremGenerator.fromScene(roomScene, 0.04).texture;

        // Store in environments object
        this.environments['Studio'] = environmentTexture;
    }

    createNaturalEnvironment() {
        // Create more realistic outdoor natural lighting environment
        const envScene = new THREE.Scene();

        // Create realistic sky sphere
        const skyGeo = new THREE.SphereGeometry(500, 32, 32);
        const skyMat = new THREE.MeshBasicMaterial({
            side: THREE.BackSide,
            depthWrite: false,
            vertexColors: true
        });

        // Create gradient colors for vertices
        const colors = [];
        const color = new THREE.Color();
        const vertices = skyGeo.attributes.position;
        for (let i = 0; i < vertices.count; i++) {
            const y = vertices.getY(i) / 500; // Normalized height
            // Gradient from horizon to sky
            if (y > 0.2) {
                color.setHSL(0.58, 0.7, 0.5 + y * 0.3); // Sky blue
            } else {
                color.setHSL(0.1, 0.5, 0.7 + y * 0.3); // Horizon warm
            }
            colors.push(color.r, color.g, color.b);
        }
        skyGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const skyMesh = new THREE.Mesh(skyGeo, skyMat);
        envScene.add(skyMesh);

        // Sun disk
        const sunGeo = new THREE.SphereGeometry(20, 16, 16);
        const sunMat = new THREE.MeshBasicMaterial({
            color: 0xffffee,
            emissive: 0xffffaa,
            emissiveIntensity: 2
        });
        const sun = new THREE.Mesh(sunGeo, sunMat);
        sun.position.set(100, 200, 100);
        envScene.add(sun);

        // Natural sunlight
        const sunLight = new THREE.DirectionalLight(0xffffff, 5 * (this.environmentIntensity || 1));
        sunLight.position.set(100, 200, 100);
        envScene.add(sunLight);

        // Sky ambient light
        const ambientLight = new THREE.HemisphereLight(0x87ceeb, 0xffd4a3, 2 * (this.environmentIntensity || 1));
        envScene.add(ambientLight);

        const roughness = 0.04 + (this.backgroundBlurLevel || 0) * 0.5;
        const environmentTexture = this.pmremGenerator.fromScene(envScene, roughness).texture;
        this.environments['Natural'] = environmentTexture;
    }

    createHDRBackgroundSphere(texture) {
        // Remove previous HDR background sphere if exists
        if (this.hdrBackgroundSphere) {
            this.scene.remove(this.hdrBackgroundSphere);
            this.hdrBackgroundSphere.geometry.dispose();
            this.hdrBackgroundSphere.material.dispose();
        }

        // Create a large sphere with HDR texture as background
        const sphereGeo = new THREE.SphereGeometry(500, 60, 40);
        const sphereMat = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide, // Render inside of sphere
            depthWrite: false,
            fog: false
        });

        this.hdrBackgroundSphere = new THREE.Mesh(sphereGeo, sphereMat);
        this.hdrBackgroundSphere.name = 'HDRBackgroundSphere';
        this.scene.add(this.hdrBackgroundSphere);

        console.log('HDR background sphere created with texture');
    }

    createVeniceEnvironment() {
        // Create dramatic Venice sunset environment
        const envScene = new THREE.Scene();

        // Create realistic sunset sky sphere
        const skyGeo = new THREE.SphereGeometry(500, 64, 64);
        const skyMat = new THREE.MeshBasicMaterial({
            side: THREE.BackSide,
            depthWrite: false,
            vertexColors: true
        });

        // Create dramatic sunset gradient
        const colors = [];
        const color = new THREE.Color();
        const vertices = skyGeo.attributes.position;
        for (let i = 0; i < vertices.count; i++) {
            const y = vertices.getY(i) / 500; // Normalized height
            const x = vertices.getX(i) / 500;
            const z = vertices.getZ(i) / 500;

            // Direction to sun (low on horizon)
            const sunDir = new THREE.Vector3(0.7, 0.1, 0.3).normalize();
            const viewDir = new THREE.Vector3(x, y, z).normalize();
            const sunInfluence = Math.max(0, viewDir.dot(sunDir));

            if (y > 0.3) {
                // Upper sky - deep blue to purple
                color.setHSL(0.75, 0.6, 0.15 + y * 0.2);
            } else if (y > 0) {
                // Mid sky - orange to pink gradient
                const hue = 0.05 + sunInfluence * 0.08;
                const saturation = 0.8 - y * 0.3;
                const lightness = 0.4 + sunInfluence * 0.3;
                color.setHSL(hue, saturation, lightness);
            } else {
                // Horizon - intense orange/red
                const hue = 0.02 + sunInfluence * 0.05;
                color.setHSL(hue, 0.9, 0.5 + sunInfluence * 0.3);
            }
            colors.push(color.r, color.g, color.b);
        }
        skyGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const skyMesh = new THREE.Mesh(skyGeo, skyMat);
        envScene.add(skyMesh);

        // Sunset sun disk
        const sunGeo = new THREE.SphereGeometry(30, 16, 16);
        const sunMat = new THREE.MeshBasicMaterial({
            color: 0xffaa33,
            emissive: 0xff6600,
            emissiveIntensity: 5
        });
        const sun = new THREE.Mesh(sunGeo, sunMat);
        sun.position.set(150, 30, 60);
        envScene.add(sun);

        // Warm sunset light
        const sunsetLight = new THREE.DirectionalLight(0xff8844, 4 * (this.environmentIntensity || 1));
        sunsetLight.position.set(150, 30, 60);
        envScene.add(sunsetLight);

        // Purple/pink fill light from opposite side
        const fillLight = new THREE.DirectionalLight(0x8844ff, 1 * (this.environmentIntensity || 1));
        fillLight.position.set(-100, 50, -100);
        envScene.add(fillLight);

        // Warm ambient
        const ambientLight = new THREE.HemisphereLight(0xff9966, 0x4444aa, 1.5 * (this.environmentIntensity || 1));
        envScene.add(ambientLight);

        const roughness = 0.04 + (this.backgroundBlurLevel || 0) * 0.5;
        const environmentTexture = this.pmremGenerator.fromScene(envScene, roughness).texture;
        this.environments['Venice'] = environmentTexture;
    }

    loadCustomHDR(file) {
        const url = URL.createObjectURL(file);

        console.log('Loading HDR file:', file.name);

        this.rgbeLoader.load(
            url,
            (texture) => {
                console.log('HDR texture loaded, converting to environment map...');
                console.log('Original texture type:', texture.type);
                console.log('Original texture format:', texture.format);
                console.log('Original texture mapping:', texture.mapping);
                console.log('Original texture colorSpace:', texture.colorSpace);

                // Keep original texture as is for background - RGBELoader sets proper HDR format
                // Don't change colorSpace - it should be LinearSRGBColorSpace for HDR
                texture.mapping = THREE.EquirectangularReflectionMapping;
                texture.needsUpdate = true;

                console.log('Texture properties set, generating PMREM...');

                // Convert HDR texture to environment map using PMREM for lighting
                const pmremTarget = this.pmremGenerator.fromEquirectangular(texture);
                const environmentTexture = pmremTarget.texture;

                console.log('PMREM generated');
                console.log('Environment texture type:', environmentTexture.type);
                console.log('Environment texture format:', environmentTexture.format);
                console.log('Environment texture mapping:', environmentTexture.mapping);

                // Store both textures
                this.environments['Custom'] = environmentTexture;
                this.environments['CustomBackground'] = texture;

                console.log('Environment texture created and stored');

                // Enable background visibility for HDR
                this.showBackground = true;
                const showBackgroundCheckbox = document.getElementById('show-background');
                if (showBackgroundCheckbox) {
                    showBackgroundCheckbox.checked = true;
                }

                // Apply the custom environment for lighting (IBL) - use PMREM
                this.scene.environment = environmentTexture;

                // Apply original texture for background - use original HDR with proper mapping
                this.scene.background = texture;
                this.currentEnvironment = 'Custom';

                console.log('Background texture object:', texture);
                console.log('Background is Texture:', texture.isTexture);
                console.log('Background image:', texture.image);
                console.log('Background image width:', texture.image?.width);
                console.log('Background image height:', texture.image?.height);

                // Try creating a background sphere as fallback
                this.createHDRBackgroundSphere(texture);

                // Increase exposure automatically for HDR
                const currentExposure = this.renderer.toneMappingExposure;
                this.renderer.toneMappingExposure = Math.max(currentExposure, 1.5);

                // Update exposure slider
                const exposureSlider = document.getElementById('exposure');
                const exposureValue = document.getElementById('exposure-value');
                if (exposureSlider && exposureValue) {
                    exposureSlider.value = this.renderer.toneMappingExposure;
                    exposureValue.textContent = this.renderer.toneMappingExposure.toFixed(2);
                }

                console.log('Exposure increased to:', this.renderer.toneMappingExposure);

                console.log('Scene environment set:', this.scene.environment !== null);
                console.log('Scene background set:', this.scene.background !== null);

                // Hide ground and grid when showing HDR background
                if (this.ground) this.ground.visible = false;
                if (this.gridHelper) this.gridHelper.visible = false;

                // Update the select dropdown to show Custom
                const environmentSelect = document.getElementById('environment-select');
                if (environmentSelect) {
                    environmentSelect.value = 'Custom';
                }

                console.log('Custom HDR environment loaded and applied successfully');
                console.log('If background still appears black, try increasing Exposure slider (current:', this.renderer.toneMappingExposure, ')');

                // Don't dispose original texture as we're using it for background
                // URL.revokeObjectURL(url); // Keep URL alive for texture
            },
            (progress) => {
                const percent = (progress.loaded / progress.total * 100).toFixed(1);
                console.log('Loading HDR:', percent + '%');
            },
            (error) => {
                console.error('Error loading HDR file:', error);
                alert('Failed to load HDR file. Please make sure it is a valid .hdr or .exr file.');
                URL.revokeObjectURL(url);
            }
        );
    }

    setEnvironment(envName) {
        // Handle None environment
        if (envName === 'None') {
            this.scene.environment = null;
            this.scene.background = new THREE.Color(0x000000);
            this.currentEnvironment = envName;
            // Show ground and grid for None environment
            if (this.ground) this.ground.visible = true;
            if (this.gridHelper) this.gridHelper.visible = true;
            return;
        }

        // Handle Custom environment (already loaded via HDR file)
        if (envName === 'Custom') {
            if (this.environments['Custom']) {
                this.scene.environment = this.environments['Custom'];
                if (this.showBackground) {
                    this.scene.background = this.environments['Custom'];
                    if (this.ground) this.ground.visible = false;
                    if (this.gridHelper) this.gridHelper.visible = false;
                } else {
                    this.scene.background = new THREE.Color(0x000000);
                    if (this.ground) this.ground.visible = true;
                    if (this.gridHelper) this.gridHelper.visible = true;
                }
                this.currentEnvironment = envName;
            } else {
                console.warn('No custom HDR loaded. Please upload an HDR file first.');
                alert('Please upload an HDR file first using the "Load HDR File" option.');
            }
            return;
        }

        // Dispose old environment for this type if it exists
        if (this.environments[envName]) {
            this.environments[envName].dispose();
            delete this.environments[envName];
        }

        // Create environment
        switch(envName) {
            case 'Studio':
                this.createStudioEnvironment();
                break;
            case 'Natural':
                this.createNaturalEnvironment();
                break;
            case 'Venice':
                this.createVeniceEnvironment();
                break;
        }

        // Apply environment
        if (this.environments[envName]) {
            this.scene.environment = this.environments[envName];
            // Use environment as background if enabled
            if (this.showBackground) {
                this.scene.background = this.environments[envName];
                // Hide ground and grid when showing environment background
                if (this.ground) this.ground.visible = false;
                if (this.gridHelper) this.gridHelper.visible = false;
            } else {
                this.scene.background = new THREE.Color(0x000000);
                // Show ground and grid when not showing background
                if (this.ground) this.ground.visible = true;
                if (this.gridHelper) this.gridHelper.visible = true;
            }
            this.currentEnvironment = envName;
        }
    }

    setBackgroundVisibility(visible) {
        this.showBackground = visible;
        if (visible && this.currentEnvironment !== 'None' && this.environments[this.currentEnvironment]) {
            this.scene.background = this.environments[this.currentEnvironment];
            // Hide ground and grid when showing environment background
            if (this.ground) this.ground.visible = false;
            if (this.gridHelper) this.gridHelper.visible = false;
        } else {
            this.scene.background = new THREE.Color(0x000000);
            // Show ground and grid when not showing background
            if (this.ground) this.ground.visible = true;
            if (this.gridHelper) this.gridHelper.visible = true;
        }
    }

    setBackgroundBlur(level) {
        this.backgroundBlurLevel = level;
        // Re-generate environment with new blur level
        if (this.currentEnvironment && this.currentEnvironment !== 'None') {
            this.setEnvironment(this.currentEnvironment);
        }
    }

    setToneMapping(mapping) {
        switch(mapping) {
            case 'Linear':
                this.renderer.toneMapping = THREE.LinearToneMapping;
                break;
            case 'ACES':
                this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
                break;
            case 'Cineon':
                this.renderer.toneMapping = THREE.CineonToneMapping;
                break;
            case 'Reinhard':
                this.renderer.toneMapping = THREE.ReinhardToneMapping;
                break;
            default:
                this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        }
    }

    setupLights() {
        // Reduce direct lighting since we have IBL environment
        // PBR works best with environment lighting (IBL) as primary light source

        // Subtle ambient for base illumination
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(this.ambientLight);

        // Main directional light (sun) - reduced intensity for PBR
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 2.5); // Intensity in lumens for physical lights
        this.directionalLight.position.set(5, 10, 5);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.camera.left = -50;
        this.directionalLight.shadow.camera.right = 50;
        this.directionalLight.shadow.camera.top = 50;
        this.directionalLight.shadow.camera.bottom = -50;
        this.directionalLight.shadow.camera.near = 0.1;
        this.directionalLight.shadow.camera.far = 200;
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.bias = -0.0005; // Reduce shadow acne
        this.scene.add(this.directionalLight);

        // Hemisphere light for subtle fill lighting
        this.hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.2);
        this.scene.add(this.hemisphereLight);

        // Note: Main lighting comes from IBL environment map for proper PBR
    }

    setupGround() {
        // Create a large ground plane with dark color
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222, // Dark gray ground
            roughness: 0.8,
            metalness: 0.0,
            opacity: 0.8,
            transparent: true
        });
        this.ground = new THREE.Mesh(groundGeometry, groundMaterial);
        this.ground.rotation.x = -Math.PI / 2;
        this.ground.receiveShadow = true;
        this.scene.add(this.ground);

        // Add a grid helper
        this.gridHelper = new THREE.GridHelper(200, 100, 0x444444, 0x444444);
        this.gridHelper.material.opacity = 0.3;
        this.gridHelper.material.transparent = true;
        this.scene.add(this.gridHelper);
    }

    setupUI() {
        // Language switcher
        const langSwitcher = document.getElementById('language-switcher');
        if (langSwitcher) {
            langSwitcher.addEventListener('click', () => {
                const newLang = this.i18n.getLanguage() === 'en' ? 'ko' : 'en';
                this.i18n.setLanguage(newLang);
            });
        }

        // File input
        const fileInput = document.getElementById('file-input');
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.loadGLTF(file);
            }
        });

        // Mode buttons
        const buttons = document.querySelectorAll('.mode-button');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const mode = button.dataset.mode;
                this.cameraController.setMode(mode);

                // Update button states
                buttons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }

    loadGLTF(file) {
        const url = URL.createObjectURL(file);

        // Remove previous model
        if (this.loadedModel) {
            this.scene.remove(this.loadedModel);
        }

        this.gltfLoader.load(
            url,
            (gltf) => {
                this.loadedModel = gltf.scene;

                // Enable shadows
                this.loadedModel.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                // Center and scale the model
                const box = new THREE.Box3().setFromObject(this.loadedModel);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());

                // Scale to fit
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 5 / maxDim;
                this.loadedModel.scale.multiplyScalar(scale);

                // Center on ground
                box.setFromObject(this.loadedModel);
                box.getCenter(center);
                this.loadedModel.position.x = -center.x;
                this.loadedModel.position.z = -center.z;
                this.loadedModel.position.y = -box.min.y;

                this.scene.add(this.loadedModel);

                console.log('GLTF loaded successfully');
            },
            (progress) => {
                console.log('Loading:', (progress.loaded / progress.total * 100) + '%');
            },
            (error) => {
                console.error('Error loading GLTF:', error);
            }
        );
    }

    setupSettings() {
        // Toggle settings panel
        const toggleButton = document.getElementById('toggle-settings');
        const settingsPanel = document.getElementById('settings-panel');

        toggleButton.addEventListener('click', () => {
            settingsPanel.classList.toggle('hidden');
        });

        // Player settings
        const playerScale = document.getElementById('player-scale');
        const playerScaleValue = document.getElementById('player-scale-value');
        playerScale.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.player.setScale(value);
            playerScaleValue.textContent = value.toFixed(3) + 'x';
        });

        const playerHeight = document.getElementById('player-height');
        const playerHeightValue = document.getElementById('player-height-value');
        playerHeight.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.player.setEyeHeight(value);
            playerHeightValue.textContent = value.toFixed(3) + 'm';
        });

        const playerSpeed = document.getElementById('player-speed');
        const playerSpeedValue = document.getElementById('player-speed-value');
        playerSpeed.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.player.setSpeed(value);
            playerSpeedValue.textContent = value.toFixed(2);
        });

        const groundLevel = document.getElementById('ground-level');
        const groundLevelValue = document.getElementById('ground-level-value');
        groundLevel.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.player.setGroundLevel(value);
            groundLevelValue.textContent = value.toFixed(2) + 'm';
        });

        const thirdPersonDistance = document.getElementById('third-person-distance');
        const thirdPersonDistanceValue = document.getElementById('third-person-distance-value');
        thirdPersonDistance.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.cameraController.setThirdPersonDistance(value);
            thirdPersonDistanceValue.textContent = value.toFixed(2) + 'm';
        });

        const thirdPersonHeight = document.getElementById('third-person-height');
        const thirdPersonHeightValue = document.getElementById('third-person-height-value');
        thirdPersonHeight.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.cameraController.setThirdPersonHeight(value);
            thirdPersonHeightValue.textContent = value.toFixed(3) + 'm';
        });

        // Post-processing settings
        const enablePostProcessing = document.getElementById('enable-postprocessing');
        enablePostProcessing.addEventListener('change', (e) => {
            if (this.postProcessing) {
                this.postProcessing.setEnabled(e.target.checked);
            }
        });

        const enableBloom = document.getElementById('enable-bloom');
        enableBloom.addEventListener('change', (e) => {
            if (this.postProcessing) {
                this.postProcessing.setBloomEnabled(e.target.checked);
            }
        });

        const enableSSAO = document.getElementById('enable-ssao');
        enableSSAO.addEventListener('change', (e) => {
            if (this.postProcessing) {
                this.postProcessing.setSSAOEnabled(e.target.checked);
            }
        });

        // Time of day settings
        const enableTimeCycle = document.getElementById('enable-time-cycle');
        enableTimeCycle.addEventListener('change', (e) => {
            this.timeOfDay.setEnabled(e.target.checked);
        });

        const timeOfDay = document.getElementById('time-of-day');
        const timeValue = document.getElementById('time-value');
        timeOfDay.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.timeOfDay.setTime(value);
            this.updateTimeDisplay();
        });

        const timeSpeed = document.getElementById('time-speed');
        const timeSpeedValue = document.getElementById('time-speed-value');
        timeSpeed.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.timeOfDay.setTimeSpeed(value);
            timeSpeedValue.textContent = value.toFixed(0) + 'x';
        });

        const sunIntensity = document.getElementById('sun-intensity');
        const sunIntensityValue = document.getElementById('sun-intensity-value');
        sunIntensity.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.timeOfDay.setSunIntensity(value);
            sunIntensityValue.textContent = value.toFixed(1);
        });

        // Graphics settings
        const enableShadows = document.getElementById('enable-shadows');
        enableShadows.addEventListener('change', (e) => {
            this.renderer.shadowMap.enabled = e.target.checked;
            this.directionalLight.castShadow = e.target.checked;
        });

        const enableFog = document.getElementById('enable-fog');
        enableFog.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.scene.fog = new THREE.Fog(0x87CEEB, 10, 100);
            } else {
                this.scene.fog = null;
            }
        });

        const pixelRatio = document.getElementById('pixel-ratio');
        const pixelRatioValue = document.getElementById('pixel-ratio-value');
        pixelRatio.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.renderer.setPixelRatio(window.devicePixelRatio * value);
            pixelRatioValue.textContent = value.toFixed(2) + 'x';
        });

        // Environment selection
        const environmentSelect = document.getElementById('environment-select');
        if (environmentSelect) {
            environmentSelect.addEventListener('change', (e) => {
                this.setEnvironment(e.target.value);
            });
        }

        // HDR file input
        const hdrInput = document.getElementById('hdr-input');
        if (hdrInput) {
            hdrInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.loadCustomHDR(file);
                }
            });
        }

        // Tone mapping selection
        const toneMapping = document.getElementById('tone-mapping');
        if (toneMapping) {
            toneMapping.addEventListener('change', (e) => {
                this.setToneMapping(e.target.value);
            });
        }

        // Exposure control for PBR
        const exposure = document.getElementById('exposure');
        const exposureValue = document.getElementById('exposure-value');
        if (exposure) {
            exposure.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.renderer.toneMappingExposure = value;
                exposureValue.textContent = value.toFixed(2);
            });
        }

        // Punctual lights toggle
        const punctualLights = document.getElementById('punctual-lights');
        if (punctualLights) {
            punctualLights.addEventListener('change', (e) => {
                this.punctualLightsEnabled = e.target.checked;
                // Toggle all non-ambient lights
                this.directionalLight.visible = e.target.checked;
                this.hemisphereLight.visible = e.target.checked;
            });
        }

        // Ambient intensity
        const ambientIntensity = document.getElementById('ambient-intensity');
        const ambientIntensityValue = document.getElementById('ambient-intensity-value');
        if (ambientIntensity) {
            ambientIntensity.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.ambientLight.intensity = value;
                ambientIntensityValue.textContent = value.toFixed(1);
            });
        }

        // Ambient color
        const ambientColor = document.getElementById('ambient-color');
        if (ambientColor) {
            ambientColor.addEventListener('input', (e) => {
                this.ambientLight.color = new THREE.Color(e.target.value);
            });
        }

        // Directional intensity
        const directIntensity = document.getElementById('direct-intensity');
        const directIntensityValue = document.getElementById('direct-intensity-value');
        if (directIntensity) {
            directIntensity.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.directionalLight.intensity = value;
                directIntensityValue.textContent = value.toFixed(1);
            });
        }

        // Directional color
        const directColor = document.getElementById('direct-color');
        if (directColor) {
            directColor.addEventListener('input', (e) => {
                this.directionalLight.color = new THREE.Color(e.target.value);
            });
        }

        // Environment intensity for PBR
        const envIntensity = document.getElementById('env-intensity');
        const envIntensityValue = document.getElementById('env-intensity-value');
        if (envIntensity) {
            envIntensity.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                // Store the intensity value - will be applied when generating environments
                this.environmentIntensity = value;
                // Recreate current environment with new intensity
                if (this.currentEnvironment && this.currentEnvironment !== 'None') {
                    this.setEnvironment(this.currentEnvironment);
                }
                envIntensityValue.textContent = value.toFixed(2);
            });
        }

        // Background visibility toggle
        const showBackground = document.getElementById('show-background');
        if (showBackground) {
            showBackground.addEventListener('change', (e) => {
                this.setBackgroundVisibility(e.target.checked);
            });
        }

        // Background blur control
        const backgroundBlur = document.getElementById('background-blur');
        const backgroundBlurValue = document.getElementById('background-blur-value');
        if (backgroundBlur) {
            backgroundBlur.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.setBackgroundBlur(value);
                backgroundBlurValue.textContent = value.toFixed(1);
            });
        }

        // Particle system controls
        const enableParticles = document.getElementById('enable-particles');
        enableParticles.addEventListener('change', (e) => {
            if (this.particleSystem) {
                this.particleSystem.setEnabled(e.target.checked);
            }
        });

        const particleShape = document.getElementById('particle-shape');
        particleShape.addEventListener('change', (e) => {
            if (this.particleSystem) {
                this.particleSystem.morphToShape(e.target.value);
            }
        });

        const particleSize = document.getElementById('particle-size');
        const particleSizeValue = document.getElementById('particle-size-value');
        particleSize.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (this.particleSystem) {
                this.particleSystem.setSize(value);
            }
            particleSizeValue.textContent = value.toFixed(2);
        });

        const particleSpeed = document.getElementById('particle-speed');
        const particleSpeedValue = document.getElementById('particle-speed-value');
        particleSpeed.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (this.particleSystem) {
                this.particleSystem.setSpeed(value);
            }
            particleSpeedValue.textContent = value.toFixed(1);
        });

        // Glitch effect controls
        const enableGlitch = document.getElementById('enable-glitch');
        enableGlitch.addEventListener('change', (e) => {
            if (this.postProcessing) {
                this.postProcessing.setGlitchEnabled(e.target.checked);
            }
        });

        const triggerGlitch = document.getElementById('trigger-glitch');
        triggerGlitch.addEventListener('click', () => {
            if (this.postProcessing) {
                this.postProcessing.triggerGlitch(1.0, 0.5);
            }
        });

        // Settings management
        const saveSettings = document.getElementById('save-settings');
        if (saveSettings) {
            saveSettings.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        const loadSettings = document.getElementById('load-settings');
        if (loadSettings) {
            loadSettings.addEventListener('click', () => {
                this.loadSettings();
            });
        }

        const resetSettings = document.getElementById('reset-settings');
        if (resetSettings) {
            resetSettings.addEventListener('click', () => {
                if (confirm(this.i18n.t('settings-reset-confirm'))) {
                    this.resetSettings();
                }
            });
        }

        const exportSettings = document.getElementById('export-settings');
        if (exportSettings) {
            exportSettings.addEventListener('click', () => {
                this.exportSettings();
            });
        }

        const importSettings = document.getElementById('import-settings');
        if (importSettings) {
            importSettings.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.importSettings(file);
                }
            });
        }
    }

    saveSettings() {
        const settings = {
            // Player settings
            playerScale: this.player.scale.x,
            playerEyeHeight: this.player.eyeHeight,
            playerSpeed: this.player.speed,
            groundLevel: this.player.groundLevel,
            thirdPersonDistance: this.cameraController.thirdPersonDistance,
            thirdPersonHeight: this.cameraController.thirdPersonHeight,

            // Post-processing
            postProcessingEnabled: this.postProcessing?.enabled || false,
            bloomEnabled: this.postProcessing?.bloomEnabled || false,
            ssaoEnabled: this.postProcessing?.ssaoEnabled || false,

            // Time of day
            timeCycleEnabled: this.timeOfDay.enabled,
            timeOfDay: this.timeOfDay.timeOfDay,
            timeSpeed: this.timeOfDay.timeSpeed,
            sunIntensity: this.timeOfDay.sunIntensity,

            // Graphics
            shadowsEnabled: this.renderer.shadowMap.enabled,
            fogEnabled: this.scene.fog !== null,
            pixelRatio: this.renderer.getPixelRatio() / window.devicePixelRatio,

            // Environment & Lighting
            environment: this.currentEnvironment,
            toneMapping: this.getToneMappingName(),
            exposure: this.renderer.toneMappingExposure,
            punctualLights: this.punctualLightsEnabled,
            ambientIntensity: this.ambientLight.intensity,
            ambientColor: '#' + this.ambientLight.color.getHexString(),
            directIntensity: this.directionalLight.intensity,
            directColor: '#' + this.directionalLight.color.getHexString(),
            envIntensity: this.environmentIntensity,
            showBackground: this.showBackground,
            backgroundBlur: this.backgroundBlurLevel,

            // Particles
            particlesEnabled: this.particleSystem?.enabled || false,
            particleShape: this.particleSystem?.currentShape || 'sphere',
            particleSize: this.particleSystem?.size || 0.5,
            particleSpeed: this.particleSystem?.speed || 0.5,

            // Glitch
            glitchEnabled: this.postProcessing?.glitchEnabled || false,

            timestamp: new Date().toISOString()
        };

        // Save to localStorage
        localStorage.setItem('gltfViewerSettings', JSON.stringify(settings));
        console.log('Settings saved:', settings);
        alert(this.i18n.t('settings-saved'));
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('gltfViewerSettings');
        if (!savedSettings) {
            alert(this.i18n.t('no-saved-settings'));
            return;
        }

        try {
            const settings = JSON.parse(savedSettings);
            this.applySettings(settings);
            console.log('Settings loaded:', settings);
            alert(this.i18n.t('settings-loaded'));
        } catch (error) {
            console.error('Error loading settings:', error);
            alert(this.i18n.t('settings-load-error'));
        }
    }

    resetSettings() {
        localStorage.removeItem('gltfViewerSettings');
        location.reload();
    }

    exportSettings() {
        const savedSettings = localStorage.getItem('gltfViewerSettings');
        if (!savedSettings) {
            alert(this.i18n.t('no-settings-to-export'));
            return;
        }

        const blob = new Blob([savedSettings], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gltf-viewer-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('Settings exported');
    }

    importSettings(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const settings = JSON.parse(e.target.result);
                this.applySettings(settings);
                // Also save to localStorage
                localStorage.setItem('gltfViewerSettings', e.target.result);
                console.log('Settings imported:', settings);
                alert(this.i18n.t('settings-imported'));
            } catch (error) {
                console.error('Error importing settings:', error);
                alert(this.i18n.t('settings-import-error'));
            }
        };
        reader.readAsText(file);
    }

    applySettings(settings) {
        // Player settings
        if (settings.playerScale !== undefined) {
            this.player.setScale(settings.playerScale);
            document.getElementById('player-scale').value = settings.playerScale;
            document.getElementById('player-scale-value').textContent = settings.playerScale.toFixed(3) + 'x';
        }
        if (settings.playerEyeHeight !== undefined) {
            this.player.setEyeHeight(settings.playerEyeHeight);
            document.getElementById('player-height').value = settings.playerEyeHeight;
            document.getElementById('player-height-value').textContent = settings.playerEyeHeight.toFixed(3) + 'm';
        }
        if (settings.playerSpeed !== undefined) {
            this.player.setSpeed(settings.playerSpeed);
            document.getElementById('player-speed').value = settings.playerSpeed;
            document.getElementById('player-speed-value').textContent = settings.playerSpeed.toFixed(2);
        }
        if (settings.groundLevel !== undefined) {
            this.player.setGroundLevel(settings.groundLevel);
            document.getElementById('ground-level').value = settings.groundLevel;
            document.getElementById('ground-level-value').textContent = settings.groundLevel.toFixed(2) + 'm';
        }
        if (settings.thirdPersonDistance !== undefined) {
            this.cameraController.setThirdPersonDistance(settings.thirdPersonDistance);
            document.getElementById('third-person-distance').value = settings.thirdPersonDistance;
            document.getElementById('third-person-distance-value').textContent = settings.thirdPersonDistance.toFixed(2) + 'm';
        }
        if (settings.thirdPersonHeight !== undefined) {
            this.cameraController.setThirdPersonHeight(settings.thirdPersonHeight);
            document.getElementById('third-person-height').value = settings.thirdPersonHeight;
            document.getElementById('third-person-height-value').textContent = settings.thirdPersonHeight.toFixed(3) + 'm';
        }

        // Post-processing
        if (this.postProcessing) {
            if (settings.postProcessingEnabled !== undefined) {
                this.postProcessing.setEnabled(settings.postProcessingEnabled);
                document.getElementById('enable-postprocessing').checked = settings.postProcessingEnabled;
            }
            if (settings.bloomEnabled !== undefined) {
                this.postProcessing.setBloomEnabled(settings.bloomEnabled);
                document.getElementById('enable-bloom').checked = settings.bloomEnabled;
            }
            if (settings.ssaoEnabled !== undefined) {
                this.postProcessing.setSSAOEnabled(settings.ssaoEnabled);
                document.getElementById('enable-ssao').checked = settings.ssaoEnabled;
            }
            if (settings.glitchEnabled !== undefined) {
                this.postProcessing.setGlitchEnabled(settings.glitchEnabled);
                document.getElementById('enable-glitch').checked = settings.glitchEnabled;
            }
        }

        // Time of day
        if (settings.timeCycleEnabled !== undefined) {
            this.timeOfDay.setEnabled(settings.timeCycleEnabled);
            document.getElementById('enable-time-cycle').checked = settings.timeCycleEnabled;
        }
        if (settings.timeOfDay !== undefined) {
            this.timeOfDay.setTime(settings.timeOfDay);
            this.updateTimeDisplay();
        }
        if (settings.timeSpeed !== undefined) {
            this.timeOfDay.setTimeSpeed(settings.timeSpeed);
            document.getElementById('time-speed').value = settings.timeSpeed;
            document.getElementById('time-speed-value').textContent = settings.timeSpeed.toFixed(0) + 'x';
        }
        if (settings.sunIntensity !== undefined) {
            this.timeOfDay.setSunIntensity(settings.sunIntensity);
            document.getElementById('sun-intensity').value = settings.sunIntensity;
            document.getElementById('sun-intensity-value').textContent = settings.sunIntensity.toFixed(1);
        }

        // Graphics
        if (settings.shadowsEnabled !== undefined) {
            this.renderer.shadowMap.enabled = settings.shadowsEnabled;
            this.directionalLight.castShadow = settings.shadowsEnabled;
            document.getElementById('enable-shadows').checked = settings.shadowsEnabled;
        }
        if (settings.fogEnabled !== undefined) {
            if (settings.fogEnabled) {
                this.scene.fog = new THREE.Fog(0x87CEEB, 10, 100);
            } else {
                this.scene.fog = null;
            }
            document.getElementById('enable-fog').checked = settings.fogEnabled;
        }
        if (settings.pixelRatio !== undefined) {
            this.renderer.setPixelRatio(window.devicePixelRatio * settings.pixelRatio);
            document.getElementById('pixel-ratio').value = settings.pixelRatio;
            document.getElementById('pixel-ratio-value').textContent = settings.pixelRatio.toFixed(2) + 'x';
        }

        // Environment & Lighting
        if (settings.environment !== undefined && settings.environment !== 'Custom') {
            this.setEnvironment(settings.environment);
            document.getElementById('environment-select').value = settings.environment;
        }
        if (settings.toneMapping !== undefined) {
            this.setToneMapping(settings.toneMapping);
            document.getElementById('tone-mapping').value = settings.toneMapping;
        }
        if (settings.exposure !== undefined) {
            this.renderer.toneMappingExposure = settings.exposure;
            document.getElementById('exposure').value = settings.exposure;
            document.getElementById('exposure-value').textContent = settings.exposure.toFixed(2);
        }
        if (settings.punctualLights !== undefined) {
            this.punctualLightsEnabled = settings.punctualLights;
            this.directionalLight.visible = settings.punctualLights;
            this.hemisphereLight.visible = settings.punctualLights;
            document.getElementById('punctual-lights').checked = settings.punctualLights;
        }
        if (settings.ambientIntensity !== undefined) {
            this.ambientLight.intensity = settings.ambientIntensity;
            document.getElementById('ambient-intensity').value = settings.ambientIntensity;
            document.getElementById('ambient-intensity-value').textContent = settings.ambientIntensity.toFixed(1);
        }
        if (settings.ambientColor !== undefined) {
            this.ambientLight.color = new THREE.Color(settings.ambientColor);
            document.getElementById('ambient-color').value = settings.ambientColor;
        }
        if (settings.directIntensity !== undefined) {
            this.directionalLight.intensity = settings.directIntensity;
            document.getElementById('direct-intensity').value = settings.directIntensity;
            document.getElementById('direct-intensity-value').textContent = settings.directIntensity.toFixed(1);
        }
        if (settings.directColor !== undefined) {
            this.directionalLight.color = new THREE.Color(settings.directColor);
            document.getElementById('direct-color').value = settings.directColor;
        }
        if (settings.envIntensity !== undefined) {
            this.environmentIntensity = settings.envIntensity;
            if (this.currentEnvironment && this.currentEnvironment !== 'None') {
                this.setEnvironment(this.currentEnvironment);
            }
            document.getElementById('env-intensity').value = settings.envIntensity;
            document.getElementById('env-intensity-value').textContent = settings.envIntensity.toFixed(2);
        }
        if (settings.showBackground !== undefined) {
            this.setBackgroundVisibility(settings.showBackground);
            document.getElementById('show-background').checked = settings.showBackground;
        }
        if (settings.backgroundBlur !== undefined) {
            this.setBackgroundBlur(settings.backgroundBlur);
            document.getElementById('background-blur').value = settings.backgroundBlur;
            document.getElementById('background-blur-value').textContent = settings.backgroundBlur.toFixed(1);
        }

        // Particles
        if (this.particleSystem) {
            if (settings.particlesEnabled !== undefined) {
                this.particleSystem.setEnabled(settings.particlesEnabled);
                document.getElementById('enable-particles').checked = settings.particlesEnabled;
            }
            if (settings.particleShape !== undefined) {
                this.particleSystem.morphToShape(settings.particleShape);
                document.getElementById('particle-shape').value = settings.particleShape;
            }
            if (settings.particleSize !== undefined) {
                this.particleSystem.setSize(settings.particleSize);
                document.getElementById('particle-size').value = settings.particleSize;
                document.getElementById('particle-size-value').textContent = settings.particleSize.toFixed(2);
            }
            if (settings.particleSpeed !== undefined) {
                this.particleSystem.setSpeed(settings.particleSpeed);
                document.getElementById('particle-speed').value = settings.particleSpeed;
                document.getElementById('particle-speed-value').textContent = settings.particleSpeed.toFixed(1);
            }
        }
    }

    getToneMappingName() {
        switch(this.renderer.toneMapping) {
            case THREE.LinearToneMapping: return 'Linear';
            case THREE.ACESFilmicToneMapping: return 'ACES';
            case THREE.CineonToneMapping: return 'Cineon';
            case THREE.ReinhardToneMapping: return 'Reinhard';
            default: return 'ACES';
        }
    }

    updateTimeDisplay() {
        const timeValue = document.getElementById('time-value');
        const timeSlider = document.getElementById('time-of-day');
        const currentTime = this.timeOfDay.timeOfDay;
        const hours = Math.floor(currentTime);
        const minutes = Math.floor((currentTime % 1) * 60);
        timeValue.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        timeSlider.value = currentTime;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = this.clock.getDelta();

        try {
            // Update player and camera
            this.player.update(deltaTime, this.cameraController);
            this.cameraController.update(this.player);

            // Update time of day
            this.timeOfDay.update(deltaTime);

            // Update particle system
            if (this.particleSystem) {
                this.particleSystem.update(deltaTime);
            }

            // Update time display only once per second (not every frame)
            if (this.timeOfDay.enabled) {
                if (!this.lastTimeUpdate) this.lastTimeUpdate = 0;
                this.lastTimeUpdate += deltaTime;
                if (this.lastTimeUpdate >= 1.0) {
                    this.updateTimeDisplay();
                    this.lastTimeUpdate = 0;
                }
            }

            // Environment map updates removed to fix keyboard input issues
            // PBR reflections will use static environment for now

            // Render
            if (this.postProcessing && this.postProcessing.enabled) {
                this.postProcessing.render(deltaTime);
            } else {
                this.renderer.render(this.scene, this.cameraController.camera);
            }
        } catch (error) {
            console.error('Animation loop error:', error);
            // Fallback render
            this.renderer.render(this.scene, this.cameraController.camera);
        }
    }
}

// Initialize the viewer
new GLTFViewer();
