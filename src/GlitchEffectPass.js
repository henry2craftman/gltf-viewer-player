import { Effect, Pass } from 'postprocessing';
import * as THREE from 'three';

// Custom Glitch Effect that works with postprocessing library
export class GlitchEffect extends Effect {
    constructor() {
        const fragmentShader = `
            uniform float time;
            uniform float distortion;
            uniform float distortion2;
            uniform float speed;
            uniform float glitchIntensity;

            float random(vec2 p) {
                return fract(sin(dot(p.xy, vec2(12.9898, 78.233))) * 43758.5453);
            }

            void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
                vec2 uvDistorted = uv;

                // Only apply glitch effect when intensity > 0
                if (glitchIntensity > 0.0) {
                    // More frequent horizontal glitch lines
                    float glitchLine = step(0.95 - glitchIntensity * 0.1, random(vec2(0.0, uv.y + time * speed)));

                    // Stronger RGB shift effect
                    float rgbShift = glitchIntensity * 0.05 + glitchLine * 0.08;

                    // More aggressive distortion
                    uvDistorted.x += distortion * glitchLine * 2.0;
                    uvDistorted.y += distortion2 * sin(time * 15.0) * 0.03;

                    // Wave distortion
                    uvDistorted.x += sin(uv.y * 10.0 + time * 5.0) * glitchIntensity * 0.01;

                    // Sample with RGB shift
                    vec4 cr = texture2D(inputBuffer, uvDistorted + vec2(rgbShift, 0.0));
                    vec4 cg = texture2D(inputBuffer, uvDistorted);
                    vec4 cb = texture2D(inputBuffer, uvDistorted - vec2(rgbShift, 0.0));

                    // Combine RGB channels with color distortion
                    outputColor = vec4(cr.r * (1.0 + glitchIntensity * 0.2),
                                     cg.g,
                                     cb.b * (1.0 + glitchIntensity * 0.1),
                                     cg.a);

                    // More visible digital noise
                    float noise = random(uvDistorted + time) * glitchIntensity;
                    outputColor.rgb += vec3(noise) * 0.4;

                    // More frequent glitch blocks
                    float blockGlitch = step(0.98 - glitchIntensity * 0.05,
                                           random(vec2(floor(uvDistorted.x * 20.0), floor(uvDistorted.y * 20.0) + time)));
                    if (blockGlitch > 0.5) {
                        vec3 glitchColor = vec3(
                            random(uvDistorted + time),
                            random(uvDistorted + time * 2.0),
                            random(uvDistorted + time * 3.0)
                        );
                        outputColor.rgb = mix(outputColor.rgb, glitchColor, 0.8);
                    }

                    // Scanline effect
                    float scanline = sin(uv.y * 800.0 + time * 10.0) * 0.04 * glitchIntensity;
                    outputColor.rgb -= scanline;
                } else {
                    // No glitch effect
                    outputColor = inputColor;
                }
            }
        `;

        super('GlitchEffect', fragmentShader, {
            uniforms: new Map([
                ['time', new THREE.Uniform(0)],
                ['distortion', new THREE.Uniform(0.0)],
                ['distortion2', new THREE.Uniform(0.0)],
                ['speed', new THREE.Uniform(0.2)],
                ['glitchIntensity', new THREE.Uniform(0.0)]
            ])
        });

        this.isActive = false;
        this.autoGlitch = false;
        this.glitchTimer = 0;
    }

    // Don't override update method for postprocessing Effect class
    // The update is handled in PostProcessing.js render method instead

    triggerGlitch(intensity = 1.0, duration = 0.2) {
        this.uniforms.get('glitchIntensity').value = intensity;
        this.uniforms.get('distortion').value = (Math.random() - 0.5) * 0.3; // Increased from 0.1
        this.uniforms.get('distortion2').value = (Math.random() - 0.5) * 0.3; // Increased from 0.1

        // Reset after duration
        if (duration > 0) {
            setTimeout(() => {
                this.uniforms.get('glitchIntensity').value = 0;
                this.uniforms.get('distortion').value = 0;
                this.uniforms.get('distortion2').value = 0;
            }, duration * 1000);
        }
    }

    setAutoGlitch(enabled) {
        this.autoGlitch = enabled;
        if (!enabled) {
            this.uniforms.get('glitchIntensity').value = 0;
            this.uniforms.get('distortion').value = 0;
            this.uniforms.get('distortion2').value = 0;
        }
    }

    setIntensity(intensity) {
        this.uniforms.get('glitchIntensity').value = intensity;
    }
}