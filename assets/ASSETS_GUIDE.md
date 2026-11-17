# DANH MỤC ASSETS ĐÃ TẢI CHO DỰ ÁN VOID SHIFT 3D

Toàn bộ asset đã được tải về và phân loại đầy đủ tại thư mục `assets/` của dự án, sẵn sàng để tích hợp vào Three.js.

---

## 1. Mô hình 3D (3D Models - GLTF / GLB)
> **Nguồn:** [Kenney Space Kit](https://kenney.nl/assets/space-kit) (Bản quyền: **CC0 1.0 Universal - Miễn phí hoàn toàn**)  
> **Thư mục chứa:** `assets/models/Models/GLTF format/`

| Tệp Model (`.glb`) | Mục đích trong Game | Mô tả & Cách dùng Three.js |
| :--- | :--- | :--- |
| `craft_racer.glb` | **Phi thuyền người chơi (Lựa chọn 1 - Tối ưu)** | Dáng thể thao, cánh vát khí động học, đuôi nhìn từ phía sau rất rõ nét. |
| `craft_speederA.glb` | **Phi thuyền người chơi (Lựa chọn 2)** | Mũi nhọn, vát cạnh sắc nét, đậm chất phi thuyền phản xạ nhanh. |
| `meteor_detailed.glb` | **Thiên thạch chướng ngại vật chính** | Khối đá low-poly đa giác vát cạnh sắc nét, dùng làm vật cản va chạm. |
| `meteor_half.glb` | **Mảnh vỡ thiên thạch (Debris)** | Dùng cho chướng ngại vật nhỏ hoặc vỡ ra khi va chạm. |

*Cách tải vào Three.js:*
```javascript
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const loader = new GLTFLoader();
loader.load('assets/models/Models/GLTF format/craft_racer.glb', (gltf) => {
    const ship = gltf.scene;
    scene.add(ship);
});
```

---

## 2. Âm thanh & Hiệu ứng SFX
> **Nguồn:** [Kenney Sci-Fi Sounds](https://kenney.nl/assets/sci-fi-sounds) & [Interface Sounds](https://kenney.nl/assets/interface-sounds) (**CC0**)

### A. Hiệu ứng Gameplay (`assets/audio/sci-fi/Audio/`)
| Tệp âm thanh | Cơ chế kích hoạt |
| :--- | :--- |
| `forceField_000.ogg` / `forceField_001.ogg` | **Chuyển pha (Space / Click):** Tiếng vút năng lượng khi đổi giữa Cyan và Cam. |
| `laserRetro_004.ogg` / `laserRetro_001.ogg` | **Ăn tinh thể đúng màu:** Âm ting điện tử trong trẻo, vui tai khi cộng điểm. |
| `explosionCrunch_000.ogg` | **Va chạm / Mất máu:** Âm thanh nổ vỡ khi đâm vào thiên thạch hoặc sai pha. |
| `thrusterFire_001.ogg` | **Hyper-Drive Kích hoạt:** Âm động cơ phản lực gầm rú khi bứt tốc. |
| `spaceEngineLow_000.ogg` | **Động cơ nền:** Âm thanh rù rì liên tục của phi thuyền khi bay lướt. |

### B. Hiệu ứng Giao diện HUD (`assets/audio/ui/Audio/`)
| Tệp âm thanh | Cơ chế kích hoạt |
| :--- | :--- |
| `click_002.ogg` | Tiếng click nút Start / Play Again / Tùy chọn. |
| `confirmation_001.ogg` | Bắt đầu vòng chơi mới / Đếm ngược. |
| `back_001.ogg` | Tạm dừng (Pause) hoặc hủy thao tác. |

---

## 3. Nhạc nền (BGM)
> **Nguồn:** Incompetech - Kevin MacLeod (Bản quyền: **Creative Commons: By Attribution 4.0**)  
> **Thư mục chứa:** `assets/audio/bgm/`

* **Tệp:** `laserpack_bgm.mp3`
* **Phong cách:** Electro / Synthwave tiết tấu nhanh, dồn dập, cực kỳ phù hợp cho game phản xạ tốc độ cao.
* **Credit yêu cầu:**  
  *"Laserpack" Kevin MacLeod (incompetech.com) - Licensed under Creative Commons: By Attribution 4.0 License*

---

## 4. Môi trường Vũ trụ & Hiệu ứng Hạt (Space Environment & Particles)

### A. Bầu trời Vũ trụ (MilkyWay Skybox Cubemap)
> **Nguồn:** Three.js Official Examples Textures  
> **Thư mục chứa:** `assets/textures/skybox/milkyway/`  
> **Gồm 6 mặt khối hộp:** `dark-s_px.jpg`, `dark-s_nx.jpg`, `dark-s_py.jpg`, `dark-s_ny.jpg`, `dark-s_pz.jpg`, `dark-s_nz.jpg`

*Cách dùng trong Three.js:*
```javascript
const cubeLoader = new THREE.CubeTextureLoader();
cubeLoader.setPath('assets/textures/skybox/milkyway/');
const spaceSkybox = cubeLoader.load([
    'dark-s_px.jpg', 'dark-s_nx.jpg',
    'dark-s_py.jpg', 'dark-s_ny.jpg',
    'dark-s_pz.jpg', 'dark-s_nz.jpg'
]);
scene.background = spaceSkybox;
```

### B. Hạt sao & Bụi vũ trụ (Starfield Particles)
> **Thư mục chứa:** `assets/textures/sprites/`  
> **Tệp:** `disc.png`, `spark1.png`

*Cách dùng cho Three.js Points:*
```javascript
const starTexture = new THREE.TextureLoader().load('assets/textures/sprites/disc.png');
const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.8,
    map: starTexture,
    transparent: true,
    blending: THREE.AdditiveBlending
});
```

### C. Hiệu ứng Lửa phản lực đuôi tàu & Lóe sáng va chạm (VFX Particles)
> **Nguồn:** [Kenney Particle Pack](https://kenney.nl/assets/particle-pack) (Bản quyền: **CC0**)  
> **Thư mục chứa:** `assets/textures/particles/PNG (Transparent)/`  
* Chứa hơn 80 texture hạt trong suốt: vệt lửa đuôi tàu (`flame_*.png`), tia chớp (`spark_*.png`), quầng sáng (`circle_*.png`), khói vỡ (`smoke_*.png`).

---

## 5. Tinh thể & Vật phẩm thưởng (Tạo trực tiếp bằng Three.js hoặc dùng Model có sẵn)
* **Model có sẵn trong `assets/models/Models/GLTF format/`:**
  * `rock_crystals.glb` / `rock_crystalsLargeA.glb`: Tinh thể đá vũ trụ (dùng làm Tinh thể pha).
  * `pipe_ring.glb`: Cổng vòng năng lượng (dùng làm cổng Hyper-Drive hoặc checkpoint).
* **Hoặc tạo nhanh bằng hình học thuần Three.js:**
  * **Tinh thể pha (Phase Crystal):** `new THREE.IcosahedronGeometry(0.6, 0)` phủ màu `#00F0FF` (Cyan) hoặc `#FF5500` (Cam) có `emissive`.
  * **Lõi sửa chữa (Repair Core):** `new THREE.CapsuleGeometry(0.3, 0.6, 4, 8)` màu xanh lục `#00FF66`.
  * **Mảnh cộng hưởng (Resonance Shard):** `new THREE.TorusGeometry(0.5, 0.15, 8, 16)` màu vàng kim `#FFD700`.
