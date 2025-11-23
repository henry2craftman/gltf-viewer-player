import * as THREE from 'three';
import gsap from 'gsap';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = null;
        this.particleGeometry = null;
        this.particleMaterial = null;

        // Snow particle settings
        this.particleCount = 1000; // More particles for denser snow
        this.particleSpeed = 0.5; // Moderate falling speed for realistic snow
        this.particleSize = 0.5; // Much larger size for visibility

        // Animation state
        this.time = 0;
        this.mouseX = 0;
        this.mouseY = 0;

        this.init();
        this.setupMouseTracking();
    }

    init() {
        // Create particle geometry
        this.particleGeometry = new THREE.BufferGeometry();

        // Create arrays for particle attributes
        const positions = new Float32Array(this.particleCount * 3);
        const colors = new Float32Array(this.particleCount * 3);
        const sizes = new Float32Array(this.particleCount);
        const velocities = new Float32Array(this.particleCount * 3);

        // Initialize particles with random positions
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;

            // Random position spread across a wide area for snow (around player start position)
            positions[i3] = (Math.random() - 0.5) * 10; // X: spread across 10 units around player
            positions[i3 + 1] = Math.random() * 5 + 1; // Y: start from various heights (1-6 units up)
            positions[i3 + 2] = (Math.random() - 0.5) * 10 + 5; // Z: spread around player start at z=5

            // White color for snow
            colors[i3] = 1.0; // R
            colors[i3 + 1] = 1.0; // G
            colors[i3 + 2] = 1.0; // B

            // Random size for snowflakes
            sizes[i] = Math.random() * this.particleSize + this.particleSize * 0.5;

            // Gentle horizontal drift velocity for realistic snow
            velocities[i3] = (Math.random() - 0.5) * 0.02; // Slight X drift
            velocities[i3 + 1] = -(Math.random() * 0.5 + 0.5); // Downward Y velocity
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.02; // Slight Z drift
        }

        // Set attributes
        this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        this.particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        this.particleGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

        // Create shader material for particles
        this.particleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                mousePosition: { value: new THREE.Vector2() },
                pixelRatio: { value: window.devicePixelRatio },
                uSize: { value: this.particleSize },
                uSpeed: { value: this.particleSpeed }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 velocity;
                attribute vec3 color;

                uniform float time;
                uniform vec2 mousePosition;
                uniform float uSize;
                uniform float uSpeed;

                varying vec3 vColor;
                varying float vAlpha;

                void main() {
                    vColor = color;

                    // Natural snow falling animation
                    vec3 pos = position;

                    // Simple downward movement with cycling
                    float fallDistance = time * uSpeed * 0.3;
                    pos.y = position.y - fallDistance;

                    // Cycle particles when they fall too low
                    float cycleHeight = 8.0;
                    float cycles = floor((position.y + fallDistance) / cycleHeight);
                    pos.y = pos.y + (cycles * cycleHeight);

                    // Gentle horizontal drift (wind effect)
                    pos.x += sin(time * 0.5 + position.x) * 0.1;
                    pos.z += cos(time * 0.3 + position.z) * 0.05;

                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_Position = projectionMatrix * mvPosition;

                    // Simple large point size for visibility
                    gl_PointSize = 30.0 * uSize;

                    // Consistent opacity for all snowflakes
                    vAlpha = 0.8;
                }
            `,
            fragmentShader: `
                uniform float time;
                varying vec3 vColor;
                varying float vAlpha;

                void main() {
                    // Circular snowflake shape with soft edges
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);

                    // Soft circular shape for snowflakes
                    if (dist > 0.5) {
                        discard;
                    }

                    // Very soft edges for natural snowflake appearance
                    float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
                    alpha *= vAlpha;

                    // Pure white snowflakes with slight transparency
                    vec3 snowColor = vec3(1.0, 1.0, 1.0);

                    // Subtle shimmer effect (like real snow crystals)
                    float shimmer = 0.9 + 0.1 * sin(time * 3.0 + gl_FragCoord.x * 0.1);
                    snowColor *= shimmer;

                    gl_FragColor = vec4(snowColor, alpha * 0.7);
                }
            `,
            transparent: true,
            blending: THREE.NormalBlending,
            depthWrite: false,
            depthTest: false,
            vertexColors: true
        });

        // Create particle system
        this.particles = new THREE.Points(this.particleGeometry, this.particleMaterial);
        this.particles.frustumCulled = false; // Ensure particles are always rendered
        this.particles.renderOrder = 999; // Render particles on top
        this.scene.add(this.particles);

        console.log('🌨️ ParticleSystem initialized with', this.particleCount, 'particles');
        console.log('Initial particle position:', this.particles.position);
        console.log('Particle visibility:', this.particles.visible);
        console.log('Particle size:', this.particleSize);
        console.log('First few particle positions (X,Y,Z):', positions.slice(0, 9));
        console.log('Particle material blending:', this.particleMaterial.blending);
        console.log('Particle in scene:', this.scene.children.includes(this.particles));
    }

    setupMouseTracking() {
        // Disabled mouse tracking for natural snow effect
        // Snow should fall naturally without mouse interaction
        this.mouseX = 0;
        this.mouseY = 0;
    }

    morphToShape(shape = 'sphere') {
        const positions = this.particleGeometry.attributes.position.array;
        const targetPositions = new Float32Array(this.particleCount * 3);

        switch (shape) {
            case 'sphere':
                for (let i = 0; i < this.particleCount; i++) {
                    const i3 = i * 3;
                    const radius = 2;
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.acos((Math.random() * 2) - 1);

                    targetPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
                    targetPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta) + 0.5;
                    targetPositions[i3 + 2] = radius * Math.cos(phi) + 3;
                }
                break;

            case 'cube':
                for (let i = 0; i < this.particleCount; i++) {
                    const i3 = i * 3;
                    const size = 1.5;

                    targetPositions[i3] = (Math.random() - 0.5) * size * 2;
                    targetPositions[i3 + 1] = (Math.random() - 0.5) * size * 2 + 0.5;
                    targetPositions[i3 + 2] = (Math.random() - 0.5) * size * 2 + 3;
                }
                break;

            case 'torus':
                for (let i = 0; i < this.particleCount; i++) {
                    const i3 = i * 3;
                    const theta = Math.random() * Math.PI * 2;
                    const phi = Math.random() * Math.PI * 2;
                    const R = 2; // Major radius
                    const r = 0.5;  // Minor radius

                    targetPositions[i3] = (R + r * Math.cos(phi)) * Math.cos(theta);
                    targetPositions[i3 + 1] = (R + r * Math.cos(phi)) * Math.sin(theta) + 0.5;
                    targetPositions[i3 + 2] = r * Math.sin(phi) + 3;
                }
                break;

            case 'random':
                for (let i = 0; i < this.particleCount; i++) {
                    const i3 = i * 3;

                    targetPositions[i3] = (Math.random() - 0.5) * 4;
                    targetPositions[i3 + 1] = Math.random() * 2;
                    targetPositions[i3 + 2] = (Math.random() - 0.5) * 4 + 3;
                }
                break;

            case 'helix':
                for (let i = 0; i < this.particleCount; i++) {
                    const i3 = i * 3;
                    const t = (i / this.particleCount) * 10 * Math.PI;
                    const radius = 10;

                    targetPositions[i3] = radius * Math.cos(t);
                    targetPositions[i3 + 1] = t * 0.5 - 15;
                    targetPositions[i3 + 2] = radius * Math.sin(t);
                }
                break;
        }

        // Animate particles to new positions
        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;

            gsap.to(positions, {
                duration: 2,
                ease: "power2.inOut",
                [i3]: targetPositions[i3],
                [i3 + 1]: targetPositions[i3 + 1],
                [i3 + 2]: targetPositions[i3 + 2],
                onUpdate: () => {
                    this.particleGeometry.attributes.position.needsUpdate = true;
                }
            });
        }

        // Update colors based on speed
        this.updateColorsBySpeed();
    }

    updateColorsBySpeed() {
        const colors = this.particleGeometry.attributes.color.array;
        const velocities = this.particleGeometry.attributes.velocity.array;

        for (let i = 0; i < this.particleCount; i++) {
            const i3 = i * 3;
            const speed = Math.sqrt(
                velocities[i3] * velocities[i3] +
                velocities[i3 + 1] * velocities[i3 + 1] +
                velocities[i3 + 2] * velocities[i3 + 2]
            );

            // Faster particles are brighter and more cyan
            colors[i3] = 0.0 + speed * 10;
            colors[i3 + 1] = 0.5 + speed * 20;
            colors[i3 + 2] = 0.8 + speed * 5;
        }

        this.particleGeometry.attributes.color.needsUpdate = true;
    }

    update(deltaTime) {
        if (!this.particles) return;

        this.time += deltaTime;

        // Update uniforms
        this.particleMaterial.uniforms.time.value = this.time;
        this.particleMaterial.uniforms.mousePosition.value.set(this.mouseX, this.mouseY);

        // Log every 5 seconds to verify update is being called
        if (Math.floor(this.time) % 5 === 0 && Math.floor(this.time - deltaTime) % 5 !== 0) {
            console.log('🌨️ Particles updating - Time:', this.time.toFixed(2), 'Visible:', this.particles.visible);
        }

        // No rotation for natural snow effect
        // Snow should fall straight down with only wind drift
    }

    setEnabled(enabled) {
        if (this.particles) {
            this.particles.visible = enabled;
        }
    }

    setSize(size) {
        this.particleSize = size;
        if (this.particleMaterial) {
            this.particleMaterial.uniforms.uSize.value = size;
        }
    }

    setSpeed(speed) {
        this.particleSpeed = speed;
        if (this.particleMaterial) {
            this.particleMaterial.uniforms.uSpeed.value = speed;
        }
    }

    dispose() {
        if (this.particleGeometry) {
            this.particleGeometry.dispose();
        }
        if (this.particleMaterial) {
            this.particleMaterial.dispose();
        }
        if (this.particles) {
            this.scene.remove(this.particles);
        }
    }
}