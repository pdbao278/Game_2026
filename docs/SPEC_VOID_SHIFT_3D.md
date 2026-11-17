# ĐẶC TẢ KỸ THUẬT DỰ ÁN: VOID SHIFT 3D (CHUYỂN PHA KHÔNG GIAN)
**Tài liệu Spec-Driven Development (Phase 1: Specification)**  
*Dự án tham gia: IT GAME JAM 2026 – WITH AI (Khoa CNTT - Trường ĐH Khoa học, Đại học Huế)*  
*Thời gian thực hiện tiêu chuẩn: 120 – 150 phút*

---

## 1. Các Giả Định Khởi Đầu (Assumptions)

1. **Nền tảng & Công nghệ:** Ứng dụng web chạy trực tiếp trên trình duyệt hiện đại (Chrome, Edge, Firefox), sử dụng **HTML5 Canvas + Three.js (ES Module)** kết hợp lớp phủ giao diện **HTML/CSS/JS (DOM HUD)** từ bản xem trước `preview_ui.html`.
2. **Không phụ thuộc backend phức tạp:** Toàn bộ logic, tính toán va chạm, điểm số, kỷ lục (High Score qua `localStorage`) đều chạy ở Client-side, không yêu cầu máy chủ cơ sở dữ liệu chuyên biệt.
3. **Môi trường chạy:** Có thể khởi chạy trực tiếp thông qua một HTTP Local Server đơn giản (như `npx serve`, Vite, hoặc extension Live Server) để nạp các tệp GLTF/GLB, Texture và Audio mà không bị chặn bởi CORS policy của trình duyệt.
4. **Hệ thống điều khiển:** Ưu tiên bàn phím (`A`/`D` hoặc `Mũi tên Trái`/`Phải` để lướt làn, `Phím Cách (Space)` để đổi pha) cùng với click chuột / chạm cảm ứng dự phòng.
5. **Mô hình tài nguyên:** Ưu tiên nạp và hiển thị trực tiếp các mô hình 3D định dạng `.glb` từ Kenney Space Kit đã có sẵn tại thư mục `assets/models/Models/GLTF format/`, kết hợp các hiệu ứng hạt từ `assets/textures/`.

---

## 2. Mục Tiêu Dự Án (Objective)

* **Tên sản phẩm:** *Void Shift 3D*
* **Thể loại:** 3D Endless Runner / Reflex Arcade (Phản xạ tốc độ cao)
* **Đối tượng trải nghiệm:** Khán giả và Ban giám khảo cuộc thi IT Game Jam 2026.
* **Mục tiêu gameplay:** Người chơi điều khiển phi thuyền lướt qua dải ngân hà với tốc độ tăng dần, né tránh thiên thạch, chuyển đổi giữa hai trạng thái năng lượng **Pha Băng (Cyan `#00F5FF`)** và **Pha Lửa (Cam `#FF7700`)** để hấp thụ tinh thể tương ứng, kích hoạt chế độ **Hyper-Drive** và sinh tồn đạt điểm số cao nhất.
* **Thời lượng ván chơi:** 1 – 3 phút / lượt chơi, mang tính gây nghiện cao và thôi thúc chơi lại liên tục.

---

## 3. Ngăn Xếp Công Nghệ & Lệnh Thực Thi (Tech Stack & Commands)

### 3.1. Công nghệ sử dụng
* **Engine dựng hình 3D:** Three.js (phiên bản r128+ qua ES Module hoặc importmap/CDN/npm).
* **Định dạng 3D Loader:** `GLTFLoader` (cho tàu `craft_racer.glb`, thiên thạch `meteor_detailed.glb`).
* **Hiệu ứng đồ họa:** Particle System (Points/Sprites) cho Starfield, vệt khói lửa phản lực đuôi tàu.
* **Giao diện người dùng (UI/HUD):** HTML5 / CSS3 / Vanilla JavaScript module, kế thừa 100% hệ thống thiết kế Neo-Arcade Cosmic từ `preview_ui.html` (đạt chuẩn không "mùi AI", font *Orbitron* & *Chakra Petch*, kính mờ `backdrop-filter`).
* **Âm thanh:** Web Audio API / HTML5 Audio với hệ thống SFX từ Kenney Sci-Fi & BGM `laserpack_bgm.mp3`.

### 3.2. Lệnh thực thi dự kiến (Commands)
```bash
# Khởi chạy máy chủ phát triển cục bộ (chọn 1 trong các cách sau)
npx serve . -p 3000
# hoặc nếu dùng vite:
npm run dev

# Kiểm tra cú pháp và code
npm run lint

# Mở trình duyệt kiểm thử:
http://localhost:3000/index.html
```

