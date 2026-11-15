# TÀI LIỆU ĐẶC TẢ KỸ THUẬT (TECHNICAL SPECIFICATION)
## DỰ ÁN: AQUA DASH (THREE.JS + PHASER 4 HYBRID)

---

### 1. KIẾN TRÚC TỔNG THỂ (SYSTEM ARCHITECTURE)

Dự án áp dụng mô hình **Kiến trúc Ghép lớp Kép (Layered Dual-Engine Architecture)** nhằm đạt được hai mục tiêu quan trọng nhất trong thời gian giới hạn 150 phút:
1. **Thị giác 3D đột phá:** Three.js đảm nhiệm render môi trường đáy đại dương sâu thẳm, hiệu ứng ánh sáng dưới nước (water caustics/fog) và hệ thống hạt bong bóng 3D có chiều sâu Parallax.
2. **Logic & Vật lý 2D siêu tốc:** Phaser 4 chạy trên lớp trên cùng (canvas trong suốt), xử lý toàn bộ vòng lặp game (Game Loop), vật lý bơi mượt mà qua Arcade Physics, phát hiện va chạm chuẩn xác, hệ sinh cột chướng ngại vật và giao diện HUD.

```
+-------------------------------------------------------------+
|              TRÌNH DUYỆT (HTML5 DOM Container)              |
|                                                             |
|   +-----------------------------------------------------+   |
|   |  LỚP 2: Phaser 4 Canvas (Z-Index: 2, Transparent)   |   |
|   |  - Player Fish (2D Sprite + Arcade Physics Buoyancy)|   |
|   |  - Columns / Obstacles (Arcade Static/Group Bodies) |   |
|   |  - Collectibles (Pearls / Stars + Trigger Overlap)  |   |
|   |  - Score Manager, Audio SFX, HUD & UI Game Over     |   |
|   +-----------------------------------------------------+   |
|                              |                              |
|                 [Event Sync / Shared State]                 |
|                              v                              |
|   +-----------------------------------------------------+   |
|   |  LỚP 1: Three.js Canvas (Z-Index: 1, WebGL Scene)   |   |
|   |  - Perspective Camera & Depth Fog                   |   |
|   |  - Caustics Light & Ambient Water Tint              |   |
|   |  - 3D Floating Plankton & Bubble Particle System    |   |
|   |  - Parallax 3D Coral Reefs / Distant Ocean Floor    |   |
|   +-----------------------------------------------------+   |
+-------------------------------------------------------------+
```

---

### 2. PHÂN TÍCH TECH STACK & THƯ VIỆN

* **Build Tool & Dev Server:** Vite (khởi động 0.3s, Hot Module Replacement cực nhanh trong 150p).
* **Ngôn ngữ:** JavaScript ES6+ (Module hóa sạch sẽ, không cần cấu hình TypeScript phức tạp để tiết kiệm thời gian gõ code).
* **Three.js (v0.187+):**
  * `THREE.WebGLRenderer`: Tối ưu với antialias và alpha enabled.
  * `THREE.PerspectiveCamera`: Góc nhìn 60 độ tạo cảm giác mở rộng lòng đại dương.
  * `THREE.Points` / `BufferGeometry`: Sinh 300 - 500 hạt bong bóng và sinh vật phù du 3D bơi lơ lửng với chi phí render gần như bằng 0.
  * `THREE.DirectionalLight` + `THREE.FogExp2`: Giả lập độ mờ ảo của nước biển sâu (`#021226` đến `#00487c`).
* **Phaser 4 (v4.2.1):**
  * Khởi tạo với cấu hình `transparent: true` (hoàn toàn trong suốt để nhìn thấu lớp Three.js bên dưới).
  * Sử dụng `Phaser.Scene`, Arcade Physics (`this.physics.add`), ParticleEmitter, Tweens và nhóm đối tượng (`Physics.Arcade.Group`).

---

### 3. THIẾT KẾ CÁC MODULE CHỨC NĂNG

