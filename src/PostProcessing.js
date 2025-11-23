import * as THREE from 'three';
import {
    EffectComposer,
    RenderPass,
    EffectPass,
    BloomEffect,
    SSAOEffect,
    VignetteEffect,
    SMAAEffect
} from 'postprocessing';
import { GlitchEffect } from './GlitchEffectPass.js';

export class PostProcessingManager {
    constructor(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;

        // Create effect composer
        this.composer = new EffectComposer(renderer);

        // Create glitch effect (now compatible with postprocessing)
        this.glitchEffect = new GlitchEffect();

        // Add render pass
        this.renderPass = new RenderPass(scene, camera);
        this.composer.addPass(this.renderPass);

        // Create effects
        this.effects = {
            bloom: null,
            ssao: null,
            vignette: null,
            smaa: null,
            glitch: this.glitchEffect // Add glitch to effects
        };

        this.effectPasses = {
            bloom: null,
            ssao: null,
            enhanced: null,
            glitch: null // Add glitch pass placeholder
        };

        // Settings
        this.enabled = false;
        this.bloomEnabled = false;
        this.ssaoEnabled = false;

        this.setupEffects();
    }

    setupEffects() {
        // Bloom effect
        this.effects.bloom = new BloomEffect({
            intensity: 1.0,
            luminanceThreshold: 0.9,
            luminanceSmoothing: 0.3
        });

        // SSAO effect
        this.effects.ssao = new SSAOEffect(this.camera, null, {
            intensity: 1.0,
            radius: 0.1
        });

        // Vignette effect
        this.effects.vignette = new VignetteEffect({
            offset: 0.35,
            darkness: 0.5
        });

        // SMAA (anti-aliasing)
        this.effects.smaa = new SMAAEffect();

        // Create enhanced pass (always active when postprocessing is enabled)
        this.effectPasses.enhanced = new EffectPass(
            this.camera,
            this.effects.vignette,
            this.effects.smaa
        );
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        this.updatePasses();
    }

    setBloomEnabled(enabled) {
        this.bloomEnabled = enabled;
        this.updatePasses();
    }

    setSSAOEnabled(enabled) {
        this.ssaoEnabled = enabled;
        this.updatePasses();
    }

    updatePasses() {
        // Remove all effect passes
        while (this.composer.passes.length > 1) {
            this.composer.removePass(this.composer.passes[this.composer.passes.length - 1]);
        }

        if (!this.enabled) {
            return;
        }

        // Add bloom pass
        if (this.bloomEnabled) {
            if (!this.effectPasses.bloom) {
                this.effectPasses.bloom = new EffectPass(this.camera, this.effects.bloom);
            }
            this.composer.addPass(this.effectPasses.bloom);
        }

        // Add SSAO pass
        if (this.ssaoEnabled) {
            if (!this.effectPasses.ssao) {
                this.effectPasses.ssao = new EffectPass(this.camera, this.effects.ssao);
            }
            this.composer.addPass(this.effectPasses.ssao);
        }

        // Always add enhanced pass when postprocessing is enabled
        this.composer.addPass(this.effectPasses.enhanced);

        // Add glitch pass if glitch effect is active
        if (this.glitchEffect && this.glitchEffect.isActive) {
            if (!this.effectPasses.glitch) {
                // Create glitch pass with the effect
                this.effectPasses.glitch = new EffectPass(this.camera, this.effects.glitch);
            }
            this.composer.addPass(this.effectPasses.glitch);
        }
    }

    render(deltaTime) {
        if (this.enabled) {
            // Update glitch effect timing manually
            if (this.glitchEffect && this.glitchEffect.uniforms) {
                // Just update the time uniform directly
                const timeUniform = this.glitchEffect.uniforms.get('time');
                if (timeUniform) {
                    timeUniform.value += deltaTime;
                }

                // Handle auto glitch
                if (this.glitchEffect.autoGlitch) {
                    if (Math.random() < 0.01) { // 1% chance per frame
                        this.glitchEffect.triggerGlitch(0.8 + Math.random() * 0.2, 0.3 + Math.random() * 0.3);
                    }

                    // Decay intensity
                    const intensityUniform = this.glitchEffect.uniforms.get('glitchIntensity');
                    if (intensityUniform && intensityUniform.value > 0) {
                        intensityUniform.value *= 0.98;
                        if (intensityUniform.value < 0.01) {
                            intensityUniform.value = 0;
                        }
                    }
                }
            }

            this.composer.render(deltaTime);
        }
    }

    setSize(width, height) {
        this.composer.setSize(width, height);
    }

    setGlitchEnabled(enabled) {
        if (this.glitchEffect) {
            this.glitchEffect.isActive = enabled;
            this.glitchEffect.setAutoGlitch(enabled);
            this.updatePasses();
        }
    }

    triggerGlitch(intensity = 1.0, duration = 0.5) {
        if (this.glitchEffect) {
            // Stronger manual trigger
            this.glitchEffect.triggerGlitch(intensity, duration * 2); // Longer duration
            this.glitchEffect.isActive = true;
            this.updatePasses();

            // Auto-disable glitch pass after duration
            setTimeout(() => {
                if (!this.glitchEffect.autoGlitch) {
                    this.glitchEffect.isActive = false;
                    this.updatePasses();
                }
            }, duration * 2000); // Match the longer duration
        }
    }
}
