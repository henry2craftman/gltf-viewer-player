import * as THREE from 'three';
import { WebGLPathTracer } from 'three-gpu-pathtracer';

/**
 * PathTracingRenderer - Realistic ray tracing with global illumination
 * Uses GPU-accelerated path tracing for photorealistic rendering
 */
export class PathTracingRenderer {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;

        // Path tracer settings (matching example)
        this.enabled = false;
        this.renderScale = 1.0; // Resolution scale (0.5 = half res for performance)
        this.bounces = 5; // Number of light bounces
        this.transmissiveBounces = 10; // Bounces for transparent materials
        this.filterGlossyFactor = 0.5; // Filter glossy reflections for faster convergence

        // Performance settings
        this.tilesX = 2; // Horizontal tiles for progressive rendering
        this.tilesY = 2; // Vertical tiles for progressive rendering

        // Create path tracer
        this.pathTracer = null;

        // Store original renderer settings
        this.originalSettings = {
            toneMapping: renderer.toneMapping,
            toneMappingExposure: renderer.toneMappingExposure
        };

        console.log('PathTracingRenderer initialized');
    }

    /**
     * Initialize the path tracer
     */
    init() {
        try {
            // Set up renderer for path tracing
            this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
            this.renderer.toneMappingExposure = 1.0;

            // Temporarily clear environment to avoid rotation errors during init
            const tempEnv = this.scene.environment;
            const tempBg = this.scene.background;
            this.scene.environment = null;
            this.scene.background = null;

            // Create path tracer instance (matching example)
            // Don't pass scene/camera to constructor - will call setScene later
            this.pathTracer = new WebGLPathTracer(this.renderer);
            this.pathTracer.tiles.set(this.tilesX, this.tilesY);

            // Set environment rotation to default Euler to prevent errors
            this.pathTracer.environmentRotation = new THREE.Euler(0, 0, 0);

            // Restore environment
            this.scene.environment = tempEnv;
            this.scene.background = tempBg;

            // Configure path tracer parameters
            this.updateSettings();

            console.log('Path tracer created successfully');
            return true;
        } catch (error) {
            console.error('Failed to create path tracer:', error);
            return false;
        }
    }

    /**
     * Update path tracer settings
     */
    updateSettings() {
        if (!this.pathTracer) return;

        this.pathTracer.bounces = this.bounces;
        this.pathTracer.transmissiveBounces = this.transmissiveBounces;
        this.pathTracer.renderScale = this.renderScale;
        this.pathTracer.filterGlossyFactor = this.filterGlossyFactor;
    }

    /**
     * Set the scene for path tracing
     */
    setScene(scene, camera) {
        // Update scene and camera references first
        this.scene = scene;
        this.camera = camera;

        if (!this.pathTracer) {
            this.init();
        }

        if (this.pathTracer) {

            // Temporarily clear environment and background to avoid rotation errors
            // The path tracer's updateEnvironment expects textures with rotation property
            const tempEnv = scene.environment;
            const tempBg = scene.background;
            scene.environment = null;
            scene.background = null;

            try {
                // Ensure environment rotation is set on the path tracer
                if (!this.pathTracer.environmentRotation) {
                    this.pathTracer.environmentRotation = new THREE.Euler(0, 0, 0);
                }

                this.pathTracer.setScene(scene, camera);
                console.log('Path tracer scene set successfully');
            } catch (error) {
                console.error('Error setting path tracer scene:', error);
            }

            // Restore environment and background
            scene.environment = tempEnv;
            scene.background = tempBg;

            this.reset();
        }
    }

    /**
     * Reset path tracer (restart sampling)
     */
    reset() {
        if (this.pathTracer) {
            this.pathTracer.reset();
        }
    }

    /**
     * Render a single sample (matching example - no max samples limit)
     */
    renderSample() {
        if (!this.enabled || !this.pathTracer) return;

        // Debug: log every 10 samples
        if (this.samples % 10 === 0 && this.samples > 0) {
            console.log(`Path Tracing: ${this.samples} samples rendered`);
        }

        this.pathTracer.renderSample();
    }

    /**
     * Enable/disable path tracing
     */
    setEnabled(enabled) {
        const wasEnabled = this.enabled;
        this.enabled = enabled;

        if (enabled && !wasEnabled) {
            // Switching to path tracing
            if (!this.pathTracer) {
                console.log('Initializing path tracer for first time...');
                this.init();
                this.setScene(this.scene, this.camera);
            }
            this.reset();
            console.log('✅ Path tracing ENABLED - You should see progressive rendering now');
            console.log('Camera position:', this.camera.position);
            console.log('Scene objects:', this.scene.children.length);
        } else if (!enabled && wasEnabled) {
            // Switching back to standard rendering
            this.restoreRendererSettings();
            console.log('❌ Path tracing DISABLED - Back to standard rendering');
        }
    }

    /**
     * Update camera (call when camera moves)
     */
    updateCamera() {
        if (this.pathTracer) {
            this.pathTracer.updateCamera();
        }
    }

    /**
     * Set render scale (resolution)
     */
    setRenderScale(scale) {
        this.renderScale = Math.max(0.1, Math.min(1.0, scale));
        this.updateSettings();
        this.reset();
        console.log('Render scale set to:', this.renderScale);
    }

    /**
     * Set number of light bounces
     */
    setBounces(bounces) {
        this.bounces = Math.max(1, Math.min(20, bounces));
        this.updateSettings();
        this.reset();
        console.log('Bounces set to:', this.bounces);
    }

    /**
     * Set transmissive bounces (for glass, etc.)
     */
    setTransmissiveBounces(bounces) {
        this.transmissiveBounces = Math.max(1, Math.min(20, bounces));
        this.updateSettings();
        this.reset();
        console.log('Transmissive bounces set to:', this.transmissiveBounces);
    }

    /**
     * Set progressive rendering tiles
     */
    setTiles(x, y) {
        this.tilesX = x;
        this.tilesY = y;
        if (this.pathTracer) {
            this.pathTracer.tiles.set(x, y);
            this.reset();
        }
        console.log('Tiles set to:', x, 'x', y);
    }

    /**
     * Set filter glossy factor
     */
    setFilterGlossyFactor(factor) {
        this.filterGlossyFactor = Math.max(0, Math.min(1, factor));
        this.updateSettings();
        console.log('Filter glossy factor set to:', this.filterGlossyFactor);
    }

    /**
     * Get current sample count
     */
    get samples() {
        return this.pathTracer ? this.pathTracer.samples : 0;
    }

    /**
     * Check if path tracer is compiling
     */
    get isCompiling() {
        return this.pathTracer ? this.pathTracer.isCompiling : false;
    }

    /**
     * Restore original renderer settings
     */
    restoreRendererSettings() {
        this.renderer.toneMapping = this.originalSettings.toneMapping;
        this.renderer.toneMappingExposure = this.originalSettings.toneMappingExposure;
    }

    /**
     * Update (called every frame) - simplified version matching example
     */
    update() {
        if (this.enabled) {
            this.renderSample();
        }
    }

    /**
     * Dispose path tracer resources
     */
    dispose() {
        if (this.pathTracer) {
            this.pathTracer.dispose();
            this.pathTracer = null;
        }
        this.restoreRendererSettings();
    }

    /**
     * Get rendering statistics
     */
    getStats() {
        return {
            enabled: this.enabled,
            samples: this.samples,
            isCompiling: this.isCompiling,
            bounces: this.bounces,
            transmissiveBounces: this.transmissiveBounces,
            renderScale: this.renderScale,
            filterGlossyFactor: this.filterGlossyFactor,
            tiles: `${this.tilesX}x${this.tilesY}`
        };
    }
}