---

## 4. Cấu Trúc Thư Mục Dự Án (Project Structure)

```text
e:/ITGAME/
├── assets/                     # Tài nguyên gốc Kenney (Đã tải sẵn)
│   ├── audio/                  # Âm thanh SFX & BGM laserpack
│   ├── models/                 # File mô hình 3D .glb và ảnh render isometric
│   └── textures/               # Skybox MilkyWay, hạt particles đuôi tàu & vfx
├── asset_new/                  # Tài nguyên đồ họa chibi 2D bổ trợ
├── docs/                       # Tài liệu dự án
│   ├── TheLe.docx.md           # Thể lệ cuộc thi IT Game Jam 2026
│   └── SPEC_VOID_SHIFT_3D.md   # Tài liệu đặc tả kỹ thuật này
├── src/                        # Mã nguồn phát triển game 3D
│   ├── core/                   # Quản lý vòng lặp game, State Machine & EventBus
│   │   ├── GameState.js        # Quản lý trạng thái: START, PLAYING, GAMEOVER
│   │   └── EventBus.js         # Phát - nhận sự kiện giữa 3D và UI DOM
│   ├── game/                   # Toàn bộ logic 3D Three.js
│   │   ├── SceneManager.js     # Khởi tạo Three.js Scene, Camera, Renderer, Resize
│   │   ├── Environment.js      # Skybox MilkyWay, Starfield particle lướt tới
│   │   ├── LaneSystem.js       # Quản lý 5 làn đường (hoặc 3 làn), tọa độ X
│   │   ├── PlayerShip.js       # Tải model GLB, đổi màu pha, hiệu ứng lửa đuôi tàu
│   │   ├── ObstacleManager.js  # Sinh thiên thạch, tinh thể, lõi hồi máu, object pool
│   │   └── CollisionSystem.js  # Tính toán va chạm hộp (AABB) & né sát (Near-miss)
│   ├── ui/                     # Điều khiển giao diện DOM
│   │   └── UIManager.js        # Cập nhật máu (Hearts), điểm, pha, thanh Hyper-Drive
│   └── audio/                  # Quản lý âm thanh
│       └── AudioManager.js     # Phát SFX đổi pha, nhặt điểm, nổ, BGM looping
├── index.html                  # File chính tích hợp Three.js Canvas và UI Overlay
├── preview_ui.html             # Bản duyệt giao diện mẫu đã chốt
└── Y_TUONG_GAME_3D.md          # Tài liệu ý tưởng ban đầu
```

---

## 5. Quy Chuẩn Mã Nguồn & Kiến Trúc Kỹ Thuật (Code Style & Architecture)

### 5.1. Mô hình Kiến trúc Phân tầng (Separation of Concerns)
* **Tầng 3D Rendering (Three.js):** Chịu trách nhiệm render thế giới 3D, camera di chuyển theo tàu, vật thể cuộn về phía tàu, va chạm vật lý bounding box. Hoàn toàn không can thiệp vẽ text UI trực tiếp lên canvas nếu không cần thiết.
* **Tầng Giao diện Lớp phủ (DOM HUD Overlay):** Giữ nguyên kiến trúc từ `preview_ui.html`. Nhận dữ liệu từ 3D thông qua `EventBus` nhẹ để cập nhật điểm, HP, trạng thái thanh Hyper-Drive với tốc độ 60 FPS mà không làm giật khung hình 3D.

### 5.2. Chu kỳ Vòng lặp Game (Game Loop Pattern)
```javascript
// Chu kỳ mẫu trong GameEngine
function animate(currentTime) {
    requestAnimationFrame(animate);
    const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
    lastTime = currentTime;

    if (GameState.current === GameState.PLAYING) {
        // 1. Cập nhật tốc độ tịnh tiến và vị trí đường chạy
        worldSpeed = baseSpeed + (gameTime * speedAcceleration);
        
        // 2. Cập nhật Player (lướt ngang mượt mà với lerp)
        playerShip.update(deltaTime);
        
        // 3. Cập nhật sinh và di chuyển chướng ngại vật/tinh thể
        obstacleManager.update(deltaTime, worldSpeed);
        
        // 4. Kiểm tra va chạm & né sát
        collisionSystem.check(playerShip, obstacleManager.getActiveObjects());
        
        // 5. Cập nhật bầu trời sao & vệt hạt tốc độ
        environment.update(deltaTime, worldSpeed);
    }
    
    renderer.render(scene, camera);
}
```

