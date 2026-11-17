# Kế Hoạch Triển Khai Kỹ Thuật: VOID SHIFT 3D (Chuyển Pha Không Gian)

## 1. Tổng Quan Dự Án (Overview)
*Void Shift 3D* là tựa game 3D Endless Runner / Reflex Arcade chạy trực tiếp trên nền tảng Web (HTML5 Canvas + Three.js ES Modules kết hợp giao diện DOM HUD từ `preview_ui.html`). Người chơi điều khiển phi thuyền lướt qua dải ngân hà với tốc độ tăng dần, né tránh thiên thạch, thực hiện cơ chế sáng tạo **Chuyển Pha Năng Lượng** giữa **Pha Băng (Cyan `#00F5FF`)** và **Pha Lửa (Cam `#FF7700`)** để hấp thụ tinh thể tương ứng, kích hoạt chế độ siêu tốc **Hyper-Drive**, thực hiện các pha lướt sát **Near-Miss Evasion** để ghi điểm số kỷ lục. Toàn bộ dự án được thiết kế hoàn thiện cho cuộc thi *IT Game Jam 2026* với mục tiêu phát triển trong khung thời gian 120 – 150 phút, phong cách tối giản hiện đại (Neo-Arcade Cosmic) nói không với "mùi AI".

---

## 2. Quyết Định Kiến Trúc Cốt Lõi (Architecture Decisions)

1. **Single Entry / Static Server với Three.js Importmap (ES Modules):**
   - *Quyết định:* Sử dụng Three.js (r128+) thông qua CDN Importmap hoặc ES Modules cục bộ, nạp trực tiếp qua các file module JavaScript tiêu chuẩn mà không dùng bundler phức tạp (Webpack/Vite).
   - *Lý do:* Giảm thiểu rủi ro lỗi build trong phòng thi 120 phút, có thể chạy tức thì trên bất kỳ máy chủ tĩnh nào (`npx serve`, Live Server, Python http.server) và dễ dàng nén thư mục nộp bài.

2. **Tách biệt Trách nhiệm qua EventBus (Separation of Concerns):**
   - *Quyết định:* Tầng 3D Three.js chỉ tập trung vào mô hình, ánh sáng, chuyển động và tính toán va chạm. Tầng giao diện DOM HUD (kế thừa 100% từ `preview_ui.html`) hiển thị đè lên Canvas và nhận sự kiện từ 3D thông qua `EventBus` nhẹ.
   - *Lý do:* Đảm bảo giao diện chữ, thanh máu, điểm số sắc nét tuyệt đối, giữ nguyên thiết kế kính mờ `backdrop-filter` đã được duyệt, đồng thời duy trì 60 FPS ổn định cho WebGL Canvas.

3. **Tái Sử Dụng Vật Thể (Object Pooling Pattern):**
   - *Quyết định:* Khởi tạo sẵn một tập hợp vật thể 3D (20–30 thiên thạch, tinh thể, vật phẩm) trong `ObstacleManager`. Khi vật thể trôi qua đuôi tàu, thay vì hủy (`dispose`) và tạo mới (`new Mesh`), ta chỉ đặt lại tọa độ Z và trạng thái active.
   - *Lý do:* Triệt tiêu hiện tượng sụt giảm khung hình (Garbage Collection lag) do trình duyệt dọn rác bộ nhớ liên tục trong game tốc độ cao.

4. **Hệ Thống Hitbox Kép (Dual-Hitbox System):**
   - *Quyết định:* Mỗi vật cản có 2 vùng phát hiện: Bounding Box va chạm thu nhỏ 75–80% kích thước trực quan (tránh va chạm vô lý gây ức chế) và Bounding Sphere mở rộng bao quanh dùng để kích hoạt cơ chế né sát Near-Miss.
   - *Lý do:* Tạo cảm giác "lướt trong gang tấc" đã tay, khuyến khích lối chơi mạo hiểm thưởng điểm cao.

---

