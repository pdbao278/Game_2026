# TÀI LIỆU YÊU CẦU SẢN PHẨM (PRD)
## DỰ ÁN: AQUA DASH (CHÚ CÁ VƯỢT ĐÁ NGẦM)

---

### 1. TỔNG QUAN DỰ ÁN
* **Tên dự án dự kiến:** Aqua Dash (hoặc Deep Sea Glider)
* **Thể loại:** 2.5D Endless Runner / Arcade Tap-to-Swim (Lấy cảm hứng từ Flappy Bird nhưng nâng cấp cơ chế bơi vật lý thủy lực dưới nước)
* **Công nghệ chủ đạo:** Kết hợp Three.js (Môi trường đại dương 3D, chiều sâu, ánh sáng caustics, hạt bong bóng) và Phaser 4 (Xử lý vòng lặp game 2D, Arcade Physics, thực thể Sprite, điểm số, giao diện)
* **Bối cảnh phát triển:** Cuộc thi **IT Game Jam with AI 2026** (Thời gian phát triển thực tế: **150 phút**)
* **Mục tiêu sản phẩm:** 
  * Tạo ra một trò chơi trực quan ấn tượng trên nền web browser (không cần cài đặt, tải nhanh dưới 2 giây).
  * Lối chơi cuốn hút, dễ tiếp cận ngay lập tức nhưng có chiều sâu thử thách và giá trị chơi lại (replayability) cao.
  * Tối ưu hóa để ghi điểm cao ở các tiêu chí BGK: **Ý tưởng sáng tạo (40đ)**, **Trải nghiệm chơi (20đ)**, **Hiện thực hóa ý tưởng (20đ)**, và **Giải thích kỹ thuật/AI (20đ)**.

---

### 2. CHÂN DUNG NGƯỜI DÙNG & TÌNH HUỐNG SỬ DỤNG
* **Đối tượng mục tiêu:** Ban giám khảo, sinh viên tham quan và khán giả bình chọn tại IT Game Jam.
* **Thời gian phiên chơi trung bình (Session Length):** 45 – 90 giây mỗi lượt chơi.
* **Tâm lý người chơi:** Thích cảm giác thử thách phản xạ nhanh, muốn chơi lại ngay khi thua ("Just one more try"), ấn tượng với hình ảnh 3D chuyển động mượt mà và âm thanh phản hồi sảng khoái.

---

### 3. CƠ CHẾ CHƠI CỐT LÕI (CORE GAMEPLAY)
1. **Điều khiển bơi thủy lực (Buoyancy & Impulse):**
   * Người chơi nhấn `Space`, `Chuột trái`, hoặc `Chạm màn hình cảm ứng` để chú cá quẫy đuôi bơi hướng lên trên (Impulse).
   * Khi thả ra, chú cá chịu lực cản của nước và trọng lực chìm dần xuống dưới theo quỹ đạo parabol mượt mà.
   * Xoay góc nghiêng chú cá theo vận tốc rơi/nổi để tăng tính chân thực.
2. **Cơ chế Đột phá 1 - Đàn cá AI Hộ tống (Boids Flocking AI Escort):**
   * Người chơi là Cá Dẫn Đầu bơi cùng một đàn cá con (3 - 5 chú cá con phát quang).
   * Đàn cá con ứng dụng thuật toán **Boids Flocking AI** (Separation, Alignment, Cohesion, Target Following).
   * **Cơ chế Hộ mệnh:** Khi va chạm nhẹ vào chướng ngại vật, một chú cá con hy sinh thay mạng người chơi.
   * **Thu thập tự động:** Đàn cá con tự động bơi tản ra hút ngọc trai và sinh vật phù du gần đó khi bơi qua.
   * Thu thập 3 viên ngọc liên tiếp sẽ hồi sinh thêm 1 chú cá con vào đàn (tối đa 5 con).
3. **Cơ chế Đột phá 2 - Cá Nóc Phình Gai Phá Đá (Puffer Dash):**
   * Nhấn phím `Shift`, `Chuột phải`, hoặc nút ảo trên màn hình để kích hoạt chế độ **Cá Nóc Phình Gai** trong 1.5 giây (tiêu hao thanh Năng lượng / Stamina).
   * Khi phình gai: Chú cá tăng kích thước, tạo luồng sóng xung kích bọc quanh thân, có khả năng **Húc vỡ vụn các tảng đá nứt / cột san hô tinh thể** chắn ngang đường để tạo lối đi tắt và nhận điểm thưởng phá vỡ chướng ngại vật (+10 điểm).
4. **Cơ chế Đột phá 3 - Cột thủy nhiệt & Hải lưu ngầm (Thermal Geysers & Currents):**
   * Xuất hiện các cột nước nóng phun trào từ đáy biển (được hiển thị bằng dải bong bóng rực sáng).
   * Khi cá lướt vào luồng thủy nhiệt: Được đẩy vọt lên cao với vận tốc xoáy lốc (Updraft Glide), giúp vượt qua những cấu trúc địa hình hiểm trở mà không cần spam phím.
