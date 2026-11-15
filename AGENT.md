# HƯỚNG DẪN DÀNH CHO AGENT (AGENT.MD) - PHÁT TRIỂN GAME 2D & 3D

Tài liệu này là bộ quy chuẩn và chỉ dẫn hành động bắt buộc dành cho mọi Trợ lý AI (Agent) khi tham gia lập trình, thiết kế kiến trúc, sửa lỗi và tối ưu hóa dự án game (hỗ trợ cả **2D Phaser** và **3D Three.js**).

---

## 1. TỔNG QUAN DỰ ÁN & TECH STACK

- **Môi trường & Bundler:** Vite (ES Modules), Node.js.
- **Engine 2D:** Phaser (Phiên bản v4.x - cấu hình tại `src/engine/phaser-game.js`).
- **Engine 3D:** Three.js (Phiên bản 0.187.x / WebGL & WebGPU).
- **Framework Kiểm thử:** Vitest (`npm run test`).
- **Kho Tri Thức & Kỹ Năng:** Toàn bộ hướng dẫn chuyên sâu nằm tại thư mục `.agents/skills/`.
- **Ngôn ngữ phản hồi & ghi chú:** Bắt buộc sử dụng **Tiếng Việt**.

---

## 2. NGUYÊN TẮC CỐT LÕI (CORE PRINCIPLES)

1. **Tách biệt Logic và Đồ họa (Decoupled Architecture):**
   - Không nhồi nhét toàn bộ logic vào vòng lặp `update()` của Scene.
   - Tách biệt logic trạng thái game (Game State / Business Logic) thành các class hoặc module thuần JS/TS để dễ dàng viết Unit Test độc lập với Canvas/WebGL.
2. **Khắc phục lỗi thời của AI (No Deprecated APIs):**
   - **Phaser:** Tuân thủ chuẩn Phaser 4 (sử dụng RenderNodes, Filters, không dùng cú pháp cũ của Phaser 2/3 đã bị loại bỏ).
   - **Three.js:** Tuyệt đối không dùng `Geometry` (phải dùng `BufferGeometry`), luôn cấu hình `SRGBColorSpace`, bật `ACESFilmicToneMapping` để tránh hiện tượng màu sắc bị rửa trôi (washed-out).
3. **Phòng chống tràn bộ nhớ (Zero Memory Leaks):**
   - Mọi Texture, Sound, Mesh, Geometry, Filter và Event Listener khi khởi tạo đều phải có phương thức hủy (`destroy()`, `dispose()`, `off()`) khi chuyển Scene hoặc dọn dẹp game.

---

## 3. QUY CHUẨN PHÁT TRIỂN GAME 2D (PHASER 4)

Khi thực hiện các tác vụ liên quan đến 2D, Agent phải kích hoạt và tham chiếu các skill tương ứng trong thư mục `.agents/skills/`:

### A. Vòng đời Scene & Quản lý trạng thái
- **Khai báo chuẩn:** Mỗi màn chơi hoặc giao diện là một Scene kế thừa `Phaser.Scene`.
- **Thứ tự thực thi:** `init(data)` -> `preload()` -> `create()` -> `update(time, delta)`.
- **Đa Scene song song:** Tách riêng `GameScene` (chứa gameplay) và `UIScene` (chứa máu, điểm số, HUD) chạy đè lên nhau.
- *Tham khảo skill:* `scenes`, `game-setup-and-config`, `data-manager`.

### B. Vật lý, Va chạm & Điều khiển (Physics & Controls)
- Ưu tiên sử dụng **Arcade Physics** (`this.physics.add`) cho các game tốc độ cao, va chạm hình chữ nhật/hình tròn nhẹ nhàng.
- Chỉ dùng **Matter.js Physics** khi game đòi hỏi tính toán vật lý phức tạp (khớp nối, cơ học vật rắn đa giác).
- Luôn nhân tốc độ di chuyển với `delta` time hoặc dùng vận tốc chuẩn của hệ vật lý để đảm bảo game chạy đồng đều trên màn hình 60Hz lẫn 144Hz.
- *Tham khảo skill:* `physics-arcade`, `physics-matter`, `input-keyboard-mouse-touch`.

