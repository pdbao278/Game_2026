# VOID SHIFT 3D — Chuyển Pha Không Gian

> **Dự án tham dự cuộc thi IT Game Jam 2026 // With AI**  
> **Thể loại:** Endless Runner 3D / Neo-Arcade Cosmic Sci-Fi  
> **Công nghệ:** HTML5, CSS3, JavaScript ES Modules, Three.js (WebGL 3D), Web Audio API, Node.js Test Runner.

---

## 🚀 Giới Thiệu Trò Chơi

**VOID SHIFT 3D** đưa người chơi vào vai phi công điều khiển phi thuyền thám hiểm xuyên qua dải ngân hà MilkyWay huyền ảo. Để sinh tồn giữa cơn mưa thiên thạch dày đặc, người chơi phải vận dụng kỹ năng phản xạ đỉnh cao để đổi pha năng lượng giữa **Pha Băng (Cryo-Cyan `#00F5FF`)** và **Pha Lửa (Thermo-Orange `#FF7700`)**, hấp thụ các tinh thể cùng màu và né sát các khối thiên thạch vũ trụ.

---

## 🎮 Cơ Chế Gameplay (Core Mechanics)

1. **Lướt Làn Cơ Động (Lane System):**
   * Hỗ trợ 2 chế độ: **3 Làn đường trung tâm** (gọn gàng, dễ quan sát) và **5 Làn đường rộng rãi** (thử thách cực độ).
   * Chuyển đổi nhanh qua phím `L` hoặc nút bấm trên thanh công cụ nổi.

2. **Chuyển Pha Năng Lượng (Phase Shift):**
   * Đổi qua lại giữa pha **CYAN** và **ORANGE** tức thì bằng phím `Space` hoặc chạm chuột.
   * **Ăn đúng pha:** Nhận $+100$ điểm, nạp $+8\%$ vào thanh Hyper-Drive, bung tỏa hạt nổ sáng rực rỡ.
   * **Đâm sai pha / Đâm thiên thạch:** Trừ 1 điểm sinh lực (HP), màn hình chớp đỏ cảnh báo và kích hoạt bất tử tạm thời 1.5 giây.

3. **Né Sát Gang Tấc (Near-Miss Evasion):**
   * Lướt sát mép thiên thạch ở làn liền kề mà không va chạm để nhận thưởng phản xạ: $+250$ điểm, $+15\%$ nạp năng lượng và xuất hiện popup `⚡ NEAR-MISS EVASION`.

4. **Siêu Tốc Hyper-Drive (100% Charge):**
   * Khi thanh năng lượng đạt $100\%$, tự động bứt tốc $1.8\times$ trong 6 giây.
   * Góc nhìn Camera lùi xa (`FOV: 78°`), vệt sáng **Speed Lines** rực rỡ, bọc khiên vô địch phá tan mọi thiên thạch và từ trường tự động hút toàn bộ tinh thể trên đường bay.

5. **Vật Phẩm Phụ Đặc Biệt (Pickups):**
   * **Lõi Sửa Chữa (Repair Core - Xanh lục):** Hồi phục $+1$ HP (tối đa 3 HP).
   * **Mảnh Cộng Hưởng (Resonance Shard - Vàng kim):** Kích hoạt nhân đôi điểm số ($\times 2$) trong 8 giây với viền hào quang vàng kim trên HUD.

6. **Hệ Thống Âm Thanh (Audio Manager):**
   * Bộ hiệu ứng âm thanh SFX hoàn chỉnh tương thích chính sách Autoplay.
   * Nhạc nền BGM vũ trụ điện tử sống động kèm nút **Bật/Tắt âm thanh (Mute/Unmute 🔊/🔇)** trên HUD.

7. **Lưu Trữ Kỷ Lục (High Score):**
   * Tự động lưu điểm cao nhất vào trình duyệt qua `localStorage` và hiển thị trên mọi màn hình.

---

## ⌨️ Phím Tắt Điều Khiển