## 3. Sơ Đồ Phụ Thuộc Giữa Các Thành Phần (Dependency Graph)

```
HTML Shell & Three.js Importmap (`index.html`)
    │
    ├── SceneManager (Khởi tạo Scene, Perspective Camera, Ambient/Dir Lights, Resize)
    │       │
    │       ├── Environment (Cubemap MilkyWay Skybox, Starfield Particle System)
    │       │
    │       └── LaneSystem (Tọa độ 5 làn [-4, -2, 0, 2, 4], phép nội suy Lerp mượt mà)
    │               │
    │               └── PlayerShip (Nạp GLB craft_racer, hiệu ứng vệt lửa đuôi tàu, phát quang pha)
    │                       │
    │                       ├── ObstacleManager (Object Pooling: Thiên thạch, Tinh thể Băng/Cam, Vật phẩm)
    │                       │       │
    │                       │       └── CollisionSystem (AABB Hitbox, Kiểm tra Pha, Near-Miss Detection)
    │                       │               │
    │                       │               └── GameState & EventBus (Quản lý HP = 3, Score, Hyper-Drive)
    │                       │                       │
    │                       └───────────────────────┼── UIManager (Start Menu, HUD 3 HP, Game Over)
    │                                               └── AudioManager (SFX Web Audio, BGM Loop)
```

---

## 4. Danh Sách Công Việc Triển Khai Theo Lát Cắt Dọc (Vertical Slice Tasks)

### Phase 1: Nền Tảng & Lướt Không Gian (Foundation & Core Flight)

#### Task 1: Khung Ứng Dụng, Dựng Cảnh 3D & Tàu Lướt 5 Làn (Core Flight Slice)
* **Mô tả:** Thiết lập file `index.html` với cấu trúc Importmap nạp Three.js và GLTFLoader. Khởi tạo `SceneManager` với camera phối cảnh góc nhìn thứ ba theo sau tàu, tải Cubemap dải Ngân Hà từ `assets/textures/skybox/milkyway/` và hệ thống hạt sao `Starfield` lướt tạo tốc độ. Nạp mô hình tàu chiến `craft_racer.glb` từ `assets/models/Models/GLTF format/` (kèm phương án fallback khối hình đa diện sắc nét), tích hợp hệ thống 5 làn đường với phép nội suy Lerp mượt mà qua phím `A`/`D` và `Mũi tên Trái`/`Phải`.
* **Tiêu chí chấp nhận (Acceptance Criteria):**
  - [ ] Mở `index.html` qua local server hiển thị không gian vũ trụ 3D sâu thẳm, các hạt sao chuyển động về phía camera mượt mà.
  - [ ] Mô hình tàu không gian hiển thị sắc nét ở làn giữa, có bóng đổ và nguồn sáng tương phản cao.
  - [ ] Bấm phím `A`/`D` hoặc phím mũi tên khiến tàu lướt ngang mượt mà qua 5 vị trí làn cố định (`-4.0, -2.0, 0, 2.0, 4.0`), có độ nghiêng thân tàu nhẹ (bank tilt) khi chuyển làn.
  - [ ] Giao diện tự động co giãn toàn màn hình (responsive resize) khi thay đổi kích thước trình duyệt mà không méo hình.
* **Cách xác minh (Verification):**
  - Khởi chạy local server: `npx serve . -p 3000` (hoặc mở qua Live Server).
  - Mở `http://localhost:3000/index.html`, kiểm tra Console không có lỗi 404 tài nguyên.
  - Nhấn liên tục các phím điều khiển làn, quan sát độ mượt của chuyển động và camera.
* **Sự phụ thuộc (Dependencies):** Không (Khởi đầu dự án).
* **Tệp liên quan (Files touched):**
  - `index.html`
  - `src/core/EventBus.js`
  - `src/game/SceneManager.js`
  - `src/game/Environment.js`
  - `src/game/LaneSystem.js`
  - `src/game/PlayerShip.js`
