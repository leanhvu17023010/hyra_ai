# TÀI LIỆU HƯỚNG DẪN TÍCH HỢP HYRA AI API

Tài liệu này cung cấp hướng dẫn chi tiết cho các lập trình viên (Developer) để tích hợp các dịch vụ AI của hệ thống Hyra (bao gồm Mega Workflow, XTTS và Whisper) vào ứng dụng của bên thứ 3.

---

## 1. Cơ Chế Xác Thực (Authentication)

Tất cả các API được liệt kê trong tài liệu này đều yêu cầu xác thực bằng **API Key**. 
- Bạn không cần tạo tài khoản hay đăng nhập.
- Bạn chỉ cần đính kèm API Key vào **Header** của **tất cả** các HTTP Request gửi lên server.

**Định dạng Header:**
```http
x-api-key: <Mã_API_Key_Được_Cung_Cấp>
```
*(Lưu ý: Header này phân biệt chữ hoa chữ thường. Nếu không có header này hoặc key không hợp lệ, hệ thống sẽ trả về lỗi HTTP 401 Unauthorized).*

---

## 2. Quy Trình Gọi API Chung (Cơ Chế Bất Đồng Bộ)

Vì các tác vụ AI cần thời gian xử lý khá lâu (từ vài giây đến vài phút), hệ thống sử dụng cơ chế **Asynchronous (Xử lý ngầm)**. Để lấy được kết quả, bạn luôn phải thực hiện theo quy trình 2 bước:

- **Bước 1 (Bắt đầu):** Gửi các file tài nguyên và tham số lệnh lên API `.../upload-and-start`. Hệ thống sẽ nhận file, đưa vào hàng đợi và trả về ngay lập tức một mã `taskId`.
- **Bước 2 (Kiểm tra kết quả):** Dùng `taskId` nhận được ở Bước 1 để gọi API `.../tasks/{taskId}/status`.
  - Nếu AI đang chạy, API trả về `status: "Processing"`. Bạn cần setup vòng lặp (Polling) gọi lại API này mỗi 3-5 giây.
  - Khi AI chạy xong, API trả về `status: "Complete"` (Hoặc `COMPLETED` tuỳ module) kèm theo đường link URL của file kết quả.

---

## 3. Danh Sách Các API Chi Tiết

Tất cả các đường dẫn dưới đây cần được ghép với **Base URL** của máy chủ (Ví dụ: `http://103.11.22.33:8080`).

### A. Dịch vụ Đọc Giọng Nói (XTTS)

#### 1. Khởi tạo tác vụ (Upload & Start)
- **Method:** `POST`
- **Endpoint:** `/xtts/upload-and-start`
- **Body Type:** `multipart/form-data`
- **Parameters:**
  - `file` (File, Bắt buộc): File âm thanh mẫu (giọng nói mẫu).
  - `text` (String, Bắt buộc): Đoạn văn bản cần AI đọc.
  - `language` (String, Tùy chọn): Ngôn ngữ của văn bản. Mặc định là `vi`.

**Response thành công:**
```json
{
    "code": 200,
    "message": "Upload và khởi tạo XTTS thành công",
    "result": "Mã-Task-ID-Của-Bạn"
}
```

#### 2. Lấy trạng thái & Kết quả
- **Method:** `GET`
- **Endpoint:** `/xtts/tasks/{taskId}/status`

**Response khi hoàn tất:**
```json
{
    "code": 200,
    "result": {
        "id": "Mã-Task-ID-Của-Bạn",
        "status": "Complete",
        "progress": 100,
        "resultUrl": "/uploads/user-id/XttsTask/Mã-Task/result.wav"
    }
}
```

#### 3. Hướng dẫn test bằng Postman (Dành cho Lập trình viên)

**Bước 1: Test Upload & Khởi tạo (upload-and-start)**
1. Mở Postman, tạo một Request mới.
2. Chọn Method là **POST**, nhập URL: `http://localhost:8080/hyra_ai/xtts/upload-and-start` (thay localhost bằng tên miền của bạn nếu cần).
3. Sang tab **Headers**, thêm Key: `Authorization`, Value: `Bearer <token_jwt_của_bạn>`. (Lưu ý: Tuỳ vào cấu hình bảo mật, có thể dùng `x-api-key`).
4. Sang tab **Body**, chọn loại **form-data**.
5. Thêm các trường dữ liệu sau:
   - Key: `text` | Value: `Xin chào thế giới` (Đổi type của ô Key sang Text).
   - Key: `language` | Value: `vi` (Đổi type sang Text).
   - Key: `file` | Ở ô Value bấm nút chọn file, chọn một file `.wav` giọng đọc mẫu trong máy tính của bạn (Nhớ trỏ chuột vào ô Key `file` và chọn type là **File** thay vì Text).