| Thao Tác | Phím Bàn Phím | Chuột & Cảm Ứng (Touch) |
| :--- | :--- | :--- |
| **Lướt Làn Trái** | `A` hoặc `Mũi tên Trái` | Click chuột nửa trái màn hình / Vuốt sang trái (Swipe Left) |
| **Lướt Làn Phải** | `D` hoặc `Mũi tên Phải` | Click chuột nửa phải màn hình / Vuốt sang phải (Swipe Right) |
| **Đổi Pha Năng Lượng** | `Space` (Phím Cách) hoặc `Enter` | Click chuột vào giữa màn hình hoặc chạm vào tàu |
| **Đổi 3 Làn / 5 Làn** | Phím `L` | Bấm nút `🛣️ Làn (Phím L)` góc trên bên phải |
| **Bật / Tắt Âm Thanh** | Phím tắt trên thanh Toolbar | Bấm nút `🔊 Âm Thanh` góc trên bên phải |
| **Bắt Đầu / Chơi Lại** | Nút bấm giao diện | Chạm / Click vào nút `BẮT ĐẦU` hoặc `CHƠI LẠI NGAY` |

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Game

Game được thiết kế thuần chuẩn **Zero-Dependency** cho client-side, chạy mượt mà trên mọi trình duyệt hiện đại (Chrome, Edge, Firefox, Safari).

### Cách 1: Chạy Nhanh Trực Tiếp (1-Click)
Mở trực tiếp tệp `index.html` bằng trình duyệt web của bạn.

### Cách 2: Chạy Qua Máy Chủ Web Tĩnh (Khuyên dùng)
Để đảm bảo Three.js load toàn bộ GLTF Model và Cubemap Skybox qua HTTP giao thức chuẩn:

```bash
# Sử dụng Node.js (npx serve)
npx serve .

# Hoặc sử dụng Python 3
python -m http.server 8080
```
Sau đó truy cập: `http://localhost:3000` (hoặc `http://localhost:8080`).

---

## 🧪 Hướng Dẫn Chạy Bộ Kiểm Thử (Automated Test Suite)

Dự án áp dụng phương pháp **Test-Driven Development (TDD)** với bộ kiểm thử tự động tích hợp sẵn của Node.js:

```bash
# Chạy toàn bộ 60+ kiểm thử tự động
node --test tests/*.test.js
```

### Kết Quả Kiểm Thử:
* **Tổng số test:** 60+ unit và integration tests.
* **Tỷ lệ vượt qua:** 100% Passed (0 lỗi, 0 cảnh báo).
* **Thời gian thực thi:** < 500ms.

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
ITGAME/
├── assets/                     # Tài nguyên hình ảnh, mô hình 3D, âm thanh
│   ├── audio/                  # Nhạc nền BGM và bộ hiệu ứng SFX
│   ├── models/                 # Model 3D GLTF (.glb)
│   └── textures/               # Cubemap MilkyWay, vệt lửa phản lực
├── asset_new/                  # Asset UI, tinh thể và phi thuyền
├── docs/                       # Tài liệu đặc tả kỹ thuật
├── src/                        # Mã nguồn ứng dụng
│   ├── audio/                  # AudioManager quản lý âm thanh
│   ├── core/                   # EventBus, GameState, InputManager
│   ├── game/                   # CollisionSystem, ObstacleManager, SceneManager, PlayerShip
│   └── ui/                     # UIManager điều khiển HUD và hiệu ứng FX
├── tasks/                      # Kế hoạch chi tiết (plan.md, todo.md)
├── tests/                      # Bộ kiểm thử tự động theo chuẩn TDD
├── index.html                  # Giao diện chính của game
└── README.md                   # Tài liệu hướng dẫn nộp bài
```

---

## 🏆 Đơn Vị & Tác Giả Tham Gia
* **Cuộc thi:** IT Game Jam 2026 // With AI
* **Tác giả:** Đội ngũ phát triển VOID SHIFT 3D
* **Bản quyền:** Mã nguồn và tài nguyên được cung cấp theo giấy phép mở dành cho mục đích giáo dục và thi đấu.
