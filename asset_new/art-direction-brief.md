# ĐẶC TẢ ĐỊNH HƯỚNG NGHỆ THUẬT (ART DIRECTION BRIEF) - VOID SHIFT 3D

## 1. Thông số kỹ thuật (Technical Frame)
* **Dự án:** Void Shift 3D (Reflex Arcade Runner)
* **Engine:** Three.js (WebGL / WebGPU) + HTML5 Overlay HUD
* **Góc nhìn camera:** Phối cảnh thứ 3 từ sau đuôi tàu (Third-Person Rear Chase Cam, FOV 60°, góc nhìn hơi chếch xuống 15°)
* **Định dạng tài nguyên 2D/VFX:** PNG 32-bit (RGBA có kênh alpha trong suốt thực tế, không fake checkerboard)
* **Kích thước chuẩn (Native Dimensions):** 256×256 px hoặc 512×512 px (tối ưu hóa bộ nhớ WebGL và Texture Atlas)
* **Bảng màu chủ đạo:**
  * Không gian vũ trụ (Deep Space): Tím than kẹo ngọt `#0b0817` - `#16102a`
  * Pha 1 - Băng Tuyết (Ice Cyan): `#00F0FF` (Accent & Emission), viền phát sáng `#48CAE4`
  * Pha 2 - Lửa Kẹo (Fire Orange): `#FF6600` (Accent & Emission), ánh vàng `#FFA07A`
  * Điểm thưởng / Sao vàng (Gold Shard): `#FFD166`
  * Hồi phục / Lõi sửa chữa (Health Green): `#06D6A0`
  * Điểm bền / Trái tim (Heart Pink): `#EF476F`

## 2. Hệ thống ngôn ngữ thị giác (Visual System)
* **Phong cách (Style):** Hoạt hình, dễ thương (Cute Cartoon Stylized / Chunky Toy-like Sci-Fi).
* **Hình khối (Shape Language):** Bo góc tròn trịa (rounded bevels), dáng mập mạp ngộ nghĩnh (chubby silhouettes), tránh góc nhọn nguy hiểm, buồng lái kính hình trứng to tròn.
* **Đường viền (Edge Treatment):** Viền sắc nét, chuyển tiếp màu mượt mà, viền sáng dạ quang nhẹ (soft neon rim light) theo pha tương ứng.
* **Chất liệu (Materials):** Bề mặt mịn dạng nhựa đồ chơi cao cấp (clay/matte plastic) kết hợp mặt kính bóng bẩy có đốm phản chiếu hoạt hình.
* **Cơ chế nhận diện:** Tinh thể và vật phẩm phải có độ tương phản cao, dễ nhìn rõ ở tốc độ di chuyển nhanh.