* **Độ phức tạp (Estimated Scope):** Medium (4–5 files).

#### Task 2: Cơ Chế Chuyển Pha Năng Lượng & Phản Hồi Thị Giác (Phase Shift Slice)
* **Mô tả:** Triển khai cơ chế cốt lõi "Chuyển pha năng lượng" cho phi thuyền. Nhấn phím `Cách (Space)` hoặc Click chuột trái để đảo trạng thái giữa **Pha Băng (Cyan `#00F5FF`)** và **Pha Lửa (Cam `#FF7700`)**. Cập nhật màu phát quang (`emissive`) trên thân tàu và vệt lửa động cơ phản lực (từ texture `assets/textures/particles/PNG (Transparent)/flame_01.png`). Tích hợp widget hiển thị Pha hiện tại từ `preview_ui.html` lên HUD đè trên Canvas. Có thời gian hồi đổi pha (cooldown 150ms) chống spam phím.
* **Tiêu chí chấp nhận (Acceptance Criteria):**
  - [ ] Nhấn phím `Space` hoặc click chuột đổi ngay lập tức trạng thái năng lượng giữa Cyan và Orange.
  - [ ] Thân tàu đổi ánh sáng phát quang tương ứng; lửa động cơ phản lực đuôi tàu đổi màu Cyan/Cam rực rỡ.
  - [ ] Lớp HUD hiển thị nhãn Pha hiện tại (PHASE 01 // CRYO-CYAN ↔ PHASE 02 // THERMO-ORANGE) đồng bộ tức thì.
  - [ ] Cooldown 150ms ngăn việc đổi pha liên tục quá nhanh gây nhiễu khung hình.
* **Cách xác minh (Verification):**
  - Nhấn phím Space nhịp nhàng và quan sát thân tàu cùng widget HUD đổi màu đồng thời.
  - Nhấn phím Space siêu tốc để xác nhận cooldown chặn spam thành công.
* **Sự phụ thuộc (Dependencies):** Task 1.
* **Tệp liên quan (Files touched):**
  - `src/game/PlayerShip.js`
  - `src/ui/UIManager.js`
  - `index.html`
* **Độ phức tạp (Estimated Scope):** Small (2–3 files).

---

### Checkpoint 1: Nền Tảng & Điều Khiển Không Gian Hoàn Chỉnh
- [ ] Mở trình duyệt thấy không gian vũ trụ MilkyWay và dải hạt sao lướt tốc độ.
- [ ] Tàu lướt 5 làn đường mượt mà, phản hồi phím nhạy bén.
- [ ] Cơ chế đổi pha Space hoạt động trơn tru kèm hiệu ứng phát sáng thân tàu và thanh HUD.
- [ ] Console hoàn toàn sạch lỗi.

---

### Phase 2: Vòng Lặp Sinh Tồn & Năng Lượng (Core Gameplay Loop)

#### Task 3: Sinh Vật Cản Thiên Thạch & Vòng Lặp Máu / Game Over (Survival Loop Slice)
* **Mô tả:** Xây dựng `ObstacleManager` sử dụng kỹ thuật Object Pooling nạp các khối thiên thạch `meteor_detailed.glb` (có tự xoay ngẫu nhiên). Thiên thạch xuất hiện ngẫu nhiên ở 5 làn và cuộn dọc trục Z về phía tàu với tốc độ cơ bản tăng dần. Xây dựng `CollisionSystem` tính toán va chạm theo AABB thu nhỏ 75%: Khi đâm thiên thạch, tàu mất 1 điểm bền (HP), nhấp nháy bất tử tạm thời 1.5s, camera rung nhẹ (camera shake). Tích hợp HUD hiển thị 3 trái tim (3 HP); khi HP = 0, hiển thị màn hình Game Over từ `preview_ui.html` kèm nút "Chơi lại" để reset trạng thái.
* **Tiêu chí chấp nhận (Acceptance Criteria):**
  - [ ] Thiên thạch đá xuất hiện ngẫu nhiên trên các làn đường, trôi về phía tàu và tái sử dụng khi đi qua camera (không rò rỉ bộ nhớ).
  - [ ] Khi tàu đâm vào thiên thạch: Mất đúng 1 điểm bền, trái tim trên HUD đổi sang trạng thái vỡ, màn hình chớp đỏ và camera rung phản hồi.
  - [ ] Tàu có trạng thái nhấp nháy bất tử trong 1.5 giây sau khi bị đâm để không bị mất máu liên tiếp.
  - [ ] Khi mất hết 3 HP: Trò chơi chuyển sang trạng thái Game Over, hiển thị màn hình kết thúc với nút "CHƠI LẠI".
  - [ ] Bấm nút "CHƠI LẠI" hồi phục 3 HP, đưa tàu về làn giữa và tiếp tục chơi ngay mà không cần reload trang.
* **Cách xác minh (Verification):**
  - Lướt tàu đâm thử vào thiên thạch để kiểm tra trừ máu, hiệu ứng rung và thời gian bất tử.
  - Để tàu đâm 3 lần, kiểm tra màn hình Game Over xuất hiện và bấm Chơi lại để xác nhận reset hoạt động sạch sẽ.
* **Sự phụ thuộc (Dependencies):** Task 1, Task 2.
* **Tệp liên quan (Files touched):**
  - `src/core/GameState.js`
  - `src/game/ObstacleManager.js`
  - `src/game/CollisionSystem.js`
  - `src/ui/UIManager.js`
* **Độ phức tạp (Estimated Scope):** Medium (4 files).

#### Task 4: Tinh Thể Năng Lượng & Hệ Thống Điểm Số (Energy Crystals & Scoring Slice)
* **Mô tả:** Mở rộng `ObstacleManager` để sinh các Tinh thể năng lượng dạng hình học phát sáng (Icosahedron): Tinh thể Băng (Cyan `#00F5FF`) và Tinh thể Lửa (Cam `#FF7700`). Cập nhật `CollisionSystem` để xử lý logic tương tác pha:
  - Nếu tàu chạm tinh thể **cùng pha**: Hấp thụ tinh thể, cộng $+100$ điểm, nạp $+8\%$ vào thanh Hyper-Drive, phát hiệu ứng hạt nổ sáng.
  - Nếu tàu chạm tinh thể **khác pha**: Xem như va phải vật cản, mất $1$ HP và kích hoạt rung camera.
  - Điểm số tự động tăng theo thời gian sống sót $+10$ điểm/giây. HUD hiển thị điểm số nhảy số mượt mà và thanh Hyper-Drive nạp dần.
* **Tiêu chí chấp nhận (Acceptance Criteria):**
  - [ ] Tinh thể Cyan và Cam xuất hiện xen kẽ với thiên thạch trên 5 làn đường.
  - [ ] Đâm đúng màu pha: Nhận $+100$ điểm, thanh Hyper-Drive tăng $8\%$, tinh thể biến mất kèm hiệu ứng hạt lóe sáng.
  - [ ] Đâm sai màu pha: Bị trừ $1$ HP như đâm thiên thạch, kích hoạt chớp nháy bất tử.
  - [ ] Điểm số tăng liên tục theo thời gian và hiển thị chuẩn định dạng trên HUD (ví dụ: `012,450 PTS`).
* **Cách xác minh (Verification):**
  - Đổi pha để ăn tinh thể cùng màu và kiểm tra điểm số + thanh Hyper-Drive tăng.
  - Cố tình đâm vào tinh thể khác màu để kiểm tra trừ máu chính xác.
* **Sự phụ thuộc (Dependencies):** Task 2, Task 3.
* **Tệp liên quan (Files touched):**
  - `src/game/ObstacleManager.js`
  - `src/game/CollisionSystem.js`
  - `src/core/GameState.js`
  - `src/ui/UIManager.js`
* **Độ phức tạp (Estimated Scope):** Medium (4 files).

---

### Checkpoint 2: Vòng Lặp Gameplay Hoàn Chỉnh (Playable Loop)
- [ ] Thiên thạch và 2 loại tinh thể xuất hiện nhịp nhàng trên đường đua.
- [ ] Cơ chế ăn đúng pha / phạt sai pha hoạt động chuẩn xác 100%.
- [ ] Máu, điểm và thanh Hyper-Drive cập nhật trơn tru trên HUD.
- [ ] Vòng đời game (Chơi $\to$ Mất máu $\to$ Game Over $\to$ Chơi lại) vận hành mượt mà không lỗi.

---

### Phase 3: Cơ Chế Sáng Tạo & Đỉnh Cao (Reflex & Special Abilities)

#### Task 5: Rủi Ro / Phần Thưởng: Né Sát (Near-Miss) & Siêu Tốc (Hyper-Drive Slice)
* **Mô tả:** Triển khai cơ chế thưởng phản xạ cao:
  - **Né Sát (Near-Miss Evasion):** Khi tàu lướt qua thiên thạch ở làn liền kề với khoảng cách hẹp mà không va chạm, ghi nhận 1 pha Né Sát: Thưởng $+250$ điểm, $+15\%$ nạp Hyper-Drive và hiện popup toast `⚡ NEAR-MISS EVASION +250 PTS` (từ thiết kế `preview_ui.html`) bay lên rồi mờ dần.
  - **Chế Độ Hyper-Drive:** Khi thanh năng lượng đạt $100\%$, kích hoạt trạng thái Hyper-Drive trong $6$ giây: Tốc độ thế giới tăng $1.8\times$, màn hình hiển thị hiệu ứng vệt sáng speed lines, tàu được bọc khiên vô địch phá hủy mọi thiên thạch khi chạm và tự động hút toàn bộ tinh thể năng lượng trên đường bay (hiệu ứng từ trường).
* **Tiêu chí chấp nhận (Acceptance Criteria):**
  - [ ] Bay sát mép thiên thạch ở làn kề bên kích hoạt thông báo Near-Miss toast mượt mà, cộng điểm và nạp thanh Hyper-Drive.
  - [ ] Thanh Hyper-Drive đầy $100\%$ kích hoạt trạng thái siêu tốc $6$ giây: Tốc độ tăng vọt, camera hơi lùi xa tạo cảm giác gia tốc.
  - [ ] Trong Hyper-Drive: Tàu chạm thiên thạch sẽ làm nổ tung thiên thạch mà không mất máu; tinh thể tự động bay hút về phía tàu.
  - [ ] Hết $6$ giây, tốc độ trở lại bình thường và thanh Hyper-Drive trở về $0\%$.
* **Cách xác minh (Verification):**
  - Cố tình lướt sát thiên thạch để kiểm tra popup toast Near-Miss xuất hiện và biến mất sau 1.5s.
  - Nạp đầy thanh Hyper-Drive để kiểm chứng tốc độ tăng, hút tinh thể và khiên vô địch.
* **Sự phụ thuộc (Dependencies):** Task 3, Task 4.
* **Tệp liên quan (Files touched):**
  - `src/game/CollisionSystem.js`
  - `src/game/ObstacleManager.js`
  - `src/game/PlayerShip.js`
  - `src/game/SceneManager.js`
  - `src/ui/UIManager.js`
* **Độ phức tạp (Estimated Scope):** Medium (4–5 files).

#### Task 6: Vật Phẩm Phụ & Tích Hợp Hệ Thống Âm Thanh (Pickups & Audio Slice)
* **Mô tả:** 
  - **Vật phẩm phụ:** Thêm Lõi Sửa Chữa (Repair Core - hình khối phát sáng xanh lục `#00F5A0`, tỉ lệ xuất hiện $5\%$, ăn được hồi $+1$ HP tối đa 3) và Mảnh Cộng Hưởng (Resonance Shard - hình sao vàng `#FFD23F`, tỉ lệ $5\%$, nhân đôi điểm $\times 2$ trong $8$ giây kèm viền vàng kim trên HUD).
  - **Hệ thống âm thanh Web Audio:** Xây dựng `AudioManager` quản lý âm thanh tương thích với chính sách Autoplay của trình duyệt. Nạp các tệp SFX từ `assets/audio/sci-fi/Audio/` (đổi pha `forceField_000.ogg`, ăn điểm `laserRetro_004.ogg`, va chạm `explosionCrunch_000.ogg`, nhặt hồi máu `confirmation_001.ogg`) và nhạc nền vòng lặp `laserpack_bgm.mp3`. Thêm nút Mute/Unmute trên HUD.
* **Tiêu chí chấp nhận (Acceptance Criteria):**
  - [ ] Nhặt Lõi Sửa Chữa khi mất máu hồi lại 1 trái tim trên HUD.
  - [ ] Nhặt Mảnh Cộng Hưởng kích hoạt hiệu ứng nhân đôi điểm trong 8 giây có thanh đếm ngược trên HUD.
  - [ ] Âm thanh SFX phát đúng lúc cho mọi hành động: Đổi pha, ăn tinh thể, va chạm nổ, mất máu.
  - [ ] Nhạc nền BGM lặp lại êm ái, có nút bật/tắt âm thanh trên HUD hoạt động chính xác.
* **Cách xác minh (Verification):**
  - Nhặt thử 2 loại vật phẩm đặc biệt và kiểm tra trạng thái hồi máu / nhân đôi điểm.
  - Bật loa, kiểm tra từng âm thanh phát ra không bị rè hoặc trễ tiếng. Bấm nút Mute để kiểm tra tắt tiếng tức thì.
* **Sự phụ thuộc (Dependencies):** Task 4, Task 5.
* **Tệp liên quan (Files touched):**
  - `src/game/ObstacleManager.js`
  - `src/game/CollisionSystem.js`
  - `src/audio/AudioManager.js`
  - `src/ui/UIManager.js`
* **Độ phức tạp (Estimated Scope):** Medium (4 files).

---

### Checkpoint 3: Tính Năng Gameplay Đầy Đủ & Trải Nghiệm Âm Thanh
- [ ] Near-Miss toast và Hyper-Drive hoạt động hoàn hảo tạo cảm giác hưng phấn cao độ.
- [ ] Có đầy đủ vật phẩm hồi phục và nhân đôi điểm.
- [ ] Âm thanh SFX và BGM hòa quyện với nhịp độ chơi.
- [ ] Không có lỗi suy giảm hiệu năng.

---

### Phase 4: Hoàn Thiện, Trình Diễn & Đóng Gói (Polish & Packaging)

#### Task 7: Tích Hợp Start Screen, Lưu Kỷ Lục & Đóng Gói Nộp Bài (Final Polish Slice)
* **Mô tả:** Ghép nối màn hình Start Screen đầy đủ từ `preview_ui.html` (gồm logo Neo-Arcade rực rỡ, các thẻ hướng dẫn cách chơi và nút "BẮT ĐẦU VẬN HÀNH" khởi tạo Audio Context). Tích hợp `localStorage` để lưu kỷ lục điểm cao (High Score). Bổ sung điều khiển cảm ứng/vuốt (Swipe / Tap) hỗ trợ thiết bị màn hình cảm ứng. Cân chỉnh thông số tốc độ tăng dần theo thời gian đảm bảo ván chơi kéo dài hấp dẫn từ 1–3 phút. Viết tài liệu `README.md` hướng dẫn chạy 1-click cho Ban giám khảo IT Game Jam 2026.
* **Tiêu chí chấp nhận (Acceptance Criteria):**
  - [ ] Mở game hiển thị màn hình Start Menu đẹp mắt đúng 100% bản duyệt `preview_ui.html`.
  - [ ] Bấm "BẮT ĐẦU" phát nhạc nền và chuyển mượt mà vào cảnh 3D mà không bị giật khung hình.
  - [ ] Điểm kỷ lục được lưu trong `localStorage` và hiển thị trên cả màn hình Start, HUD và Game Over.
  - [ ] Tốc độ cuộn và mật độ chướng ngại vật tăng mượt mà theo thời gian sinh tồn.
  - [ ] File `README.md` cung cấp đầy đủ thông tin giới thiệu, phím bấm, hướng dẫn chạy máy chủ tĩnh nhanh.
* **Cách xác minh (Verification):**
  - Chơi thử một vòng hoàn chỉnh: Start $\to$ Chơi đạt điểm cao $\to$ Game Over $\to$ Tải lại trang kiểm tra High Score có được lưu giữ.
  - Kiểm tra FPS duy trì ở mức 60 FPS trong suốt quá trình chơi.
* **Sự phụ thuộc (Dependencies):** Tất cả các Task trước đó (Tasks 1–6).
* **Tệp liên quan (Files touched):**
  - `index.html`
  - `src/ui/UIManager.js`
  - `src/core/GameState.js`
  - `README.md`
* **Độ phức tạp (Estimated Scope):** Medium (3–4 files).

---

### Checkpoint 4: Nghiệm Thu Sản Phẩm Cuối Cùng (Final Acceptance)
- [ ] Toàn bộ 7 tiêu chí nghiệm thu trong `SPEC_VOID_SHIFT_3D.md` được thỏa mãn 100%.
- [ ] Đạt chuẩn thẩm mỹ Neo-Arcade Cosmic không có "mùi AI".
- [ ] Trò chơi sẵn sàng nộp bài và trình chiếu trực tiếp trước Ban giám khảo.

---

## 5. Đánh Giá Rủi Ro Kỹ Thuật & Biện Pháp Giảm Thiểu (Risks & Mitigations)

| Rủi ro kỹ thuật | Mức độ | Biện pháp giảm thiểu |
| :--- | :--- | :--- |
| **Trình duyệt chặn CORS khi nạp file GLB / Texture** | Cao | Sử dụng máy chủ tĩnh tiêu chuẩn (`npx serve . -p 3000` hoặc Live Server). Đồng thời trong code chuẩn bị sẵn bộ Procedural Low-Poly fallback (dựng tàu bằng khối `ConeGeometry` + `BoxGeometry`) nếu tải file 3D thất bại. |
| **Tụt FPS do rác bộ nhớ (Garbage Collection)** | Trung bình | Áp dụng triệt để Object Pooling cho toàn bộ thiên thạch và tinh thể; tái sử dụng vật thể thay vì tạo và hủy liên tục. |
| **Trình duyệt chặn Autoplay Audio** | Trung bình | Gắn lệnh khởi tạo `AudioContext` vào sự kiện click nút "BẮT ĐẦU VẬN HÀNH" trên màn hình Start Menu. |
| **Va chạm gây ức chế do kích thước hitbox** | Thấp | Hitbox va chạm thu nhỏ 75–80% so với mesh trực quan; vùng né sát Near-Miss mở rộng để người chơi dễ kích hoạt combo. |

---

## 6. Câu Hỏi Cần Xác Nhận Với Người Dùng (Open Questions)
1. Bạn có muốn kích hoạt Hyper-Drive **tự động ngay khi đầy 100%**, hay người chơi cần **bấm phím E / F** để chủ động chọn thời điểm kích hoạt? (Đề xuất: Tự động kích hoạt khi đầy để tối ưu nhịp độ arcade dồn dập).
2. Khi chơi trên điện thoại / máy tính bảng, cơ chế điều khiển ưu tiên là **chạm 2 bên màn hình (Tap Left/Right)** hay **vuốt ngang (Swipe)**? (Đề xuất: Hỗ trợ cả 2 để thuận tiện nhất).