#### 3.1. Module Đồng bộ Trạng thái (State Bridge / GameEvent)
* Quản lý trạng thái chung qua một đối tượng đơn giản:
  ```javascript
  // Trạng thái dùng chung giữa Phaser 4 và Three.js
  const GameState = {
    current: "MENU", // MENU | PLAYING | GAMEOVER
    score: 0,
    bonusScore: 0,
    highScore: 0,
    swimSpeed: 200, // Tốc độ trôi dòng chảy (px/s)
    isDiving: false
  };
  ```
* Khi người chơi bơi hoặc tăng tốc, gửi tín hiệu để Three.js tăng tốc độ cuộn hạt bong bóng 3D, tạo cảm giác đồng bộ tuyệt đối giữa 2D và 3D.

#### 3.2. Module Nhân vật & Đàn Cá AI (Player & Boids AI Controller)
* **Nhân vật chính:**
  * Vị trí ban đầu: `vec2(180, height() / 2)`
  * Trọng lực (Buoyancy counter-gravity): `920 px/s²`
  * Lực bơi (Swim impulse): `-360 px/s` khi nhấn `Space` / Click.
  * **Cơ chế Cá Nóc (Puffer Dash):** Nhấn `Shift` / `Chuột phải`, kích hoạt trạng thái phình gai trong 1.2s, tiêu tốn 35 Stamina, phóng to hitbox và cho phép húc vỡ vụn các cột đá nứt (Fractured Pillars).
* **Đàn cá AI Hộ mệnh (Boids Flocking AI):**
  * Sử dụng thuật toán Boids của Craig Reynolds với 4 lực vector: Separation (tránh va vào nhau), Alignment (bơi cùng hướng), Cohesion (hút về tâm đàn), và Leader Attraction (bơi bám sau đuôi cá mẹ).
  * **Scavenger AI:** Đàn cá con có tầm nhìn 140px, tự động tách đàn lao tới nhặt ngọc trai gần đó.
  * **Lá chắn sinh học:** Khi va quẹt chướng ngại vật, một cá con hy sinh thay cho người chơi và kích hoạt 1.4s bất tử tạm thời.
  * Thu thập đủ 3 viên ngọc liên tiếp sẽ sinh thêm 1 chú cá con vào đàn (tối đa 5 con).

#### 3.3. Module Chướng ngại vật & Cột ngầm (Obstacle System - Phaser 4)
* **Thuật toán sinh cột (Spawn Pipeline):**
  * Tần suất sinh: Mỗi `1.8 giây` (tự giảm theo độ khó xuống tối thiểu `1.2 giây`).
  * Một cặp cột gồm: **Cột trên** (từ nóc hang cắm xuống) và **Cột dưới** (từ đáy biển nhô lên).
  * Khoảng hở an toàn (Gap Size): Mặc định `150px` (thu hẹp dần xuống `115px`).
  * Vị trí tâm Gap ngẫu nhiên: `Phaser.Math.Between(120, height - 120)`.
* **Cấu trúc gắn kèm mỗi cột trong Phaser 4:**
  * Sử dụng Arcade Physics Group: `this.physics.add.group()` cho các chướng ngại vật.
  * Mỗi cột được tạo bằng Sprite/Image với `body.setVelocityX(-GameState.swimSpeed)`.
  * `body.setImmovable(true)` và `body.allowGravity = false`.
  * Hitbox điều chỉnh thụt lề an toàn bằng `body.setSize(colWidth, colHeight)`.
  * Tự động dọn dẹp khi trôi khỏi màn hình: kiểm tra `x < -colWidth` -> `pillar.destroy()` để tránh rò rỉ bộ nhớ.

#### 3.4. Module Điểm thưởng & Thu thập (Collectibles)
* **Ngọc trai (Pearl):**
  * Tỉ lệ xuất hiện: 60% xác suất mỗi khi sinh cột mới.
  * Tọa độ: Đặt chính giữa tâm Gap hoặc hơi lệch về phía mép cột đá.
  * Tương tác: Khi chạm cá -> `destroy()`, kích hoạt âm thanh thu thập, nổ hiệu ứng hạt bong bóng 2D và cộng `+5` điểm.