### C. Đồ họa, Animation & Hiệu ứng 2D
- Tổ chức tài nguyên đồ họa bằng Spritesheet hoặc Texture Atlas.
- Tạo hiệu ứng nổ, đạn bay, ánh sáng dạ quang bằng hệ thống hạt (Particles) thay vì sinh quá nhiều Sprite thủ công.
- Sử dụng Tweens để tạo chuyển động UI mượt mà, đàn hồi.
- *Tham khảo skill:* `sprites-and-images`, `animations`, `particles`, `tweens`, `filters-and-postfx`.

---

## 4. QUY CHUẨN PHÁT TRIỂN GAME 3D (THREE.JS & WEBGPU)

Khi làm việc với các thành phần 3D, Agent phải áp dụng các tiêu chuẩn chất lượng hình ảnh cao cấp:

### A. Thiết lập Renderer & Ánh sáng Chuẩn Studio
```javascript
// Thiết lập chuẩn không gian màu và ánh sáng
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
```
- Phối hợp ánh sáng theo quy tắc 3 điểm: Key Light (đèn chính đổ bóng), Fill Light (đèn phụ làm mềm bóng) và Ambient/Hemisphere Light (ánh sáng môi trường).
- *Tham khảo skill:* `threejs-exposure-color-grading`, `threejs-shadow-systems`, `threejs-bloom`.

### B. Camera & Điều khiển 3D
- Quản lý góc nhìn người chơi mượt mà (Third-Person Chase Cam, First-Person hoặc Isometric).
- Xử lý chuyển động camera có độ trễ mượt (damped/interpolated motion) thay vì gắn cứng (hard-attachment) vào nhân vật.
- *Tham khảo skill:* `threejs-camera-direction`.

### C. Tối ưu Hiệu năng 3D (Performance Guardrails)
- Khi hiển thị số lượng lớn vật thể cùng loại (cây cối, đạn, quái vật), bắt buộc sử dụng `THREE.InstancedMesh`.
- Giới hạn kích thước texture (tối đa 2K cho web) và luôn bật mipmap.
- Khi xóa vật thể khỏi Scene, bắt buộc dọn dẹp tài nguyên GPU:
  ```javascript
  mesh.geometry.dispose();
  if (Array.isArray(mesh.material)) {
    mesh.material.forEach(m => m.dispose());
  } else {
    mesh.material.dispose();
  }
  ```
- *Tham khảo skill:* `threejs-procedural-vfx`, `threejs-water-optics`, `threejs-visual-validation`.

---

## 5. KIẾN TRÚC KẾT HỢP HYBRID 2D + 3D (NẾU CẦN)

Nếu dự án kết hợp cả 2 nền tảng trong cùng một game:
1. **Mô hình Layered Canvas:**
   - **Canvas 3D (Three.js):** Nằm ở lớp dưới cùng (`z-index: 1`), hiển thị nền không gian 3D, biển nước hoặc hiệu ứng khí quyển.
   - **Canvas 2D (Phaser):** Nằm ở lớp trên (`z-index: 2`, cấu hình `transparent: true`), hiển thị gameplay 2D, nhân vật pixel, UI và HUD.
2. **Đồng bộ Tọa độ:** Sử dụng phép chiếu `Vector3.project(camera)` để ánh xạ vị trí từ không gian 3D lên tọa độ màn hình 2D của Phaser.

---

## 6. QUY TRÌNH LÀM VIỆC CỦA AGENT KHI NHẬN TÁC VỤ

Mỗi khi người dùng đưa ra một yêu cầu mới, Agent phải thực hiện theo quy trình:

1. **Phân tích Phạm vi:** Xác định tác vụ thuộc 2D, 3D, Logic nghiệp vụ hay Cấu trúc hệ thống.
2. **Kích hoạt Kỹ năng:** Tra cứu và đọc tài liệu tương ứng trong `.agents/skills/`.
3. **Triển khai Từng bước (Incremental Implementation):**
   - Viết code sạch, module hóa, có chú thích rõ ràng bằng Tiếng Việt.
   - Đảm bảo không làm hỏng các tính năng cũ đang chạy tốt.
4. **Kiểm tra & Rà soát:**
   - Chạy lệnh test (`npm run test`) nếu có thay đổi logic.
   - Đảm bảo cú pháp tương thích với bundler Vite hiện tại.

---

## 7. ĐỊNH HƯỚNG CÔNG NGHỆ: NEXT.JS, VITE, REACT & HTML THUẦN

Khi tư vấn hoặc thiết kế kiến trúc Web Game, Agent tuân thủ các định hướng sau:

### A. So sánh các lựa chọn nền tảng
* **Vite + Vanilla JS / TS (hoặc HTML thuần có Bundler):**
  * **Lựa chọn tối ưu nhất** cho game thuần túy (mini-game, game arcade 2D Phaser, 3D Three.js).
  * Khởi động nhanh, bundle siêu nhẹ, không gánh overhead của framework UI, dễ đóng gói lên các nền tảng web game (itch.io, Poki, CrazyGames) hoặc mobile.
* **Vite + React:**
  * Lựa chọn hoàn hảo khi game có hệ thống giao diện phức tạp (Túi đồ, Shop, Cài đặt, Khung chat, Quản lý tài khoản) hoặc làm game 3D với **React Three Fiber (R3F)**.
* **Next.js:**
  * **Không dùng cho phần lõi render game**, vì engine game chạy 100% ở Client (Canvas/WebGL), SSR của Next.js không có tác dụng và còn dễ gây lỗi thiếu đối tượng `window`/`document`.
  * **Chỉ dùng khi dự án là Cổng thông tin (Web Portal) game lớn**: Cần SEO trang chủ, blog tin tức, hệ thống Auth/Thanh toán, API backend lưu điểm/leaderboard. Khi đó, game chỉ là một component Canvas client-only (`'use client'` hoặc `dynamic import` với `ssr: false`) nhúng bên trong.

### B. Kiến trúc chuẩn khi tích hợp React với Game Engine
1. **Mô hình Phân tách (UI Overlay + Canvas Gameplay):**
   * **Canvas / WebGL (Phaser / Three.js):** Đảm nhiệm 100% vòng lặp game (`update`), đồ họa, va chạm, vật lý ở 60 FPS.
   * **React (DOM / HTML / Tailwind):** Nằm ở lớp đè phía trên (`pointer-events: none` cho nền, `pointer-events: auto` cho nút bấm/menu) để hiển thị HUD, Menu Pause, Inventory, Dialog.
2. **Nguyên tắc State sống còn:**
   * **Tuyệt đối không dùng `useState` cho vòng lặp game:** Không lưu tọa độ `(x, y)` hay vận tốc nhân vật vào React state mỗi khung hình (16ms) vì sẽ kích hoạt re-render 60 lần/giây gây sập FPS.
   * **Tách biệt State:** Tọa độ, chuyển động giữ trong Engine/Canvas hoặc `useRef`. Chỉ bắn sự kiện cập nhật React State khi có thay đổi trạng thái gián đoạn (mất máu, nhặt vật phẩm, chuyển màn, thắng/thua).
3. **Khi nào làm game hoàn toàn bằng React DOM (dùng `<div>`):**
   * Chỉ phù hợp với game thẻ bài (Card games), cờ (Chess, Caro), giải đố theo lượt (2048, Sudoku, Wordle), tiểu thuyết tương tác (Visual Novel). Không dùng cho game hành động hoặc game cần vật lý liên tục.


