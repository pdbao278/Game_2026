# TÀI LIỆU THIẾT KẾ GAME & GIAO DIỆN (GAME & VISUAL DESIGN)
## DỰ ÁN: AQUA DASH - BIOLUMINESCENT ODYSSEY

---

### 1. ĐỊNH HƯỚNG MỸ THUẬT & PHONG CÁCH THỊ GIÁC (ART DIRECTION)

* **Phong cách thẩm mỹ chủ đạo (Visual Aesthetic):** **Bioluminescent Abyssal Neon (Đại dương Sâu Phát quang Sinh học)**.
* **Tôn chỉ thiết kế:** Tránh hoàn toàn phong cách đồ họa "AI nhạt nhòa" (AI slop) với các dải màu tím gradient đại trà. Thay vào đó, thiết kế tập trung vào sự tương phản kịch tính giữa bóng tối của vực biển sâu thẳm và ánh sáng neon rực rỡ tỏa ra từ thân chú cá, ngọc trai và các nhánh san hô ngầm.
* **Bảng màu chủ đạo (Color Palette):**
  * **Abyssal Base (Nền vực sâu 3D):** `#030b17` đến `#0a2239` (Tạo cảm giác sâu thẳm vô tận).
  * **Neon Aqua Cyan (Ánh sáng cá & bọt nước):** `#00f5d4` (Năng động, tươi mát, nổi bật).
  * **Coral Sunset Pink (Cột đá ngầm & san hô gai):** `#ff0054` và `#7209b7` (Cảnh báo hiểm nguy, tương phản mạnh với màu nước).
  * **Golden Pearl (Ngọc trai & Điểm thưởng):** `#fee440` (Tạo động lực kích thích người chơi liều lĩnh thu thập).
  * **Bioluminescent Text & Glow (HUD):** `#e0fbfc` với hiệu ứng đổ bóng phát sáng `text-shadow: 0 0 10px rgba(0, 245, 212, 0.7)`.

---

### 2. THIẾT KẾ NHÂN VẬT & ĐỐI TƯỢNG TRONG GAME

```
                  _/\_
               .-'    `-.  * (Bong bóng khí quẫy đuôi)
             .'  *  O    \    o
            /  *         /   o
      <><  /   *        /   .
            \  *       /
             `.  *   .'
               `-.__.-'
```

#### 2.1. Nhân vật chính - Chú cá phát quang (Glow Fin) & Trạng thái Cá Nóc
* **Hình thái thông thường:** Chú cá dạ quang nhỏ nhắn, vây và đuôi trong suốt phát ra ánh sáng ngọc bích `Cyan Glow`.
* **Trạng thái Cá Nóc Phình Gai (Puffer Dash):**
  * Kích thước nở to gấp 1.7 lần, toàn thân bao bọc bởi luồng năng lượng đỏ hồng rực sáng (`#ff0054`) cùng các gai nhọn phát quang.
  * Cho phép húc vỡ vụn các vách đá san hô nứt rạn.
* **Đàn cá AI Hộ Mệnh (Escort Boids):**
  * 3 đến 5 chú cá con phát quang bơi uốn lượn sau đuôi cá mẹ bằng thuật toán bầy đàn tự nhiên.
  * Tự động tản ra hút ngọc và hy sinh làm khiên chắn khi va quẹt nhẹ.
* **Hiệu ứng chuyển động (Motion & Feedback):**
  * **Khi bơi lên (Flap/Impulse):** Đuôi quẫy mạnh, giải phóng ra các hạt bong bóng nước nhỏ lơ lửng lại phía sau (`Bubble Trail`).
  * **Khi va chạm:** Mất 1 cá con hộ mệnh, màn hình rung chuyển nhẹ và chớp nháy bất tử 1.4 giây. Nếu hết cá con, cá mẹ vỡ tan thành cụm bọt khí lấp lánh (Bubble Burst).

#### 2.2. Chướng ngại vật - Cột đá ngầm & Cột thủy nhiệt
* **Cột san hô thường:** Bề mặt tím thẫm gai góc, không thể phá vỡ.
* **Cột đá nứt (Fractured Pillar):** Có các đường vân pha lê rạn nứt phát sáng màu vàng cam rực rỡ, kèm nhãn cảnh báo `BREAKABLE`, có thể húc vỡ khi đang Puffer Dash.
* **Cột Phun Thủy Nhiệt (Thermal Geyser):** Luồng bong bóng nước nóng cuồn cuộn từ đáy biển phun lên, đẩy người chơi bay vọt lên cao (Updraft Flow).

#### 2.3. Vật phẩm thu thập (Collectibles)
* **Ngọc trai hoàng kim (Golden Pearl - Điểm thưởng +5):**
  * Đặt lơ lửng giữa tâm khe hở hoặc nằm lệch sát cột đá (High Risk - High Reward).
  * Hình cầu phát ánh sáng vàng ấm `#fee440`, liên tục co giãn nhẹ nhàng (Pulsing animation) và xoay quanh trục để thu hút tầm nhìn.
  * Khi ăn: Hiện chữ số bay lên `+5` màu vàng kim, kèm hiệu ứng tia sáng tóe ra.
* **Cá lồng đèn nhỏ / Sao biển may mắn (Bonus +10):**
  * Xuất hiện ngẫu nhiên sau chuỗi 5 cột đá liên tiếp, trôi dạt nhấp nhô theo hình sin.

