# Bản Định Hướng Mỹ Thuật (Art Direction Brief) - Aqua Dash: Bioluminescent Odyssey

## 1. Khung Trò Chơi (Game Frame)

- **Trải nghiệm người chơi (Player fantasy):** Điều khiển chú cá nóc phát quang sinh học (Bioluminescent Pufferfish) thám hiểm rãnh biển sâu thăm thẳm, quẫy nước bơi lội, phình gai phá vỡ rạn đá san hô, và dẫn dắt đàn cá hộ mệnh thu thập ngọc trai cùng sao biển phát sáng.
- **Hành động cốt lõi (Core verbs):** Bơi nhấp nhô (Swim / Flap), Lướt phình gai phá đá (Puffer Dash), Thu thập ngọc & sao biển (Collect), Tránh chướng ngại vật biển sâu (Evade).
- **Engine & Trình kết xuất:** HTML5 2D Canvas + Three.js kết xuất hậu cảnh vực biển sâu (Bioluminescent particles & deep gradient).
- **Nền tảng mục tiêu:** Web Browser đa nền tảng (Desktop Chrome/Firefox/Safari & Mobile responsive).
- **Góc nhìn / Camera:** Cuộn ngang 2D side-scrolling, hướng chuyển động từ trái sang phải.
- **Kích thước hiển thị chuẩn:** Viewport đáp ứng linh hoạt (1920x1080 native canvas display).
- **Kích thước hiển thị sprite trên màn hình:**
  - Cá người chơi (Player): Bán kính r = 18px (đường kính ~36px - 48px), khi phình gai mở rộng ~54px.
  - Đàn cá hộ mệnh (Boids escort): Chiều dài 9px - 14px.
  - Ngọc trai (Pearl shell): Bán kính r = 14px (vùng vẽ ~38px - 48px).
  - Sao biển (Starfish): Bán kính r = 16px (vùng vẽ ~36px - 42px).
  - Cột đá san hô (Pillars): Chiều rộng 60px, chiều cao 100px - 450px.

---

## 2. Hệ Thống Thị Giác (Visual System)

- **Ngôn ngữ hình học (Shape language):** Hình dáng hữu cơ mềm mại khí động học cho sinh vật biển (oval, giọt nước, đường cong sinh thái) tương phản với hình khối góc cạnh, nhọn gai của rạn đá san hô và gai nhọn phòng thủ.
- **Ưu tiên nhận diện bóng đen (Silhouette priorities):**
  - Chú cá người chơi: Thân bầu tròn có vây lưng, đèn lồng phát quang (Angler lure) nhô phía trước đỉnh đầu giúp định vị chính xác vị trí mắt và đầu cá. Khi Dash, bóng biến thành quả cầu gai nhọn tròn đầy uy lực.
  - Đàn cá con: Thon nhỏ, vệt đuôi hình tam giác linh hoạt.
  - Ngọc trai: Vỏ sò mở hé để lộ viên ngọc tròn tỏa sáng rực rỡ bên trong.
  - Sao biển: 5 cánh sao đối xứng với tâm phát sáng tròn.
  - Cột đá nứt (Breakable): Các vết nứt chữ Z sắc nhọn phát màu vàng neon cảnh báo có thể húc vỡ.
- **Hệ thống bảng màu (Palette roles & Swatches):**
  - `#00f5d4` (Neon Aqua/Cyan): Màu dạ quang chủ đạo của cá người chơi, ngọc trai và bầy cá hộ mệnh. Tượng trưng cho sự sống và năng lượng an toàn.
  - `#ff0054` (Neon Magenta/Pink): Màu cảnh báo nguy hiểm, sao biển thưởng và năng lượng bộc phát khi phình gai.
  - `#fee440` (Bioluminescent Gold/Yellow): Ánh sáng đèn lồng, lõi năng lượng gai và khe nứt rạn đá có thể phá hủy.
  - `#7209b7` & `#3a0ca3` (Electric Deep Purple): Màu vây cá, hào quang thứ cấp và viền đá san hô sâu.
  - `#0f172a` (Abyssal Slate Black): Nền cột đá thâm sâu, tạo độ tương phản cực đại cho các đường phát quang neon.
  - `#ffffff` (Pure White Sparkle): Đốm sáng phản xạ, điểm mắt và tia sáng lấp lánh trung tâm ngọc trai.
- **Chất liệu & Đặc tính bề mặt:**
  - Bề mặt phát quang xà cừ (Bioluminescent Nacre) với hiệu ứng phát sáng mờ ảo (Soft Bloom / Radial Glow).
  - Độ trong suốt cục bộ ở các vây cá (Alpha translucent fins).
  - Vỏ đá bazan biển sâu nhám lì kết hợp tĩnh mạch dung nham/khoáng chất neon.
- **Xử lý đường viền:** Viền phát quang mềm (soft neon glow) hoặc nét line mượt mà không răng cưa; không dùng viền đen thô cứng.

---

## 3. Quy Chuẩn Kỹ Thuật (Technical Contract)

- **Định dạng:** Vector SVG độ nét cao (sắc nét tuyệt đối ở mọi độ phân giải màn hình Retina/High-DPI) và có thể rasterize sang PNG chuẩn.
- **Kênh Alpha:** Trong suốt 100% ở các vùng ngoài biên của sprite.
- **Điểm neo (Anchor/Pivot):** Căn giữa tâm (Center) cho các sinh vật và vật phẩm quay góc (Player, Boid, Pearl, Starfish); Căn lề trên/dưới cho Cột đá san hô.
- **Độ tương phản môi trường:** Kiểm tra khả năng nhìn rõ trên nền nước biển sâu gradient (`#020617` đến `#0b192e`).
- **Thư mục lưu trữ:** `public/assets/` để phục vụ trực tiếp cho Vite client engine.

---

## 4. Danh Mục Tài Sản (Asset List)

1. `pearl.svg` (Vỏ sò ngọc trai xà cừ - Collectible tiêu chuẩn)
2. `starfish.svg` (Sao biển phát quang dạ quang - Collectible cao cấp)
3. `player-fish.svg` (Cá lồng đèn phát sáng - Trạng thái bơi bình thường)
4. `player-dash.svg` (Cá nóc phình gai bọc giáp năng lượng - Trạng thái Dash)
5. `boid-escort.svg` (Cá hộ mệnh dạ quang - Đàn cá Boids AI)
6. `coral-pillar-solid.svg` (Cột đá san hô biển sâu kiên cố - Chướng ngại vật không thể phá vỡ)
7. `coral-pillar-fractured.svg` (Cột đá nứt nẻ khoáng thạch neon - Chướng ngại vật có thể phá vỡ khi Dash)