5. **Hệ thống chướng ngại vật & Môi trường:**
   * Các cặp cột san hô phát quang và vách đá magma ngẫu nhiên từ trần và đáy biển.
   * Vách đá nứt (Fractured Obstacle) có thể húc vỡ bằng Puffer Dash.
6. **Hệ thống Điểm số & Thu thập (Score & Collectibles):**
   * Vượt cột an toàn: **+1 Điểm**.
   * Húc vỡ cột đá nứt: **+10 Điểm**.
   * Ngọc trai hoàng kim (Golden Pearl): **+5 Điểm** (Tự động hút bởi đàn cá con).
   * Sao biển phát quang (Bioluminescent Star): **+15 Điểm** & hồi đầy thanh Stamina.
7. **Cơ chế Thua cuộc & Chơi lại tức thì (Fail-state & Instant Restart):**
   * Va chạm khi hết cá con bảo vệ: Game Over.
   * Bấm `Space` hoặc nút `Chơi lại` để reset ván chơi tức thì.

---

### 4. TIẾN TRÌNH & ĐỘ KHÓ THÍCH ỨNG (DYNAMIC DIFFICULTY)
Nhằm giữ chân người chơi và tạo kịch tính trong thời lượng 150 phút demo:
* **Level 1 (0 – 10 điểm):** Tốc độ trôi vừa phải, khoảng cách giữa 2 cột rộng rãi, không có cột di chuyển.
* **Level 2 (11 – 25 điểm):** Tốc độ dòng chảy tăng 15%, khoảng cách khe hở hẹp lại 10%, ngọc trai xuất hiện dày hơn.
* **Level 3 (26+ điểm):** Tốc độ tăng 30%, một số cột đá ngầm dao động tịnh tiến lên xuống nhẹ nhàng (Swaying Coral), thử thách canh nhịp tối đa.

---

### 5. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)
* **Hiệu năng:** Duy trì ổn định **60 FPS** trên trình duyệt Chrome/Edge/Firefox của máy tính xách tay phổ thông.
* **Tương thích:** Tự động co giãn theo tỉ lệ màn hình (Responsive Canvas 16:9 hoặc tự căn giữa màn hình full-window).
* **Thời gian khởi động:** < 2 giây. Tất cả tài nguyên hình ảnh/âm thanh dung lượng nhẹ, load tức thì.
* **Không dùng Backend phức tạp:** Lưu High Score cục bộ trên trình duyệt thông qua `localStorage`.

---

### 6. TIÊU CHÍ NGHIỆM THU (ACCEPTANCE CRITERIA)
| Mã | Tiêu chí | Trạng thái mong đợi |
| :--- | :--- | :--- |
| **AC-01** | Điều khiển chú cá | Nhấn phím/click là cá bơi lên, thả ra cá chìm xuống mượt mà |
| **AC-02** | Spawn chướng ngại vật | Các cột sinh ra liên tục với khoảng cách hợp lý, trôi từ phải qua trái |
| **AC-03** | Tính điểm chính xác | Vượt qua cột cộng đúng 1 điểm thường; ăn ngọc trai cộng đúng 5 điểm thưởng |
| **AC-04** | Xử lý va chạm | Chạm vào cột hoặc đáy/đỉnh thì dừng game và hiển thị Game Over |
| **AC-05** | Lưu kỷ lục | High Score được lưu và hiển thị lại chuẩn xác sau khi chơi lại hoặc F5 |
| **AC-06** | Kết hợp Three.js & Phaser 4 | Hiển thị nền 3D nước sâu sống động bên dưới lớp game 2D mượt mà |

---

### 7. KẾ HOẠCH PHÂN BỔ THỜI GIAN THI CÔNG (TIMELINE 150 PHÚT)
1. **Phút 00 – 25:** Khởi tạo project (Vite), cấu hình cấu trúc thư mục, tích hợp 2 lớp canvas Three.js và Phaser 4.
2. **Phút 25 – 60:** Hiện thực cơ chế core Phaser 4: Điều khiển chú cá bơi (Arcade Physics), trọng lực, sinh cột đá ngầm, tính điểm thường.
3. **Phút 60 – 95:** Thêm điểm thưởng (Ngọc trai, sao biển), va chạm chi tiết, Game Over & Reset state.
4. **Phút 95 – 125:** Xây dựng cảnh nền Three.js 3D (Ánh sáng caustics, hạt bong bóng đại dương, chiều sâu tầng nước, san hô 3D nền).
5. **Phút 125 – 145:** Tinh chỉnh cảm giác chơi (Game feel: screen shake khi va chạm, âm thanh bơi, âm thanh ăn ngọc), lưu High Score.
6. **Phút 145 – 150:** Kiểm thử tổng thể, đóng gói và sẵn sàng thuyết trình trước BGK.

