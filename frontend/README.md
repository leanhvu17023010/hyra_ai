# Hyra AI Frontend

Giao diện người dùng (Front-end) của hệ thống **Hyra AI** được phát triển trên nền tảng **React**, sử dụng công cụ build **Vite** để đạt hiệu năng tối ưu, kết hợp với **Tailwind CSS** cho thiết kế giao diện và **Zustand** cho quản lý trạng thái toàn cục.

---

## Yêu cầu hệ thống

### Node.js
- **Khuyến nghị**: Node.js v18 trở lên (ví dụ v18.x, v20.x, v22.x)
- **Kiểm tra phiên bản**: `node -v`

### Trình quản lý gói (Package Manager)
- Sử dụng **npm** (đi kèm khi cài đặt Node.js) hoặc **Yarn**.
- **Kiểm tra phiên bản**: `npm -v` hoặc `yarn -v`

---


## Cài đặt và chạy thử (Local)

### 1. Cài đặt các thư viện phụ thuộc (Dependencies)
Di chuyển vào thư mục `frontend` và cài đặt các package:
```bash
npm install
# Hoặc nếu dùng yarn
yarn install
```

### 2. Cấu hình biến môi trường (Environment Variables)
Tạo file `.env` tại thư mục gốc của dự án `frontend` (bạn có thể sao chép từ `.env.example` nếu có):
```env
VITE_API_BASE_URL=http://localhost:8080/hyra_ai
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```
- `VITE_API_BASE_URL`: Địa chỉ API của Backend (mặc định chạy tại port 8080 với context-path `/hyra_ai`).
- `VITE_GOOGLE_CLIENT_ID`: Client ID phục vụ tính năng Đăng nhập qua Google (Google OAuth2).

### 3. Khởi chạy dự án ở môi trường Development
Chạy lệnh sau để bật Server xem trước cục bộ (HMR):
```bash
npm run dev
# Hoặc nếu dùng yarn
yarn dev
```
Mặc định ứng dụng sẽ chạy tại địa chỉ: [http://localhost:5173](http://localhost:5173).

### 4. Build sản phẩm cho môi trường Production
Build mã nguồn tối ưu hóa dung lượng:
```bash
npm run build
```
Sau khi build xong, kết quả sẽ nằm trong thư mục `dist`. Bạn có thể chạy thử build production bằng lệnh:
```bash
npm run preview
```

---

## Cấu trúc thư mục mã nguồn

```text
frontend/
├── public/                 # Các tài nguyên tĩnh (static assets)
├── src/
│   ├── assets/             # Hình ảnh, icon tĩnh
│   ├── components/         # Các component tái sử dụng
│   │   ├── auth/           # Modals xác thực (Login, Register, OTP, Forgot)
│   │   ├── home/           # Các phần trang chủ (Hero, Stats, FAQ, Guide)
│   │   ├── layout/         # Layout chung (Navbar, Footer)
│   │   ├── profile/        # Quản lý hồ sơ cá nhân (Đổi mật khẩu, lịch sử)
│   │   └── swap/           # Các công cụ AI Swap (Video, Image, Voice Lip Sync)
│   ├── hooks/              # Custom React hooks
│   ├── layouts/            # Cấu trúc layout chính (MainLayout)
│   ├── pages/              # Các trang hiển thị chính (HomePage, AdminDashboard)
│   ├── routes/             # Cấu hình định tuyến (React Router)
│   ├── services/           # Trình gọi API và xử lý bất đồng bộ (Axios API Client)
│   ├── store/              # Quản lý state tập trung (Zustand: authStore, uiStore)
│   └── utils/              # Tiện ích chung, kiểm tra dữ liệu đầu vào (Validation)
├── .env.example            # Bản mẫu biến môi trường
├── tailwind.config.js      # Cấu hình Tailwind CSS
└── vite.config.js          # Cấu hình Vite bundler
```

---

## Các tính năng & Công nghệ chính

### 1. Công nghệ lõi
- **State Management**: **Zustand** giúp quản lý và đồng bộ trạng thái đăng nhập (`authStore`) và giao diện modal (`uiStore`) hiệu quả, hạn chế tình trạng re-render dư thừa.
- **Animations**: **Framer Motion** mang lại các hiệu ứng chuyển động mượt mà cho popup, modal đăng nhập/đăng ký.
- **API Client**: **Axios** kết hợp với Request Interceptor tự động gán Bearer Token khi gọi API và Response Interceptor tự động xử lý khi Token hết hạn (Lỗi `401 Unauthorized`).

### 2. Luồng bảo mật & Phân quyền
- **Giao thức định tuyến bảo mật**: Tự động chuyển hướng người dùng khi cố truy cập trái phép hoặc khi Token hết hạn.
- **Phân quyền Quản trị viên (ADMIN)**:
  - Khi quản trị viên đăng nhập thành công qua form hoặc Google, hệ thống sẽ xác thực và tự động đưa thẳng vào trang Quản trị (`/admin`).
  - Hạn chế quyền quay lại trang chủ của user thường bằng cách khóa định tuyến bảo vệ `/admin`.
  - Logo và các liên kết điều hướng sẽ tự động trỏ về `/admin` đối với tài khoản ADMIN để duy trì quyền điều hành.

### 3. Các chức năng AI Swap
- **Image Swap**: Đổi khuôn mặt trên hình ảnh.
- **Video Swap**: Đổi khuôn mặt trên video gốc.
- **Text-to-Speech (TTS)**: Chuyển đổi văn bản thành giọng nói tiếng Việt với nhiều tùy chọn.
- **Lip Sync & Voice Clone**: Lồng tiếng trực tiếp từ file âm thanh có sẵn kết hợp khớp khẩu hình khuôn mặt nhân vật trong video gốc.

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

npm install react react-dom react-router-dom react-icons tailwindcss @tailwindcss/vite

npm install -D vite @vitejs/plugin-react eslint @eslint/js eslint-plugin-react-hooks eslint-plugin-react-refresh globals @types/react @types/react-dom

npm install yup

npm install framer-motion

npm install zustand