---

### 3. THIẾT KẾ GIAO DIỆN NGƯỜI DÙNG (UI/UX DESIGN)

Toàn bộ UI được thiết kế theo phong cách **Futuristic Submarine HUD** (Màn hình hiển thị trên kính tiềm vọng tàu ngầm) với các đường viền phát sáng mỏng tinh tế, không làm che khuất tầm nhìn gameplay.

#### 3.1. Bố cục Màn hình Chơi (HUD Layout)
```
+-------------------------------------------------------------+
| [ ESC: TẠM DỪNG ]                     KỶ LỤC: 128 (MÀNG VÀNG) |
|                                                             |
|                       ĐIỂM: 24                              |
|                   (NGỌC TRAI: +15)                          |
|                                                             |
|           / \                                               |
|          |   |  (Cột san hô rủ xuống)                       |
|           \ /                                               |
|                                                             |
|      ><>         (O) (Ngọc trai +5)                         |
|                                                             |
|                   / \                                       |
|                  |   | (Cột đá trồi lên)                    |
|                  |   |                                      |
+-------------------------------------------------------------+
```
* **Vị trí Score:** Đặt chính giữa đỉnh màn hình, kích thước lớn `48px`, font chữ số dày dặn, viền bóng neon.
* **Chỉ số Ngọc:** Biểu tượng ngọc trai nhỏ kèm số lượng ngọc đã ăn nằm ngay dưới điểm tổng.

#### 3.2. Màn hình Bắt đầu (Start Menu)
* **Tiêu đề game:** Chữ `AQUA DASH` thiết kế nổi bật với hiệu ứng gợn sóng khúc xạ ánh sáng nước.
* **Lời nhắc hành động (Call To Action):** `[ NHẤN SPACE HOẶC CHẠM ĐỂ BƠI ]` nhấp nháy nhịp tim (Breathing Glow).
* **Nút tùy chọn:** Bật/tắt âm thanh (Mute/Unmute) ở góc trên bên phải.

#### 3.3. Màn hình Thua cuộc (Game Over Overlay)
* Không che toàn bộ màn hình; sử dụng lớp phủ làm mờ nền biển sâu (Backdrop blur).
* Hộp thông tin kính mờ (Frosted Glass Panel):
  * **Điểm trận này (Current Score):** Điểm số vừa đạt.
  * **Điểm thưởng ngọc (Bonus Pearls):** Số ngọc đã thu thập.
  * **Kỷ lục (Best Score):** Nếu phá kỷ lục sẽ có huy hiệu `KỶ LỤC MỚI!` màu vàng kim kèm pháo sáng bọt khí.
  * **Nút chơi lại tức thì:** Nút bấm nổi bật `[ CHƠI LẠI (SPACE) ]` có viền sáng chuyển động.

---

### 4. THIẾT KẾ CẢM GIÁC GAME (GAME FEEL & JUICE)

Để biến một trò chơi né cột quen thuộc thành một sản phẩm ấn tượng đạt điểm tối đa ở tiêu chí "Ý tưởng sáng tạo & Trải nghiệm chơi", các yếu tố "Juice" sau được áp dụng:

1. **Rung lắc màn hình (Screen Shake):**
   * Rung nhẹ `0.2s` với biên độ `6px` khi va chạm cột đá, tạo cảm giác va đập vật lý có trọng lượng.
2. **Kéo dãn hình thể (Squash & Stretch):**
   * Khi quẫy đuôi bơi: Thân cá hơi co lại theo chiều ngang và dài ra theo chiều dọc `(scaleX: 0.9, scaleY: 1.15)` trong `0.1s` rồi đàn hồi trở lại.
3. **Hiệu ứng hạt nổi (Floating Embers & Bubbles):**
   * Lớp Three.js phía sau liên tục đẩy các hạt vi sinh vật phù du và bọt khí li ti trôi ngược hướng di chuyển, tạo ảo giác về tốc độ lướt sóng cực nhanh.
4. **Hiệu ứng Dòng chảy tăng tốc (Speed Lines):**
   * Khi đạt chuỗi điểm cao (>20 điểm), xuất hiện các vệt nước trắng trong suốt lướt nhanh ngang màn hình.

---

### 5. THIẾT KẾ ÂM THANH & PHẢN HỒI THÍNH GIÁC (SOUNDSCAPE)

* **Âm nền (Ambient Soundscape):** Tiếng gầm trầm ấm của lòng đại dương (Deep underwater drone) kết hợp tiếng bọt khí lạo xạo thư giãn.
* **Tiếng bơi (Swim Stroke):** Tiếng nước bị khuấy động nhẹ, âm trầm mượt mà không gây chói tai khi người chơi nhấp liên tục.
* **Tiếng vượt cột thành công (Column Pass):** Âm click trong trẻo, tần số tăng dần theo chuỗi combo vượt cột liên tục.
* **Tiếng ăn ngọc trai (Gem Chime):** Tiếng chuông ngọc ngân vang `Crystal Harp Chime` cực kỳ thỏa mãn thính giác.
* **Tiếng Game Over:** Tiếng nổ bong bóng lớn kèm âm điệu trượt nốt xuống (Pitch slide down) hài hước, nhẹ nhàng, không gây ức chế.

