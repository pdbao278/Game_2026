# TÀI LIỆU Ý TƯỞNG THIẾT KẾ GAME 3D: VOID SHIFT (CHUYỂN PHA KHÔNG GIAN)

> **Mục tiêu dự án:** Tự làm một prototype độc lập để thử ý tưởng trước cuộc thi; hoàn thiện bản chơi được trên trình duyệt trong **2 tiếng (120 phút)**. Nhóm dự kiến có 3 người chưa biết Three.js và sẽ dùng AI agent hỗ trợ viết, giải thích và sửa mã.  
> **Định hướng thẩm mỹ:** Tối giản hiện đại (Minimalist / Clean Low-Poly), kiên quyết **nói không với giao diện "mùi AI"** (không neon lòe loẹt, không gradient bóng bẩy thừa thãi).

---

## 1. Tổng quan Dự án
* **Tên dự án (tạm đặt):** *Void Shift 3D*
* **Thể loại:** 3D Endless Runner / Reflex Arcade (Phản xạ tốc độ cao)
* **Nền tảng mục tiêu:** Web Browser (HTML5 + Three.js)
* **Thời lượng trải nghiệm mỗi ván:** 1 – 3 phút / lượt chơi

---

## 2. Phong cách Nghệ thuật & UI (Aesthetic & UI Design)

### 2.1. Thị giác 3D (Clean Low-Poly)
* **Môi trường:** Không gian vũ trụ nền đen xám than (`#0a0a0f`), rải rác các hạt sao (starfield particles) bay lướt tạo cảm giác tốc độ.
* **Mô hình 3D:** Sử dụng các mô hình Low-poly có sẵn từ **Kenney Space Kit** (mặt phẳng vát góc, màu sắc đồng bộ, không dùng vân texture phức tạp).
* **Ánh sáng:** Đơn giản với 1 nguồn sáng chính (Directional Light) tạo bóng đổ sắc nét và ánh sáng môi trường (Ambient Light) dịu nhẹ.

### 2.2. Giao diện người dùng (Minimalist HUD)
* **Nguyên tắc:** Càng ít chi tiết thừa càng sang và sạch.
* **Typography:** Sử dụng 1 font chữ hình học hoặc monospace hiện đại (như *Space Mono* hoặc *Syne* từ Google Fonts).
* **Bảng màu:**
  * Nền HUD: Trong suốt hoặc màu tối mờ (`rgba(15, 15, 20, 0.75)` với hiệu ứng mờ kính `backdrop-filter: blur(8px)`).
  * Chữ: Trắng mờ (`#f0f0f0`) và xám (`#888888`).
  * Màu trạng thái (2 màu nhận diện chính của game):
    * **Pha 1 (Băng/Cyan):** `#00F0FF`
    * **Pha 2 (Lửa/Cam):** `#FF5500`

### 2.3. Bản xem trước UI trước khi code
* **Yêu cầu bắt buộc:** Trước khi viết code giao diện trong game, tạo một bản xem trước trực quan để người dùng duyệt và chỉnh sửa.
* **Nội dung xem trước:** Màn hình bắt đầu/hướng dẫn, HUD khi chơi (điểm, 3 điểm bền, pha hiện tại, trạng thái vật phẩm/Hyper-Drive) và màn hình Game Over/Chơi lại. Thể hiện icon cho tinh thể pha, lõi sửa chữa và mảnh cộng hưởng.
* **Định dạng ưu tiên:** Mockup tĩnh bằng SVG hoặc HTML/CSS để mở trực tiếp trên trình duyệt; dùng hình khối/icon vector đơn giản, chữ thật và đúng bảng màu game. Không cần tạo ảnh raster riêng cho các thành phần giao diện cơ bản.
* **Vòng duyệt:** Trình bày bản xem trước trước khi code UI; cập nhật theo góp ý và chỉ chuyển sang triển khai sau khi người dùng chốt bố cục, nội dung và phong cách. Nếu gameplay thay đổi làm HUD khác đi, cập nhật preview trước khi sửa UI trong game.

---

## 3. Cơ chế Gameplay Cốt lõi (Core Mechanics)

### 3.1. Điều khiển cơ bản
* **Di chuyển tự do:** Phím `A` / `D`, phím mũi tên `Trái` / `Phải`, hoặc rê chuột để điều khiển phi thuyền lướt ngang trong phạm vi đường bay. Chọn một kiểu điều khiển chính khi triển khai để tránh cảm giác điều khiển không nhất quán.
* **Tự động bay tới:** Con tàu liên tục bay tiến về phía trước theo trục Z với tốc độ tăng dần theo thời gian.

### 3.2. Cơ chế sáng tạo: "Chuyển pha năng lượng" (Phase Shift)
* Nhấn phím **Cách (Space)** hoặc **Click chuột** để đảo trạng thái năng lượng của tàu giữa **Pha Xanh (Cyan)** và **Pha Cam (Orange)**.
* Khi đổi pha, thân tàu phát sáng nhẹ hiệu ứng đổi màu tương ứng. Đổi pha có thời gian hồi ngắn để người chơi phải chọn thời điểm thay vì bấm liên tục.

