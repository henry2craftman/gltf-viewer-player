# GLTF Viewer & Player

![GLTF Viewer Player](gltf-viewer-player.png)

[English](#english) | [한국어](#korean)

---

<a name="english"></a>
## 🌍 English

A professional 3D model viewer and player built with Three.js, featuring advanced rendering capabilities, post-processing effects, and interactive camera controls.

### ✨ Features

#### 🎨 Advanced Rendering
- **PBR Materials**: Physically-based rendering with metalness and roughness
- **HDR Environment Maps**: Support for .hdr and .exr files
- **Tone Mapping**: Multiple options (ACES Filmic, Cineon, Reinhard, Linear)
- **Real-time Shadows**: PCF soft shadows with configurable quality
- **Environment Lighting**: Image-based lighting (IBL) for realistic reflections

#### 🎮 Camera Modes
- **First Person**: Immersive FPS-style navigation
- **Third Person**: Follow camera with adjustable distance and height
- **Free Camera**: Unrestricted flight mode for scene exploration
- **Smooth Controls**: Mouse look and WASD/QE movement

#### 🌅 Dynamic Lighting
- **Time of Day System**: Automatic day/night cycle
- **Multiple Environments**: Studio, Natural, Venice Sunset, Custom HDR
- **Adjustable Lighting**: Control ambient, directional, and environment intensity
- **Real-time Sky**: Procedural sky with sun position

#### 🎬 Post-Processing Effects
- **Bloom**: Glowing highlights and HDR effects
- **SSAO**: Screen-space ambient occlusion for depth
- **Glitch Effect**: Digital distortion effects
- **Film Grain**: Cinematic texture overlay

#### ✨ Particle System
- **Multiple Shapes**: Sphere, cube, torus, spiral formations
- **Morphing Animations**: Smooth transitions between shapes
- **Customizable**: Adjustable size, speed, and color
- **Performance Optimized**: GPU-accelerated particles

#### ⚙️ Advanced Settings
- **Player Customization**: Scale, speed, eye height, ground level
- **Graphics Quality**: Shadow resolution, pixel ratio, fog
- **Environment Controls**: Background visibility, blur, intensity
- **Settings Management**: Save/load/export/import configurations

### 🚀 Quick Start

#### Installation

```bash
# Clone the repository
git clone https://github.com/henry2craftman/gltf-viewer-player.git

# Navigate to project directory
cd gltf-viewer-player

# Install dependencies
npm install

# Start development server
npm run dev
```

#### Usage

1. **Load a GLTF Model**: Click "Choose File" and select a .gltf or .glb file
2. **Select Camera Mode**: Choose between First Person, Third Person, or Free Camera
3. **Adjust Settings**: Open the settings panel to customize rendering and effects
4. **Navigate**: Use WASD for movement, mouse for looking, Space to jump

### 🎮 Controls

#### Movement
- **W/A/S/D**: Move forward/left/backward/right
- **Space**: Jump (First/Third Person mode)
- **Q/E**: Move down/up (Free Camera mode)
- **Shift**: Sprint (double speed)

#### Camera
- **Mouse**: Look around
- **1**: First Person mode
- **2**: Third Person mode
- **3**: Free Camera mode

#### Settings
- **Settings Button**: Toggle settings panel
- **File Input**: Load GLTF models
- **Sliders**: Adjust various parameters

### 📦 Project Structure

```
gltf-viewer-player/
├── src/
│   ├── main.js              # Main application entry
│   ├── Camera.js            # Camera controller
│   ├── Player.js            # Player movement
│   ├── PostProcessing.js    # Post-processing effects
│   ├── TimeOfDay.js         # Day/night cycle
│   ├── ParticleSystem.js    # Particle effects
│   ├── GlitchEffect.js      # Glitch shader
│   └── GlitchEffectPass.js  # Glitch pass
├── index.html               # Main HTML file
├── package.json             # Dependencies
└── vite.config.js           # Vite configuration
```

### 🛠️ Technical Details

#### Technologies
- **Three.js**: 3D rendering engine
- **Vite**: Fast build tool and dev server
- **GSAP**: Animation library
- **WebGL**: Hardware-accelerated graphics

#### Rendering Pipeline
1. **Model Loading**: GLTFLoader with automatic scaling and centering
2. **Environment Setup**: PMREM generator for IBL
3. **Material Enhancement**: PBR materials with environment maps
4. **Shadow Mapping**: Directional light with cascaded shadows
5. **Post-Processing**: Bloom, SSAO, and custom effects
6. **Tone Mapping**: HDR to LDR conversion

#### Performance Features
- Logarithmic depth buffer for precision
- Efficient particle system with instancing
- Optimized shadow map resolution
- Configurable quality settings
- Smart asset caching

### 🎨 Environments

#### Built-in Environments
- **Studio**: Neutral indoor lighting (default)
- **Natural**: Outdoor daytime with blue sky
- **Venice**: Dramatic sunset atmosphere
- **None**: Black background, no IBL

#### Custom HDR
Upload your own .hdr or .exr files for custom environments:
1. Click "Load HDR File"
2. Select your HDR image
3. Adjust exposure and background blur

### 📊 Settings Categories

#### Player Settings
- Scale, Eye Height, Speed, Ground Level
- Third Person Distance & Height

#### Post-Processing
- Enable/Disable effects
- Bloom intensity
- SSAO quality
- Glitch effects

#### Time of Day
- Auto cycle enable/disable
- Time slider (0-24 hours)
- Time speed multiplier
- Sun intensity

#### Graphics
- Shadow quality
- Fog enable/disable
- Pixel ratio (performance vs quality)

#### Environment & Lighting
- Environment selection
- Tone mapping algorithm
- Exposure control
- Ambient/Directional light colors and intensity
- Background visibility and blur

#### Particle System
- Enable/Disable particles
- Shape selection (sphere, cube, torus, spiral)
- Size and speed controls

### 🔧 Configuration

Settings are automatically saved to localStorage and can be:
- **Saved**: Store current configuration
- **Loaded**: Restore saved configuration
- **Reset**: Return to defaults
- **Exported**: Download as JSON file
- **Imported**: Upload JSON configuration

### 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- WebGL 2.0 required

### 📝 License

MIT License - feel free to use in your projects!

### 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### 📧 Contact

Created by [@henry2craftman](https://github.com/henry2craftman)

---

<a name="korean"></a>
## 🇰🇷 한국어

Three.js로 제작된 전문가급 3D 모델 뷰어 및 플레이어. 고급 렌더링 기능, 후처리 효과, 인터랙티브 카메라 컨트롤을 제공합니다.

### ✨ 기능

#### 🎨 고급 렌더링
- **PBR 재질**: 금속성과 거칠기를 사용한 물리 기반 렌더링
- **HDR 환경 맵**: .hdr 및 .exr 파일 지원
- **톤 매핑**: 다양한 옵션 (ACES Filmic, Cineon, Reinhard, Linear)
- **실시간 그림자**: 설정 가능한 품질의 PCF 소프트 섀도우
- **환경 조명**: 사실적인 반사를 위한 이미지 기반 조명 (IBL)

#### 🎮 카메라 모드
- **1인칭**: 몰입감 있는 FPS 스타일 네비게이션
- **3인칭**: 거리와 높이 조절 가능한 팔로우 카메라
- **자유 카메라**: 씬 탐색을 위한 제약 없는 비행 모드
- **부드러운 컨트롤**: 마우스 시점과 WASD/QE 이동

#### 🌅 동적 조명
- **시간대 시스템**: 자동 낮/밤 사이클
- **다양한 환경**: 스튜디오, 자연, 베니스 석양, 커스텀 HDR
- **조명 조절**: 앰비언트, 디렉셔널, 환경 강도 제어
- **실시간 하늘**: 태양 위치에 따른 절차적 하늘

#### 🎬 후처리 효과
- **블룸**: 빛나는 하이라이트와 HDR 효과
- **SSAO**: 깊이감을 위한 스크린 스페이스 앰비언트 오클루전
- **글리치 효과**: 디지털 왜곡 효과
- **필름 그레인**: 영화적인 텍스처 오버레이

#### ✨ 파티클 시스템
- **다양한 형태**: 구, 큐브, 토러스, 나선형 구성
- **모핑 애니메이션**: 형태 간 부드러운 전환
- **커스터마이징**: 크기, 속도, 색상 조절 가능
- **성능 최적화**: GPU 가속 파티클

#### ⚙️ 고급 설정
- **플레이어 커스터마이징**: 스케일, 속도, 눈 높이, 지면 레벨
- **그래픽 품질**: 그림자 해상도, 픽셀 비율, 안개
- **환경 컨트롤**: 배경 가시성, 블러, 강도
- **설정 관리**: 설정 저장/로드/내보내기/가져오기

### 🚀 빠른 시작

#### 설치

```bash
# 저장소 클론
git clone https://github.com/henry2craftman/gltf-viewer-player.git

# 프로젝트 디렉토리로 이동
cd gltf-viewer-player

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

#### 사용법

1. **GLTF 모델 로드**: "파일 선택"을 클릭하고 .gltf 또는 .glb 파일 선택
2. **카메라 모드 선택**: 1인칭, 3인칭, 자유 카메라 중 선택
3. **설정 조정**: 설정 패널을 열어 렌더링 및 효과 커스터마이즈
4. **네비게이션**: WASD로 이동, 마우스로 시점 회전, 스페이스로 점프

### 🎮 조작법

#### 이동
- **W/A/S/D**: 전진/좌/후진/우
- **Space**: 점프 (1인칭/3인칭 모드)
- **Q/E**: 하강/상승 (자유 카메라 모드)
- **Shift**: 질주 (2배 속도)

#### 카메라
- **마우스**: 시점 회전
- **1**: 1인칭 모드
- **2**: 3인칭 모드
- **3**: 자유 카메라 모드

#### 설정
- **설정 버튼**: 설정 패널 토글
- **파일 입력**: GLTF 모델 로드
- **슬라이더**: 다양한 파라미터 조정

### 📦 프로젝트 구조

```
gltf-viewer-player/
├── src/
│   ├── main.js              # 메인 애플리케이션 진입점
│   ├── Camera.js            # 카메라 컨트롤러
│   ├── Player.js            # 플레이어 이동
│   ├── PostProcessing.js    # 후처리 효과
│   ├── TimeOfDay.js         # 낮/밤 사이클
│   ├── ParticleSystem.js    # 파티클 효과
│   ├── GlitchEffect.js      # 글리치 셰이더
│   └── GlitchEffectPass.js  # 글리치 패스
├── index.html               # 메인 HTML 파일
├── package.json             # 의존성
└── vite.config.js           # Vite 설정
```

### 🛠️ 기술 세부사항

#### 기술 스택
- **Three.js**: 3D 렌더링 엔진
- **Vite**: 빠른 빌드 도구 및 개발 서버
- **GSAP**: 애니메이션 라이브러리
- **WebGL**: 하드웨어 가속 그래픽

#### 렌더링 파이프라인
1. **모델 로딩**: 자동 스케일링 및 센터링을 사용한 GLTFLoader
2. **환경 설정**: IBL을 위한 PMREM 생성기
3. **재질 향상**: 환경 맵이 적용된 PBR 재질
4. **섀도우 매핑**: 캐스케이드 섀도우가 있는 디렉셔널 라이트
5. **후처리**: 블룸, SSAO 및 커스텀 효과
6. **톤 매핑**: HDR에서 LDR로 변환

#### 성능 기능
- 정밀도를 위한 로그 깊이 버퍼
- 인스턴싱을 사용한 효율적인 파티클 시스템
- 최적화된 섀도우 맵 해상도
- 설정 가능한 품질 설정
- 스마트 에셋 캐싱

### 🎨 환경

#### 기본 제공 환경
- **Studio**: 중립적인 실내 조명 (기본값)
- **Natural**: 푸른 하늘의 야외 낮
- **Venice**: 극적인 석양 분위기
- **None**: 검은 배경, IBL 없음

#### 커스텀 HDR
커스텀 환경을 위한 .hdr 또는 .exr 파일 업로드:
1. "HDR 파일 로드" 클릭
2. HDR 이미지 선택
3. 노출과 배경 블러 조정

### 📊 설정 카테고리

#### 플레이어 설정
- 스케일, 눈 높이, 속도, 지면 레벨
- 3인칭 거리 & 높이

#### 후처리
- 효과 활성화/비활성화
- 블룸 강도
- SSAO 품질
- 글리치 효과

#### 시간대
- 자동 사이클 활성화/비활성화
- 시간 슬라이더 (0-24시)
- 시간 속도 배율
- 태양 강도

#### 그래픽
- 그림자 품질
- 안개 활성화/비활성화
- 픽셀 비율 (성능 vs 품질)

#### 환경 & 조명
- 환경 선택
- 톤 매핑 알고리즘
- 노출 제어
- 앰비언트/디렉셔널 라이트 색상 및 강도
- 배경 가시성 및 블러

#### 파티클 시스템
- 파티클 활성화/비활성화
- 형태 선택 (구, 큐브, 토러스, 나선)
- 크기 및 속도 조절

### 🔧 구성

설정은 localStorage에 자동으로 저장되며 다음이 가능합니다:
- **저장**: 현재 구성 저장
- **로드**: 저장된 구성 복원
- **리셋**: 기본값으로 돌아가기
- **내보내기**: JSON 파일로 다운로드
- **가져오기**: JSON 구성 업로드

### 🌐 브라우저 지원

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- WebGL 2.0 필요

### 📝 라이선스

MIT 라이선스 - 자유롭게 프로젝트에 사용하세요!

### 🤝 기여

기여를 환영합니다! Pull Request를 자유롭게 제출해주세요.

### 📧 연락처

제작자: [@henry2craftman](https://github.com/henry2craftman)

---

**아름답고 사실적인 환경에서 3D 모델을 탐험하세요!** 🎉
