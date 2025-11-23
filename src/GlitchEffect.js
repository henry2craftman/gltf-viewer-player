import * as THREE from 'three';

export class GlitchEffect {
    constructor() {
        this.uniforms = {
            tDiffuse: { value: null },
            time: { value: 0 },
            distortion: { value: 0.0 },
            distortion2: { value: 0.0 },
            speed: { value: 0.2 },
            glitchIntensity: { value: 0.0 }
        };

        this.vertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        this.fragmentShader = `
            uniform sampler2D tDiffuse;
            uniform float time;
            uniform float distortion;
            uniform float distortion2;
            uniform float speed;
            uniform float glitchIntensity;

            varying vec2 vUv;

            float random(vec2 p) {
                return fract(sin(dot(p.xy, vec2(12.9898, 78.233))) * 43758.5453);
            }

            void main() {
                vec2 uv = vUv;

                // Only apply glitch effect when intensity > 0
                if (glitchIntensity > 0.0) {
                    // Horizontal glitch lines
                    float glitchLine = step(0.99, random(vec2(0.0, uv.y + time * speed)));

                    // RGB shift effect
                    float rgbShift = glitchIntensity * glitchLine * 0.03;

                    // Distortion
                    uv.x += distortion * glitchLine;
                    uv.y += distortion2 * sin(time * 10.0) * 0.01;

                    // Sample with RGB shift
                    vec4 cr = texture2D(tDiffuse, uv + vec2(rgbShift, 0.0));
                    vec4 cg = texture2D(tDiffuse, uv);
                    vec4 cb = texture2D(tDiffuse, uv - vec2(rgbShift, 0.0));

                    // Combine RGB channels
                    vec4 color = vec4(cr.r, cg.g, cb.b, cg.a);

                    // Add digital noise
                    float noise = random(uv + time) * glitchIntensity * glitchLine;
                    color.rgb += vec3(noise) * 0.2;

                    // Occasional full glitch blocks
                    float blockGlitch = step(0.995, random(vec2(floor(uv.x * 10.0), floor(uv.y * 10.0) + time)));
                    if (blockGlitch > 0.5) {
                        color.rgb = vec3(random(uv + time));
                    }

                    gl_FragColor = color;
                } else {
                    // No glitch effect
                    gl_FragColor = texture2D(tDiffuse, uv);
                }
            }
        `;

        this.material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            transparent: false,
            depthTest: false,
            depthWrite: false
        });

        this.isActive = false;
        this.autoGlitch = false;
        this.glitchTimer = 0;
    }

    update(deltaTime) {
        this.uniforms.time.value += deltaTime;

        if (this.autoGlitch) {
            this.glitchTimer += deltaTime;

            // Random glitch bursts
            if (Math.random() < 0.002) { // 0.2% chance per frame
                this.triggerGlitch();
            }

            // Update glitch intensity (decay over time)
            if (this.uniforms.glitchIntensity.value > 0) {
                this.uniforms.glitchIntensity.value *= 0.95;
                if (this.uniforms.glitchIntensity.value < 0.01) {
                    this.uniforms.glitchIntensity.value = 0;
                }
            }
        }
    }

    triggerGlitch(intensity = 1.0, duration = 0.2) {
        this.uniforms.glitchIntensity.value = intensity;
        this.uniforms.distortion.value = (Math.random() - 0.5) * 0.1;
        this.uniforms.distortion2.value = (Math.random() - 0.5) * 0.1;

        // Reset after duration
        if (duration > 0) {
            setTimeout(() => {
                this.uniforms.glitchIntensity.value = 0;
                this.uniforms.distortion.value = 0;
                this.uniforms.distortion2.value = 0;
            }, duration * 1000);
        }
    }

    setAutoGlitch(enabled) {
        this.autoGlitch = enabled;
        if (!enabled) {
            this.uniforms.glitchIntensity.value = 0;
            this.uniforms.distortion.value = 0;
            this.uniforms.distortion2.value = 0;
        }
    }

    setIntensity(intensity) {
        this.uniforms.glitchIntensity.value = intensity;
    }
}