### 3.3. Tương tác với các vật thể trên đường bay
1. **Điểm bền:** Tàu bắt đầu với 3 điểm bền. Va vào thiên thạch hoặc tinh thể sai pha làm mất 1 điểm bền. Khi hết điểm bền, ván chơi kết thúc.
2. **Tinh thể pha (vật phẩm điểm):** Có hai màu Cyan và Cam. Đâm vào tinh thể cùng pha để hấp thụ, nhận điểm và nạp thanh Hyper-Drive. Tinh thể khác pha là vật cản; va chạm làm mất 1 điểm bền.
3. **Lõi sửa chữa (vật phẩm hồi phục):** Hiếm khi xuất hiện; nhặt được thì hồi 1 điểm bền, tối đa 3.
4. **Mảnh cộng hưởng (vật phẩm thưởng):** Nhặt được thì nhân đôi điểm nhận trong thời gian ngắn (đề xuất 8 giây). Hiệu ứng có thể hiển thị bằng viền HUD hoặc màu tàu để người chơi nhận biết.
5. **Lướt sát (Near-Miss):** Bay sát thiên thạch mà không va chạm sẽ cộng điểm combo và nạp Hyper-Drive, tạo phần thưởng cho lối chơi mạo hiểm.
6. **Hyper-Drive:** Khi thanh năng lượng đầy, người chơi chủ động kích hoạt tăng tốc ngắn. Trong thời gian này, điểm nhận được tăng lên và mật độ vật cản cao hơn; đây là lựa chọn rủi ro/phần thưởng của vòng chơi.

> **Giới hạn prototype:** Ba vật phẩm là tinh thể pha, lõi sửa chữa và mảnh cộng hưởng. Nếu quá thời gian, ưu tiên hoàn thiện tinh thể pha và lõi sửa chữa trước; mảnh cộng hưởng và Hyper-Drive là phần mở rộng sau khi vòng chơi cốt lõi hoạt động ổn.

---

## 4. Kế hoạch Nguồn Tài nguyên (Assets Planning)

Toàn bộ sử dụng nguồn tài nguyên miễn phí bản quyền (CC0), được con người thiết kế tỉ mỉ:

1. **Mô hình 3D (Định dạng `.glb`):**
   * **Tàu không gian:** [Kenney - Space Kit](https://kenney.nl/assets/space-kit) (chọn 1 mẫu tàu chiến đấu gọn gàng).
   * **Thiên thạch (Asteroids):** Sử dụng các khối đá low-poly có sẵn trong bộ Space Kit.
   * **Tinh thể năng lượng (Crystals):** Dùng mô hình tinh thể hoặc dựng bằng khối hình học 3D (IcosahedronGeometry) của Three.js có phủ màu phát sáng.
2. **Âm thanh (Nếu còn thời gian):**
   * Âm thanh lướt gió, tiếng "ting" khi ăn đúng màu, tiếng cảnh báo khi mất máu từ [Kenney - Sci-Fi Sounds](https://kenney.nl/assets/sci-fi-sounds).
3. **Phông chữ:**
   * Google Font: *Space Mono* (Monospace) hoặc *Rajdhani* (Sci-Fi góc cạnh).

---

## 5. Lộ trình Triển khai trong 120 Phút (2 Tiếng)

> **Cổng duyệt UI trước khi code:** Tạo và duyệt mockup ở mục 2.3 trước khi bắt đầu triển khai giao diện. Giai đoạn này có thể chuẩn bị trước buổi làm prototype; nếu thực hiện trong khung 120 phút thì dành khoảng 10 phút đầu.

| Khoảng thời gian | Nội dung công việc | Kết quả cần đạt |
| :--- | :--- | :--- |
| **00:00 – 00:20** | **Dựng khung cảnh Three.js** | Tạo file HTML, tải model tàu và thiên thạch vào khung cảnh, tạo bầu trời sao. |
| **00:20 – 00:50** | **Điều khiển & Vòng chơi** | Điều khiển tàu tự do, sinh vật thể cuộn liên tục, va chạm đơn giản, 3 điểm bền và kết thúc ván. |
| **00:50 – 01:15** | **Chuyển pha & Tinh thể** | Space đổi pha, tinh thể đúng pha cho điểm/năng lượng, tinh thể sai pha gây sát thương. |
| **01:15 – 01:35** | **Vật phẩm thưởng & HUD** | Thêm lõi sửa chữa và mảnh cộng hưởng nếu vòng chơi chính đã ổn; hiển thị điểm, điểm bền, pha, Game Over và Chơi lại. |
| **01:35 – 02:00** | **Hoàn thiện bản chơi thử** | Ưu tiên Near-Miss/Hyper-Drive nếu còn thời gian, cân chỉnh nhịp vật cản, kiểm tra chạy ổn và chuẩn bị hướng dẫn chơi ngắn. |