* **Điểm thường:**
  * Cột đá ngầm gắn cờ `passed = false`.
  * Khi `player.pos.x > column.pos.x && !column.passed`: Đánh dấu `passed = true`, cộng `+1` điểm và kích hoạt âm thanh ting nhẹ.

#### 3.5. Module Cảnh nền 3D (Deep Ocean 3D Engine - Three.js)
* **Khung cảnh:**
  * Tạo một buồng chứa nước 3D vô tận dạng ống (Cylinder/Tunnel) hoặc mặt đáy biển dạng Low-Poly Mesh với Wireframe/Wave Vertex Animation.
  * Hệ thống hạt bong bóng (`THREE.Points`): Các hạt ngẫu nhiên trong tọa độ `X: [-50, 50], Y: [-30, 30], Z: [-100, 10]`.
  * Mỗi frame trong vòng lặp Three.js `requestAnimationFrame`:
    * Hạt di chuyển lùi về trục Z và dập dềnh nhẹ theo hàm `sin(time + seed)`.
    * Khi hạt trôi qua camera, tự động reset vị trí về phía xa.

---

### 4. XỬ LÝ VA CHẠM & TỐI ƯU TRẢI NGHIỆM (HITBOX TUNING)
* **Vấn đề thường gặp:** Hitbox hình chữ nhật bao quanh toàn bộ đuôi và vây cá làm người chơi bị ức chế vì "chết oan" khi chỉ quẹt nhẹ.
* **Giải pháp kỹ thuật:**
  * Thiết lập Hitbox của chú cá nhỏ hơn kích thước sprite khoảng 20% (`area({ scale: 0.8 })` hoặc bo tròn `area({ shape: new Circle(vec2(0), radius) })`).
  * Cột đá sử dụng collider thụt vào mép 4px, tạo cảm giác người chơi có thể lách qua kẽ hẹp trong gang tấc.

---

### 5. LƯU TRỮ VÀ ÂM THANH
* **Lưu điểm kỷ lục:**
  * Đọc: `localStorage.getItem("aquadash_highscore") || 0`
  * Ghi: Cập nhật nếu `totalScore > highScore` khi Game Over.
* **Hệ thống âm thanh (Audio Synthesis / Procedural Web Audio):**
  * Để không phụ thuộc vào việc tìm kiếm file âm thanh mp3 trong 150 phút, sử dụng bộ tổng hợp âm tần số trực tiếp (Web Audio API / Procedural Synth):
    * **Âm bơi (Swim):** Sóng sin tần số thấp `120Hz -> 80Hz` tạo tiếng bì bõm dưới nước.
    * **Âm ăn ngọc (Pearl):** Sóng Arpeggio kép tần số cao `520Hz -> 880Hz` trong vắt.
    * **Âm va chạm (Crash):** Noise buffer nén tạo tiếng sụp đổ trầm đục.

---

### 6. QUẢN LÝ RỦI RO KỸ THUẬT (GAME JAM CONTINGENCY PLAN)
| Rủi ro kỹ thuật | Mức độ | Phương án ứng phó dự phòng |
| :--- | :--- | :--- |
| Tích hợp Three.js gây tụt khung hình trên máy yếu | Trung bình | Giảm số lượng hạt bong bóng từ 500 xuống 100, tắt antialias, dùng shader tối giản |
| Trục trặc đồng bộ kích thước 2 canvas khi resize | Thấp | Cố định kích thước canvas game theo tỉ lệ 16:9 chuẩn (ví dụ 1280x720) và căn giữa qua CSS `transform: scale()` |
| Thiếu thời gian làm assets ảnh động 2D | Trung bình | Sử dụng đồ họa pixel hoặc vẽ hình học (Procedural shapes/Canvas drawing) phong cách cá neon hiện đại |

