import * as THREE from 'three';

export class Player {
    constructor(scene) {
        this.scene = scene;
        this.position = new THREE.Vector3(0, 0, 5);
        this.velocity = new THREE.Vector3();

        // Player properties
        this.speed = 0.30;
        this.fastSpeed = 0.60;
        this.jumpForce = 0.3;
        this.gravity = -1.0;
        this.isGrounded = false;

        // Player size settings
        this.scale = 0.018;
        this.eyeHeight = 0.035;
        this.groundLevel = 0.30; // Ground collision level

        // Player representation (for third-person view)
        this.createPlayerMesh();

        // Input state
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            up: false,
            down: false,
            sprint: false
        };

        this.setupInput();
    }

    createPlayerMesh() {
        // Create a simple capsule to represent the player
        const geometry = new THREE.CapsuleGeometry(0.5, 1.2, 4, 8);
        const material = new THREE.MeshStandardMaterial({
            color: 0x4CAF50,
            metalness: 0.3,
            roughness: 0.7
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.scene.add(this.mesh);
    }

    setupInput() {
        const keyMap = {
            'KeyW': 'forward',
            'KeyS': 'backward',
            'KeyA': 'left',
            'KeyD': 'right',
            'Space': 'jump',
            'KeyQ': 'down',
            'KeyE': 'up',
            'ShiftLeft': 'sprint',
            'ShiftRight': 'sprint'
        };

        document.addEventListener('keydown', (e) => {
            if (keyMap[e.code] !== undefined) {
                this.keys[keyMap[e.code]] = true;
                if (e.code === 'Space') {
                    e.preventDefault();
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            if (keyMap[e.code] !== undefined) {
                this.keys[keyMap[e.code]] = false;
            }
        });
    }

    update(deltaTime, cameraController) {
        const mode = cameraController.currentMode;

        if (mode === cameraController.modes.FREE_CAMERA) {
            this.updateFreeCamera(deltaTime, cameraController);
        } else {
            this.updatePlayerMovement(deltaTime, cameraController);
        }

        // Update mesh position and scale
        this.mesh.position.copy(this.position);
        this.mesh.scale.setScalar(this.scale);

        // Hide mesh in first-person mode
        this.mesh.visible = mode !== cameraController.modes.FIRST_PERSON;
    }

    setScale(scale) {
        this.scale = scale;
    }

    setEyeHeight(height) {
        this.eyeHeight = height;
    }

    setSpeed(speed) {
        this.speed = speed;
        this.fastSpeed = speed * 2;
    }

    updatePlayerMovement(deltaTime, cameraController) {
        const moveDirection = new THREE.Vector3();
        const forward = cameraController.getForwardVector();
        const right = cameraController.getRightVector();

        // Calculate movement direction
        if (this.keys.forward) moveDirection.add(forward);
        if (this.keys.backward) moveDirection.sub(forward);
        if (this.keys.left) moveDirection.sub(right);
        if (this.keys.right) moveDirection.add(right);

        // Normalize to prevent faster diagonal movement
        if (moveDirection.length() > 0) {
            moveDirection.normalize();
        }

        // Apply speed
        const currentSpeed = this.keys.sprint ? this.fastSpeed : this.speed;
        moveDirection.multiplyScalar(currentSpeed);

        // Apply horizontal movement
        this.velocity.x = moveDirection.x;
        this.velocity.z = moveDirection.z;

        // Apply gravity
        this.velocity.y += this.gravity * deltaTime;

        // Jump
        if (this.keys.jump && this.isGrounded) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
        }

        // Update position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.position.z += this.velocity.z * deltaTime;

        // Simple ground collision
        if (this.position.y <= this.groundLevel) {
            this.position.y = this.groundLevel;
            this.velocity.y = 0;
            this.isGrounded = true;
        }
    }

    setGroundLevel(level) {
        this.groundLevel = level;
        // If player is below ground, move them up
        if (this.position.y < this.groundLevel) {
            this.position.y = this.groundLevel;
        }
    }

    updateFreeCamera(deltaTime, cameraController) {
        const moveDirection = new THREE.Vector3();
        const forward = cameraController.getForwardVector();
        const right = cameraController.getRightVector();

        // Calculate movement direction
        if (this.keys.forward) moveDirection.add(forward);
        if (this.keys.backward) moveDirection.sub(forward);
        if (this.keys.left) moveDirection.sub(right);
        if (this.keys.right) moveDirection.add(right);

        // Vertical movement (no gravity in free camera mode)
        if (this.keys.up) moveDirection.y += 1;
        if (this.keys.down) moveDirection.y -= 1;

        // Normalize
        if (moveDirection.length() > 0) {
            moveDirection.normalize();
        }

        // Apply speed
        const currentSpeed = this.keys.sprint ? this.fastSpeed : this.speed;
        moveDirection.multiplyScalar(currentSpeed * deltaTime);

        // Update camera position directly in free camera mode
        cameraController.camera.position.add(moveDirection);

        // Keep player mesh at camera position for reference
        this.position.copy(cameraController.camera.position);
    }
}
