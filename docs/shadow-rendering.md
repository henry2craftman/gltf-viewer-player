# GLTF Viewer 그림자 렌더링 가이드

## 개요

Three.js 기반 GLTF Viewer의 그림자 시스템 분석 문서입니다.

---

## Shadow Mapping 원리

Three.js는 **Shadow Mapping** 기법을 사용합니다:

1. **1st Pass**: 광원 시점에서 씬을 렌더링하여 깊이 정보를 Shadow Map 텍스처에 저장
2. **2nd Pass**: 카메라 시점에서 각 픽셀의 깊이를 Shadow Map과 비교하여 그림자 여부 판단

---

## 함수 실행 순서

### Phase 1: 초기화

| 순서 | 함수 | 위치 | 역할 |
|------|------|------|------|
| 1 | `setupRenderer()` | main.js:153 | 렌더러 생성 및 그림자 활성화 |
| 2 | `setupLights()` | main.js:762 | DirectionalLight 및 Shadow Camera 설정 |
| 3 | `setupGround()` | main.js:895 | 그림자 수신용 바닥면 생성 |

### Phase 2: 모델 로드

| 순서 | 함수 | 위치 | 역할 |
|------|------|------|------|
| 4 | `loadModel()` traverse | main.js:1007 | 각 mesh에 shadow 속성 설정 |
| 5 | `updateShadowCameraForScene()` | main.js:860 | 모델 크기 기반 Shadow Camera 조정 |

### Phase 3: 런타임

| 순서 | 함수 | 역할 |
|------|------|------|
| 6 | `animate()` → `renderer.render()` | 매 프레임 Shadow Map 갱신 |

---

## 주요 함수 상세

### setupRenderer()

```javascript
// 그림자 맵 활성화
this.renderer.shadowMap.enabled = true;
this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
this.renderer.shadowMap.autoUpdate = true;
```

**Shadow Map Types:**
| 타입 | 설명 |
|------|------|
| `BasicShadowMap` | 가장 빠름, 품질 낮음 |
| `PCFShadowMap` | Percentage Closer Filtering |
| `PCFSoftShadowMap` | 부드러운 가장자리 (권장) |
| `VSMShadowMap` | Variance Shadow Map |

### setupLights()

```javascript
// DirectionalLight 생성 (평행광/태양광)
this.directionalLight = new THREE.DirectionalLight(0xffffff, 3.5);
this.directionalLight.castShadow = true;

// Shadow Camera (Orthographic Projection)
this.directionalLight.shadow.camera.left = -40;
this.directionalLight.shadow.camera.right = 40;
this.directionalLight.shadow.camera.top = 40;
this.directionalLight.shadow.camera.bottom = -40;
this.directionalLight.shadow.camera.near = 0.1;
this.directionalLight.shadow.camera.far = 120;

// Shadow Map 해상도
this.directionalLight.shadow.mapSize.width = 4096;
this.directionalLight.shadow.mapSize.height = 4096;

// 품질 파라미터
this.directionalLight.shadow.bias = -0.001;
this.directionalLight.shadow.normalBias = 0.02;
this.directionalLight.shadow.radius = 1;
this.directionalLight.shadow.blurSamples = 25;
```

### 모델 로드 시 Shadow 설정

```javascript
this.loadedModel.traverse((child) => {
    if (child.isMesh) {
        child.castShadow = true;     // 그림자 생성
        child.receiveShadow = true;  // 그림자 수신
    }
});
```

### updateShadowCameraForScene()

```javascript
// 모델 바운딩 박스 기반 동적 조정
const box = new THREE.Box3().setFromObject(this.loadedModel);
const maxDim = Math.max(size.x, size.y, size.z);
const shadowCameraSize = maxDim * 1.5;

this.directionalLight.shadow.camera.left = -shadowCameraSize;
this.directionalLight.shadow.camera.right = shadowCameraSize;
// ...
this.directionalLight.shadow.camera.updateProjectionMatrix();
this.renderer.shadowMap.needsUpdate = true;
```

---

## 핵심 파라미터

| 파라미터 | 설명 | 기본값 |
|----------|------|--------|
| `mapSize` | Shadow Map 해상도 | 4096x4096 |
| `bias` | Shadow Acne 방지 오프셋 | -0.001 |
| `normalBias` | 표면 법선 기반 오프셋 | 0.02 |
| `radius` | PCF 블러 반경 | 1 |
| `blurSamples` | 블러 샘플 수 | 25 |

---

## UI 제어 옵션

| 컨트롤 | 기능 |
|--------|------|
| Enable Shadows | 그림자 On/Off |
| Shadow Quality | 해상도 (1024/2048/4096/8192) |
| Shadow Softness | 가장자리 블러 정도 |
| Shadow Bias | Bias 값 미세 조정 |
| Shadow Helper | 디버그용 카메라 헬퍼 표시 |

---

## Three.js 라이브러리 사용법

### 기본 설정

```javascript
import * as THREE from 'three';

// 1. 렌더러 설정
const renderer = new THREE.WebGLRenderer();
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// 2. 광원 설정
const light = new THREE.DirectionalLight(0xffffff, 1);
light.castShadow = true;
light.shadow.mapSize.set(2048, 2048);
scene.add(light);

// 3. 객체 설정
mesh.castShadow = true;    // 그림자 생성
mesh.receiveShadow = true; // 그림자 수신

// 4. 바닥면
ground.receiveShadow = true;
```

### 광원 타입별 그림자

| 광원 | Shadow Camera | 특징 |
|------|---------------|------|
| DirectionalLight | Orthographic | 평행 그림자, 태양광 |
| SpotLight | Perspective | 원뿔형 그림자 |
| PointLight | CubeCamera | 전방향 그림자 (비용 높음) |

### 성능 최적화 팁

```javascript
// 필요시에만 Shadow Map 갱신
renderer.shadowMap.autoUpdate = false;
renderer.shadowMap.needsUpdate = true; // 수동 갱신

// 해상도 조절 (성능 vs 품질)
light.shadow.mapSize.set(1024, 1024); // 낮은 해상도
light.shadow.mapSize.set(4096, 4096); // 높은 해상도

// Shadow Camera 범위 최소화
light.shadow.camera.left = -10;  // 필요한 범위만
light.shadow.camera.right = 10;
```

---

## 디버깅

### Shadow Camera Helper

```javascript
const helper = new THREE.CameraHelper(light.shadow.camera);
scene.add(helper);
```

### debugShadowSettings() 함수

- 모든 mesh의 shadow 설정 상태 출력
- Shadow caster/receiver 개수 집계
- 투명 재질 감지 (그림자에 영향)

---

## 참고 자료

- [Three.js Shadow Documentation](https://threejs.org/docs/#api/en/lights/shadows/DirectionalLightShadow)
- [Three.js Examples - Shadows](https://threejs.org/examples/?q=shadow)
