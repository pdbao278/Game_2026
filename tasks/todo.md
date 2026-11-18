# Danh Sách Công Việc Cần Làm: VOID SHIFT 3D (Checklist)

Tài liệu theo dõi tiến độ chi tiết theo Kế hoạch Triển khai Kỹ thuật tại [plan.md](file:///e:/ITGAME/tasks/plan.md).

---

## Phase 1: Nền Tảng & Lướt Không Gian (Foundation & Core Flight)

- [x] **Task 1: Khung Ứng Dụng, Dựng Cảnh 3D & Tàu Lướt 5 Làn (Core Flight Slice)**
  - *Mô tả:* Tạo `index.html` với Three.js Importmap, `SceneManager`, Skybox MilkyWay, Starfield và `PlayerShip` (nạp `craft_racer.glb`) lướt 5 làn qua phím A/D/mũi tên.
  - *Sự phụ thuộc:* Không (Bắt đầu)
  - *Trạng thái:* Đã hoàn thành (100% unit tests passed)
  - *Tiêu chí hoàn thành:*
    - [x] Canvas toàn màn hình hiển thị không gian MilkyWay và hạt sao lướt.
    - [x] Model tàu hiển thị sắc nét ở làn giữa.
    - [x] Phím A/D lướt 5 làn đường mượt mà (`-4.0, -2.0, 0, 2.0, 4.0`).
    - [x] Tự động co giãn theo cửa sổ trình duyệt (responsive).

- [x] **Task 2: Cơ Chế Chuyển Pha Năng Lượng & Phản Hồi Thị Giác (Phase Shift Slice)**
  - *Mô tả:* Phím Space/Click đổi pha Cyan (`#00F5FF`) ↔ Orange (`#FF7700`). Đổi ánh sáng phát quang thân tàu, màu lửa phản lực đuôi tàu và widget hiển thị Pha trên HUD.
  - *Sự phụ thuộc:* Task 1
  - *Trạng thái:* Đã hoàn thành (100% unit tests passed)
  - *Tiêu chí hoàn thành:*
    - [x] Nhấn Space đổi pha tức thì Cyan ↔ Orange.
    - [x] Thân tàu và vệt lửa đuôi đổi màu tương ứng.
    - [x] Widget Pha trên HUD cập nhật đồng bộ.
    - [x] Cooldown 150ms chống spam phím.

- [x] **Checkpoint 1: Kiểm tra Phase 1**
  - [x] Tàu lướt 5 làn mượt mà, chuyển pha đổi màu thân tàu và HUD nhạy bén.
  - [x] Console không có lỗi 404 tài nguyên, máy chủ trả về HTTP 200 cho toàn bộ assets.

---

## Phase 2: Vòng Lặp Sinh Tồn & Năng Lượng (Core Gameplay Loop)

- [x] **Task 3: Sinh Vật Cản Thiên Thạch & Vòng Lặp Máu / Game Over (Survival Loop Slice)**
  - *Mô tả:* `ObstacleManager` tạo pool thiên thạch `meteor_detailed.glb` cuộn tới. `CollisionSystem` kiểm tra va chạm: trừ 1 HP, rung camera, chớp nháy bất tử 1.5s. HUD hiển thị 3 HP, hết HP hiện Game Over và nút Chơi lại.
  - *Sự phụ thuộc:* Task 1, Task 2
  - *Trạng thái:* Đã hoàn thành (100% unit tests passed)
  - *Tiêu chí hoàn thành:*
    - [x] Thiên thạch sinh ngẫu nhiên trên các làn và tái sử dụng qua Object Pool.
    - [x] Va chạm thiên thạch trừ đúng 1 HP, rung camera và bất tử 1.5s.
    - [x] Hết 3 HP hiện màn hình Game Over.
    - [x] Nút Chơi lại reset sạch sẽ về 3 HP và bắt đầu ván mới ngay.

- [x] **Task 4: Tinh Thể Năng Lượng & Hệ Thống Điểm Số (Energy Crystals & Scoring Slice)**
  - *Mô tả:* Sinh Tinh thể Băng (Cyan) và Tinh thể Lửa (Cam). Ăn cùng pha: $+100$ điểm, $+8\%$ thanh Hyper-Drive; va chạm khác pha: mất $1$ HP. Điểm tăng theo thời gian sinh tồn.
  - *Sự phụ thuộc:* Task 2, Task 3
  - *Trạng thái:* Đã hoàn thành (100% unit tests passed)
  - *Tiêu chí hoàn thành:*
    - [x] Tinh thể 2 màu Cyan/Cam xuất hiện xen kẽ với thiên thạch.
    - [x] Đâm đúng màu pha: $+100$ điểm, nạp $+8\%$ Hyper-Drive, hiệu ứng hạt nổ sáng.
    - [x] Đâm sai màu pha: mất $1$ HP như đâm thiên thạch.
    - [x] Điểm số tăng liên tục theo thời gian và hiển thị chuẩn trên HUD.

- [x] **Checkpoint 2: Kiểm tra Phase 2**
  - [x] Vòng lặp gameplay chính hoạt động trơn tru (Ăn tinh thể đúng màu, né thiên thạch, mất máu, Game Over, Chơi lại).
  - [x] Hiệu năng duy trì 60 FPS ổn định không giật lag.

---

## Phase 3: Cơ Chế Sáng Tạo & Đỉnh Cao (Reflex & Special Abilities)

- [x] **Task 5: Rủi Ro / Phần Thưởng: Né Sát (Near-Miss) & Siêu Tốc (Hyper-Drive Slice)**
  - *Mô tả:* Cơ chế Near-Miss khi lướt sát thiên thạch ở làn kề bên (+250 điểm, +15% nạp, hiện popup toast `⚡ NEAR-MISS EVASION`). Hyper-Drive kích hoạt khi nạp 100%: tăng tốc 1.8x, bọc khiên vô địch phá hủy thiên thạch và từ trường hút mọi tinh thể trong 6s.
  - *Sự phụ thuộc:* Task 3, Task 4
  - *Trạng thái:* Đã hoàn thành (100% unit tests passed)
  - *Tiêu chí hoàn thành:*
    - [x] Lướt sát thiên thạch hiện popup toast Near-Miss và thưởng điểm/nạp.
    - [x] Đầy 100% tự động kích hoạt Hyper-Drive trong 6s với vệt sáng speed lines.
    - [x] Trong Hyper-Drive: phá hủy thiên thạch khi chạm và tự hút tinh thể.
    - [x] Hết 6s trở về tốc độ bình thường và reset thanh năng lượng về 0%.

- [x] **Task 6: Vật Phẩm Phụ & Tích Hợp Hệ Thống Âm Thanh (Pickups & Audio Slice)**
  - *Mô tả:* Sinh Lõi Sửa Chữa (hồi +1 HP, tối đa 3) và Mảnh Cộng Hưởng (nhân đôi x2 điểm trong 8s). `AudioManager` nạp SFX (đổi pha, ăn điểm, mất máu, nổ) và BGM `laserpack_bgm.mp3` kèm nút bật/tắt âm thanh trên HUD.
  - *Sự phụ thuộc:* Task 4, Task 5
  - *Trạng thái:* Đã hoàn thành (100% unit tests passed)
  - *Tiêu chí hoàn thành:*
    - [x] Nhặt Lõi Sửa Chữa hồi 1 HP.
    - [x] Nhặt Mảnh Cộng Hưởng nhân đôi điểm trong 8s với viền vàng kim trên HUD.
    - [x] Âm thanh SFX phát ăn khớp với mọi hành động tương tác.
    - [x] Nhạc nền BGM lặp êm ái, nút Mute/Unmute hoạt động chính xác.

- [x] **Checkpoint 3: Kiểm tra Phase 3**
  - [x] Đầy đủ cơ chế Near-Miss, Hyper-Drive, vật phẩm phụ và âm thanh.
  - [x] Trải nghiệm chơi lôi cuốn, nhịp độ dồn dập.

---

## Phase 4: Hoàn Thiện, Trình Diễn & Đóng Gói (Polish & Packaging)

- [ ] **Task 7: Tích Hợp Start Screen, Lưu Kỷ Lục & Đóng Gói Nộp Bài (Final Polish Slice)**
  - *Mô tả:* Ghép nối màn hình Start Screen từ `preview_ui.html` (logo, hướng dẫn, nút BẮT ĐẦU kích hoạt âm thanh). Lưu điểm cao qua `localStorage`. Hỗ trợ cảm ứng/vuốt (Swipe/Tap). Cân chỉnh nhịp độ tăng tốc theo thời gian. Viết file `README.md`.
  - *Sự phụ thuộc:* Tasks 1–6
  - *Trạng thái:* Chưa thực hiện
  - *Tiêu chí hoàn thành:*
    - [ ] Màn hình Start Menu xuất hiện đúng chuẩn thiết kế đã duyệt.
    - [ ] Nút BẮT ĐẦU chuyển mượt vào game và bật âm thanh.
    - [ ] Điểm kỷ lục được lưu giữ qua `localStorage`.
    - [ ] Tài liệu `README.md` hướng dẫn chạy 1-click cho ban giám khảo.

- [ ] **Checkpoint 4: Nghiệm Thu Hoàn Tất Dự Án**
  - [ ] Đạt toàn bộ 7 tiêu chí thành công trong `SPEC_VOID_SHIFT_3D.md`.
  - [ ] Ổn định 60 FPS, không lỗi bộ nhớ, sẵn sàng nộp bài cuộc thi IT Game Jam 2026.
