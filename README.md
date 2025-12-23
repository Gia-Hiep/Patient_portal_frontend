HEAD
# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
=======
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