6. Bấm **Send**. Bạn sẽ nhận được `result` là một chuỗi Task ID (VD: `abc-123`).

**Bước 2: Test Polling Lấy tiến độ (status)**
1. Tạo một Request mới, Method là **GET**.
2. URL: `http://localhost:8080/hyra_ai/xtts/tasks/<Task_ID_Lấy_Từ_Bước_1>/status`
3. Chuyển sang tab **Headers**, gắn `Authorization` hoặc `x-api-key` tương tự Bước 1.
4. Bấm **Send** liên tục mỗi 3 giây để xem trường `progress` tăng từ `0` -> `100`.
5. Khi `status` chuyển thành `Complete`, lấy giá trị của `resultUrl` ghép với Base URL để tải/nghe kết quả.

---

### B. Dịch vụ Bóc Băng Văn Bản (WhisperX)

#### 1. Khởi tạo tác vụ (Upload & Start)
- **Method:** `POST`
- **Endpoint:** `/whisper/upload-and-start`
- **Body Type:** `multipart/form-data`
- **Parameters:**
  - `file` (File, Bắt buộc): File âm thanh hoặc video cần chuyển thành văn bản.

**Response thành công:**
```json
{
    "code": 200,
    "message": "Upload và khởi tạo Whisper thành công",
    "result": "Mã-Task-ID-Của-Bạn"
}
```

#### 2. Lấy trạng thái & Kết quả
- **Method:** `GET`
- **Endpoint:** `/whisper/tasks/{taskId}/status`

**Response khi hoàn tất:**
```json
{
    "code": 200,
    "result": {
        "id": "Mã-Task-ID-Của-Bạn",
        "status": "Complete",
        "progress": 100,
        "resultTxtUrl": "/uploads/.../result.txt",
        "resultSrtUrl": "/uploads/.../result.srt"
    }
}
```

---

### C. Dịch vụ Tích Hợp Toàn Diện (Mega Workflow)
*(Bao gồm: Facefusion + XTTS + Whisper + Khớp Audio)*

#### 1. Khởi tạo tác vụ (Upload & Start)
- **Method:** `POST`
- **Endpoint:** `/mega-workflow/upload-and-start`
- **Body Type:** `multipart/form-data`
- **Parameters:**
  - `sourceFace` (File, Bắt buộc): Hình ảnh khuôn mặt gốc muốn ghép.
  - `targetVideo` (File, Bắt buộc): Video đích sẽ bị ghép mặt.
  - `voiceSample` (File, Bắt buộc): File âm thanh mẫu cho XTTS.
  - `text` (String, Bắt buộc): Đoạn văn bản kịch bản.

**Response thành công:**
```json
{
    "code": 200,
    "message": "Upload và khởi tạo MegaTask thành công",
    "result": "Mã-Task-ID-Của-Bạn"
}
```

#### 2. Lấy trạng thái & Kết quả
- **Method:** `GET`
- **Endpoint:** `/mega-workflow/tasks/{taskId}/status`

**Response khi hoàn tất:**
```json
{
    "code": 200,
    "result": {
        "id": "Mã-Task-ID-Của-Bạn",
        "status": "COMPLETED",
        "progress": 100,
        "finalResultUrl": "/uploads/user-id/MegaTask/Mã-Task/final_result.mp4"
    }
}
```

---

## 4. Tải Xuống File Kết Quả

Tất cả các kết quả trả về trong JSON (như `resultUrl`, `resultSrtUrl`, `finalResultUrl`) đều là đường dẫn tương đối (Relative Path). 

Để tải hoặc xem trực tiếp file trên trình duyệt, Dev cần ghép Base URL của máy chủ với đường dẫn này.
**Ví dụ:**
Nếu Base URL là `http://api.domain.com` và kết quả là `/uploads/123/result.mp4`.
Link tải file cuối cùng sẽ là: `http://api.domain.com/uploads/123/result.mp4`

---
*Lưu ý: Hệ thống sẽ tự động dọn dẹp các tệp tin lưu trữ cũ trên máy chủ. Mọi file kết quả đều chỉ có hiệu lực tải xuống trong vòng **3 ngày** kể từ khi tác vụ hoàn tất. Lập trình viên nên code kịch bản tự động tải file về hệ thống nội bộ ngay khi API báo trạng thái "Complete".*
