TEST AUTOMATION – CHAT MODULE
(US-8 & US-11)
1. Thông tin chung

Môn học: Kiểm thử phần mềm / CNPM

Người thực hiện: Hoàng Hưng

Branch Git: HoangHung/TestAutomation

Công nghệ kiểm thử:

Java

Selenium WebDriver

ChromeDriver

Eclipse IDE

GitHub

2. Môi trường kiểm thử
Thành phần	Giá trị
OS	Windows 11
Browser	Google Chrome
Selenium	4.x
Backend	Spring Boot
Frontend	ReactJS
URL hệ thống	http://localhost:3000
IDE	Eclipse
3. Tài khoản test
👤 Patient

Username: hiepcc22

Password: anhhiepdz

👨‍⚕️ Doctor

Username: doctor01

Password: anhhiepdz

Bác sĩ test: BS. Lê Văn C

4. Phạm vi kiểm thử
✔ Đã kiểm thử

Chat giữa Patient – Doctor

Gửi tin nhắn

Hiển thị lịch sử chat

Reload trang vẫn giữ dữ liệu

Phân quyền Patient / Doctor

❌ Không kiểm thử

Upload file / hình ảnh

Performance / Load test

🔹 USER STORY 08 (US-8)
Patient chat với bác sĩ
🎯 Mục tiêu

Kiểm tra bệnh nhân có thể:

Gửi tin nhắn cho bác sĩ

Xem lại lịch sử chat

Reload trang mà tin nhắn vẫn còn

🔄 Test Flow – US-8

Login với tài khoản Patient

Truy cập /chat

Chọn bác sĩ từ dropdown

Nhập nội dung tin nhắn

Nhấn Gửi

Kiểm tra tin nhắn hiển thị

Reload trang

Kiểm tra tin nhắn vẫn tồn tại

📄 Test Case Summary – US-8
TC ID	Mô tả	Expected Result
US8_TC_01	Gửi tin nhắn	Tin hiển thị
US8_TC_02	Reload trang	Tin vẫn tồn tại
US8_TC_03	Persist dữ liệu	PASS

👉 Kết quả: ✅ PASS 100%

📂 Source Code – US-8
src/
└── us8/
    └── PatientChatTest.java

🔹 USER STORY 11 (US-11)
Doctor trả lời tin nhắn từ bệnh nhân
🎯 Mục tiêu

Kiểm tra bác sĩ có thể:

Xem danh sách bệnh nhân

Xem lịch sử chat

Trả lời tin nhắn

Reload vẫn còn dữ liệu

Đảm bảo phân quyền đúng

🔄 Test Flow – US-11

Login với tài khoản Doctor

Truy cập /doctor-chat

Chọn bệnh nhân

Gửi tin nhắn trả lời

Kiểm tra tin hiển thị

Reload trang

Kiểm tra tin vẫn tồn tại

📄 Test Case Summary – US-11
TC ID	Mô tả	Expected Result
US11_TC_01	Doctor gửi tin	Tin hiển thị
US11_TC_02	Reload	Tin còn
US11_TC_03	Security	401 nếu sai token

👉 Kết quả: ✅ PASS 100%

📂 Source Code – US-11
src/
└── us11/
    └── DoctorChatTest.java

5. Cách chạy test automation
🔹 Chuẩn bị

Backend + Frontend đang chạy (localhost:3000)

Chrome + ChromeDriver đã cài

Import project vào Eclipse

🔹 Chạy US-8

Run PatientChatUS8Test.java

Run As → Java Application

🔹 Chạy US-11

Run DoctorChatTest.java

Run As → Java Application

6. Kết quả thực thi

Console output mong đợi:
✅ Đăng nhập thành công
✅ Đã chuyển đến trang /chat
✅ Đã chọn bác sĩ
✅ Đã gửi và hiển thị tin nhắn
✅ Tải lại trang vẫn còn tin nhắn
🎉 TEST PASSED 100%