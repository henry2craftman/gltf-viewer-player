import * as THREE from 'three';

export class TimeOfDaySystem {
    constructor(scene, directionalLight, hemisphereLight) {
        this.scene = scene;
        this.directionalLight = directionalLight;
        this.hemisphereLight = hemisphereLight;

        // Time settings
        this.timeOfDay = 12; // 0-24 hours
        this.timeSpeed = 10; // Multiplier for time progression
        this.enabled = false;

        // Sun settings
        this.sunIntensity = 0.8;
        this.sunDistance = 50;

        // Create visible sun mesh
        this.createSunMesh();

        // Color presets for different times (adjusted for black background)
        this.timeColorPresets = {
            night: {
                sky: new THREE.Color(0x000000), // Black background
                sun: new THREE.Color(0x4060ff),
                ambient: new THREE.Color(0x202050),
                fog: new THREE.Color(0x000000),
                sunIntensity: 0.1
            },
            dawn: {
                sky: new THREE.Color(0x000000), // Keep black background
                sun: new THREE.Color(0xff9a56),
                ambient: new THREE.Color(0xff8c69),
                fog: new THREE.Color(0x000000),
                sunIntensity: 0.6
            },
            morning: {
                sky: new THREE.Color(0x000000), // Keep black background
                sun: new THREE.Color(0xfffacd),
                ambient: new THREE.Color(0xfff8dc),
                fog: new THREE.Color(0x000000),
                sunIntensity: 1.2
            },
            noon: {
                sky: new THREE.Color(0x000000), // Keep black background
                sun: new THREE.Color(0xfffaf0),
                ambient: new THREE.Color(0xffffff),
                fog: new THREE.Color(0x000000),
                sunIntensity: 2.0
            },
            afternoon: {
                sky: new THREE.Color(0x000000), // Keep black background
                sun: new THREE.Color(0xffd700),
                ambient: new THREE.Color(0xffefd5),
                fog: new THREE.Color(0x000000),
                sunIntensity: 1.5
            },
            dusk: {
                sky: new THREE.Color(0x000000), // Keep black background
                sun: new THREE.Color(0xff4500),
                ambient: new THREE.Color(0xff7f50),
                fog: new THREE.Color(0x000000),
                sunIntensity: 0.5
            },
            evening: {
                sky: new THREE.Color(0x000000), // Keep black background
                sun: new THREE.Color(0x4169e1),
                ambient: new THREE.Color(0x483d8b),
                fog: new THREE.Color(0x000000),
                sunIntensity: 0.2
            }
        };
    }

    update(deltaTime) {
        if (this.enabled) {
            // Progress time
            this.timeOfDay += (deltaTime * this.timeSpeed) / 3600; // Convert to hours
            if (this.timeOfDay >= 24) {
                this.timeOfDay -= 24;
            }
        }

        this.updateLighting();
    }

    updateLighting() {
        // Get colors for current time
        const colors = this.getColorsForTime(this.timeOfDay);

        // Update scene colors
        this.scene.background = colors.sky;
        if (this.scene.fog) {
            this.scene.fog.color = colors.fog;
        }

        // Update sun color and intensity
        this.directionalLight.color = colors.sun;
        this.directionalLight.intensity = colors.sunIntensity * this.sunIntensity;

        // Update ambient light
        this.hemisphereLight.color = colors.sky;
        this.hemisphereLight.groundColor = colors.ambient;

        // Update sun position based on time
        this.updateSunPosition(this.timeOfDay);
    }

    createSunMesh() {
        // Create a glowing sun sphere
        const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
        const sunMaterial = new THREE.MeshBasicMaterial({
            color: 0xfffaf0
        });
        this.sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
        this.scene.add(this.sunMesh);
    }

    updateSunPosition(time) {
        // Calculate sun angle (0 = midnight, 12 = noon)
        // Sun rises at 6:00, sets at 18:00
        const sunAngle = ((time - 6) / 12) * Math.PI; // -PI to PI

        // Position sun in arc across sky
        const x = Math.cos(sunAngle) * this.sunDistance;
        const y = Math.sin(sunAngle) * this.sunDistance;
        const z = this.sunDistance * 0.5;

        this.directionalLight.position.set(x, y, z);

        // Update sun mesh position
        if (this.sunMesh) {
            this.sunMesh.position.set(x, y, z);

            // Update sun color based on time
            const colors = this.getColorsForTime(time);
            this.sunMesh.material.color = colors.sun;

            // Hide sun when below horizon
            this.sunMesh.visible = y > 0;
        }
    }

    getColorsForTime(time) {
        // Define time ranges
        if (time >= 0 && time < 5) {
            // Night (0:00 - 5:00)
            return this.timeColorPresets.night;
        } else if (time >= 5 && time < 7) {
            // Dawn (5:00 - 7:00)
            const t = (time - 5) / 2;
            return this.lerpColors(this.timeColorPresets.night, this.timeColorPresets.dawn, t);
        } else if (time >= 7 && time < 9) {
            // Morning (7:00 - 9:00)
            const t = (time - 7) / 2;
            return this.lerpColors(this.timeColorPresets.dawn, this.timeColorPresets.morning, t);
        } else if (time >= 9 && time < 11) {
            // Late morning (9:00 - 11:00)
            const t = (time - 9) / 2;
            return this.lerpColors(this.timeColorPresets.morning, this.timeColorPresets.noon, t);
        } else if (time >= 11 && time < 15) {
            // Noon (11:00 - 15:00)
            return this.timeColorPresets.noon;
        } else if (time >= 15 && time < 17) {
            // Afternoon (15:00 - 17:00)
            const t = (time - 15) / 2;
            return this.lerpColors(this.timeColorPresets.noon, this.timeColorPresets.afternoon, t);
        } else if (time >= 17 && time < 19) {
            // Dusk (17:00 - 19:00)
            const t = (time - 17) / 2;
            return this.lerpColors(this.timeColorPresets.afternoon, this.timeColorPresets.dusk, t);
        } else if (time >= 19 && time < 21) {
            // Evening (19:00 - 21:00)
            const t = (time - 19) / 2;
            return this.lerpColors(this.timeColorPresets.dusk, this.timeColorPresets.evening, t);
        } else {
            // Night (21:00 - 24:00)
            const t = (time - 21) / 3;
            return this.lerpColors(this.timeColorPresets.evening, this.timeColorPresets.night, t);
        }
    }

    lerpColors(preset1, preset2, t) {
        return {
            sky: new THREE.Color().lerpColors(preset1.sky, preset2.sky, t),
            sun: new THREE.Color().lerpColors(preset1.sun, preset2.sun, t),
            ambient: new THREE.Color().lerpColors(preset1.ambient, preset2.ambient, t),
            fog: new THREE.Color().lerpColors(preset1.fog, preset2.fog, t),
            sunIntensity: THREE.MathUtils.lerp(preset1.sunIntensity, preset2.sunIntensity, t)
        };
    }

    setTime(time) {
        this.timeOfDay = time;
        this.updateLighting();
    }

    setTimeSpeed(speed) {
        this.timeSpeed = speed;
    }

    setSunIntensity(intensity) {
        this.sunIntensity = intensity;
        this.updateLighting();
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    getTimeString() {
        const hours = Math.floor(this.timeOfDay);
        const minutes = Math.floor((this.timeOfDay % 1) * 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
}
