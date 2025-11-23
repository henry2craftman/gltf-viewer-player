import * as THREE from 'three';
import gsap from 'gsap';

export class CameraController {
    constructor(canvas, renderer) {
        this.canvas = canvas;
        this.renderer = renderer;

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.01, // Near plane - very close for indoor navigation
            1000
        );

        // Camera modes
        this.modes = {
            FIRST_PERSON: 'first-person',
            THIRD_PERSON: 'third-person',
            FREE_CAMERA: 'free-camera'
        };
        this.currentMode = this.modes.FIRST_PERSON;

        // Mouse control
        this.yaw = 0;
        this.pitch = 0;
        this.mouseSensitivity = 0.002;
        this.isPointerLocked = false;

        // Third person settings
        this.thirdPersonDistance = 0.1;
        this.thirdPersonHeight = 0.025;

        this.setupPointerLock();
        this.setupMouseControl();
        this.setupResize();
    }

    setupPointerLock() {
        this.canvas.addEventListener('click', () => {
            if (!this.isPointerLocked) {
                this.canvas.requestPointerLock();
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === this.canvas;
            if (this.isPointerLocked) {
                console.log('Pointer lock enabled - mouse control active');
            } else {
                console.log('Pointer lock disabled - click to enable mouse control');
            }
        });

        document.addEventListener('pointerlockerror', () => {
            console.warn('Pointer lock error - click the canvas to enable mouse control');
        });
    }

    setupMouseControl() {
        document.addEventListener('mousemove', (e) => {
            if (!this.isPointerLocked) return;

            this.yaw -= e.movementX * this.mouseSensitivity;
            this.pitch -= e.movementY * this.mouseSensitivity;

            // Limit pitch
            this.pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, this.pitch));
        });
    }

    setupResize() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    setMode(mode) {
        if (Object.values(this.modes).includes(mode)) {
            const previousMode = this.currentMode;
            this.currentMode = mode;

            // Smooth camera transition with GSAP
            if (previousMode !== mode) {
                // Store current camera position
                const startPos = this.camera.position.clone();
                const startRot = {
                    x: this.camera.rotation.x,
                    y: this.camera.rotation.y,
                    z: this.camera.rotation.z
                };

                // Animate camera transition
                gsap.to(this.camera.position, {
                    duration: 0.8,
                    ease: "power2.inOut",
                    onUpdate: () => {
                        // Update camera during animation if needed
                    }
                });

                gsap.to(this.camera.rotation, {
                    duration: 0.8,
                    ease: "power2.inOut",
                    onUpdate: () => {
                        // Ensure smooth transition
                    }
                });
            }
        }
    }

    setThirdPersonDistance(distance) {
        this.thirdPersonDistance = distance;
    }

    setThirdPersonHeight(height) {
        this.thirdPersonHeight = height;
    }

    update(player) {
        switch (this.currentMode) {
            case this.modes.FIRST_PERSON:
                this.updateFirstPerson(player);
                break;
            case this.modes.THIRD_PERSON:
                this.updateThirdPerson(player);
                break;
            case this.modes.FREE_CAMERA:
                this.updateFreeCamera();
                break;
        }
    }

    updateFirstPerson(player) {
        // Position camera at player's eye level
        this.camera.position.copy(player.position);
        this.camera.position.y += player.eyeHeight; // Use player's eye height

        // Apply rotation
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.yaw;
        this.camera.rotation.x = this.pitch;
    }

    updateThirdPerson(player) {
        // Calculate camera position behind and above player
        const offset = new THREE.Vector3(
            Math.sin(this.yaw) * this.thirdPersonDistance,
            this.thirdPersonHeight,
            Math.cos(this.yaw) * this.thirdPersonDistance
        );

        this.camera.position.copy(player.position).add(offset);

        // Look at player
        const lookAtPoint = player.position.clone();
        lookAtPoint.y += player.eyeHeight; // Use player's eye height
        this.camera.lookAt(lookAtPoint);
    }

    updateFreeCamera() {
        // Free camera uses its own position and rotation
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.yaw;
        this.camera.rotation.x = this.pitch;
    }

    getForwardVector() {
        const direction = new THREE.Vector3();
        const rotation = new THREE.Euler(0, this.yaw, 0, 'YXZ');
        direction.set(0, 0, -1);
        direction.applyEuler(rotation);
        return direction;
    }

    getRightVector() {
        const direction = new THREE.Vector3();
        const rotation = new THREE.Euler(0, this.yaw, 0, 'YXZ');
        direction.set(1, 0, 0);
        direction.applyEuler(rotation);
        return direction;
    }
}