### 5.3. Quy tắc Đặt tên & Định dạng
* Tên biến và hàm dùng `camelCase` mang ý nghĩa rõ ràng: `currentPhase`, `switchPhase()`, `takeDamage()`, `activateHyperDrive()`.
* Tên lớp / Module dùng `PascalCase`: `PlayerShip`, `ObstacleManager`.
* Tên hằng số cố định dùng `UPPER_SNAKE_CASE`: `PHASE_CYAN`, `PHASE_ORANGE`, `MAX_HEALTH = 3`.

---

## 6. Cơ Chế Gameplay Chi Tiết & Cân Bằng Toán Học (Core Mechanics)

### 6.1. Hệ thống Làn đường (Lane System)
* **Chế độ mặc định (5 làn):** Tọa độ X tương ứng: `[-4.0, -2.0, 0, 2.0, 4.0]`.
* **Chế độ cơ bản (3 làn):** Tọa độ X: `[-2.5, 0, 2.5]`.
* Phi thuyền chuyển làn mượt mà bằng phép nội suy tuyến tính:  
  $$x_{current} = \text{lerp}(x_{current}, x_{target}, 15 \times \Delta t)$$

### 6.2. Cơ chế Chuyển Pha Năng Lượng (Phase Shift)
* Hai trạng thái: `CYAN` (`#00F5FF`) và `ORANGE` (`#FF7700`).
* Thao tác: Nhấn `Phím Cách (Space)` hoặc Click chuột trái.
* Cooldown đổi pha: $150\,\text{ms}$ (ngăn chặn spam phím).
* Phản hồi thị giác: Đổi ánh sáng phát quang trên thân tàu (`Emissive Color`), đổi màu vệt lửa động cơ phản lực đuôi tàu và phát âm thanh `forceField_000.ogg`.

### 6.3. Tương tác với Vật thể trên đường bay

| Vật thể | Tỉ lệ xuất hiện | Khi cùng pha | Khi khác pha / Va chạm | Âm thanh kích hoạt |
| :--- | :--- | :--- | :--- | :--- |
| **Tinh thể Băng (Cyan)** | 35% | $+100$ điểm, $+8\%$ Hyper-Drive | Mất $1$ điểm bền (HP), rung camera | `laserRetro_004.ogg` / `explosionCrunch_000.ogg` |
| **Tinh thể Lửa (Cam)** | 35% | $+100$ điểm, $+8\%$ Hyper-Drive | Mất $1$ điểm bền (HP), rung camera | `laserRetro_004.ogg` / `explosionCrunch_000.ogg` |
| **Thiên thạch (Asteroid)** | 20% | Luôn là vật cản! Mất $1$ HP | Luôn là vật cản! Mất $1$ HP | `explosionCrunch_000.ogg` |
| **Lõi sửa chữa (Repair Core)** | 5% (Hiếm) | Hồi phục $+1$ HP (tối đa 3) | Hồi phục $+1$ HP (tối đa 3) | `confirmation_001.ogg` |
| **Mảnh cộng hưởng (Resonance)** | 5% (Hiếm) | Nhân đôi điểm $(\times 2)$ trong $8\,\text{s}$ | Nhân đôi điểm $(\times 2)$ trong $8\,\text{s}$ | `star_01` SFX / Toast thông báo |

### 6.4. Cơ chế Né Sát (Near-Miss Evasion) & Rủi ro / Phần thưởng
* Khoảng cách né sát: Khi phi thuyền đi qua thiên thạch ở làn liền kề với khoảng cách $\Delta z \approx 0$ và $\Delta x \le 2.2$ mà không va chạm.
* Phần thưởng: $+250$ điểm, $+15\%$ nạp Hyper-Drive, hiện popup toast `⚡ NEAR-MISS EVASION +250 PTS`.

### 6.5. Chế độ Hyper-Drive
* Kích hoạt tự động hoặc bấm phím khi thanh năng lượng đạt $100\%$.
* Thời lượng: $6\,\text{s}$.
* Hiệu ứng:
  * Tốc độ cuộn tăng $1.8\times$.
  * Tàu được bảo vệ bởi trường vô địch (phá hủy mọi thiên thạch khi chạm).
  * Hút toàn bộ tinh thể năng lượng về phía tàu (Từ trường hút).
  * Hiệu ứng vệt sáng speed lines kéo dài trên màn hình.

---

## 7. Chiến Lược Kiểm Thử (Testing Strategy)

