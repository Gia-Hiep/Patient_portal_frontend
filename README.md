# US-11 – Doctor Chat Automation Test

##  Mô tả
Automation test cho **US-11: Trả lời tin nhắn từ bệnh nhân**  
Sử dụng **Selenium WebDriver (Java)** để kiểm tra:

- Đăng nhập bác sĩ
- Điều hướng trang Doctor Chat
- Gửi tin nhắn
- Hiển thị tin nhắn ngay sau khi gửi
- Reload trang vẫn còn dữ liệu (DB persist)

---

##  Công nghệ sử dụng
- Java 24
- Selenium WebDriver 4.x
- Chrome + ChromeDriver
- Eclipse IDE

---

##  Test Flow
1. Login với tài khoản **doctor01**
2. Vào Dashboard
3. Click chức năng **Tin nhắn (US11)**
4. Chọn bệnh nhân
5. Gửi tin nhắn
6. Kiểm tra tin hiển thị
7. Reload trang
8. Xác nhận tin nhắn vẫn tồn tại

---

##  Kết quả
- PASS: Login thành công
- PASS: Gửi và hiển thị tin nhắn
- PASS: Reload không mất dữ liệu

---

##  Evidence
Xem log console trong Eclipse:
3561515 (US11: add Selenium automation test for doctor chat (send, receive, display))