1. **Kiểm thử hiệu năng (Performance Test):** Duy trì ổn định $60\,\text{FPS}$ trên màn hình máy tính thông thường thông qua việc tái sử dụng vật thể (Object Pooling), không tạo mới `new Mesh` liên tục trong vòng lặp `requestAnimationFrame`.
2. **Kiểm thử va chạm (Collision Accuracy):** Đảm bảo va chạm chính xác theo Bounding Sphere hoặc Bounding Box thu nhỏ ($80\%$ kích thước thực) để tránh tình trạng "va chạm vô lý" gây ức chế cho người chơi.
3. **Kiểm thử máy trạng thái (State Transition):**
   * Start $\to$ Bấm Bắt đầu $\to$ Playing $\to$ Hết 3 HP $\to$ Game Over.
   * Game Over $\to$ Bấm Chơi lại $\to$ Reset trạng thái sạch sẽ (HP = 3, Score = 0, Hyper = 0) và bắt đầu ngay không cần tải lại trang.
4. **Kiểm thử âm thanh & Tương tác:** Trình duyệt hiện đại chặn âm thanh tự động phát; cơ chế mở âm thanh (BGM & SFX) được kích hoạt ngay khi người chơi bấm nút "BẮT ĐẦU" đầu tiên.

---

## 8. Các Ranh Giới Phát Triển (Boundaries)

* **LUÔN LUÔN LÀM (Always Do):**
  * Tối ưu hóa tải tài nguyên: nạp trước (preload) model và âm thanh trước khi bắt đầu ván.
  * Tôn trọng bảng màu và quy chuẩn thẩm mỹ đã chốt tại `preview_ui.html` (tránh giao diện AI sáo rỗng, lòe loẹt).
  * Viết mã có comment giải thích ngắn gọn, dễ hiểu bằng Tiếng Việt để các thành viên chưa biết Three.js nắm được.
* **HỎI Ý KIẾN TRƯỚC (Ask First):**
  * Thêm các thư viện nặng bên ngoài ngoài Three.js.
  * Thay đổi cấu trúc cơ chế cốt lõi khác với bản ý tưởng đã duyệt.
* **TUYỆT ĐỐI KHÔNG LÀM (Never Do):**
  * Không làm bước ngoài prompt yêu cầu.
  * Không xóa cơ sở dữ liệu hoặc các tệp tin hiện hữu của dự án.
  * Không tạo ra code rác hoặc các hàm thừa thãi làm tụt FPS của Three.js.

---

## 9. Tiêu Chí Nghiệm Thu Thành Công (Success Criteria)

1. [ ] Mở `index.html` trên trình duyệt hiển thị màn hình Start Menu đẹp mắt đúng như `preview_ui.html`.
2. [ ] Bấm "BẮT ĐẦU" chuyển mượt mà vào cảnh 3D Three.js: tàu không gian hiển thị sắc nét với bầu trời sao MilkyWay và các hạt lướt tới.
3. [ ] Phím `A`/`D` lướt làn mượt mà; phím `Space` đổi pha Băng/Lửa tức thì kèm hiệu ứng đổi màu phát quang trên tàu và HUD.
4. [ ] Hệ thống chướng ngại vật xuất hiện ngẫu nhiên liên tục; va chạm đúng pha/sai pha/thiên thạch hoạt động chính xác $100\%$.
5. [ ] HUD hiển thị đúng số trái tim (3 HP), điểm số tăng dần, thanh Hyper-Drive nạp đầy và kích hoạt bứt tốc.
6. [ ] Khi hết 3 HP, màn hình Game Over xuất hiện hiển thị đúng số điểm đạt được, số tinh thể đã nhặt, và nút "Chơi lại" hoạt động trơn tru.
7. [ ] Trò chơi duy trì 60 FPS mượt mà không có lỗi console rò rỉ bộ nhớ.

---

## 10. Quyết Định Đã Chốt Sau Phase 1

1. **Kiến trúc triển khai:** Sử dụng **Single Entry / Static Server với Three.js Importmap (ES Modules)** để dự án có thể chạy trực tiếp trên bất kỳ trình duyệt nào thông qua một máy chủ tĩnh (như `npx serve`, Live Server, hoặc mở trực tiếp nếu cấu hình cho phép), tối ưu tuyệt đối thời gian thi đấu và dễ dàng nén nộp bài.
2. **Cơ chế điều khiển đa nền tảng:**
   * **Bàn phím:** `A`/`D` hoặc `Mũi tên Trái`/`Phải` (chuyển làn), `Phím Cách (Space)` (đổi pha), `Phím L` (đổi 3 làn/5 làn).
   * **Chuột & Cảm ứng (Touch/Swipe):**
     * Click / Chạm vào nửa trái/phải màn hình hoặc vuốt ngang (Swipe Left/Right) để đổi làn.
     * Chạm vào thân phi thuyền hoặc bấm nút UI / Phím Space để đảo pha.

