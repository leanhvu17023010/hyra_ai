# HYRA AI Backend API Overview

Base URL (local):

- `http://localhost:8080/hyra_ai`

Response wrapper format:

```json
{
  "code": 1000,
  "message": "Success",
  "result": {}
}
```

---

## 1) Authentication APIs (`/auth`)

### Public endpoints

- `POST /auth/token`
  - body:
    ```json
    { "email": "user@example.com", "password": "P@ssw0rd!" }
    ```
  - result:
    ```json
    { "token": "jwt", "refreshToken": "jwt", "authenticated": true }
    ```

- `POST /auth/google`
  - body:
    ```json
    { "idToken": "google-id-token", "email": "user@example.com", "fullName": "User Name" }
    ```

- `POST /auth/introspect`
  - body:
    ```json
    { "token": "jwt" }
    ```

- `POST /auth/refresh`
  - body:
    ```json
    { "token": "refresh-token" }
    ```

- `POST /auth/logout`
  - body:
    ```json
    { "token": "jwt-or-refresh-token" }
    ```

- `POST /auth/send-otp?email={email}&mode={register|forgot}`
- `POST /auth/verify-otp`
  - body:
    ```json
    { "email": "user@example.com", "otp": "123456" }
    ```
- `POST /auth/reset-password`
  - body:
    ```json
    { "email": "user@example.com", "otp": "123456", "newPassword": "P@ssw0rd!" }
    ```
- `POST /auth/set-password-google`
  - body:
    ```json
    { "email": "user@example.com", "otp": "123456", "newPassword": "P@ssw0rd!" }
    ```

- `GET /auth/check-google-user?email={email}`

### Protected endpoints

- `POST /auth/change-password`
  - header: `Authorization: Bearer <access_token>`
  - body:
    ```json
    { "currentPassword": "OldP@ssw0rd!", "newPassword": "NewP@ssw0rd!" }
    ```

---

## 2) User APIs (`/users`)

### Public endpoints

- `POST /users` (register customer)
  - body:
    ```json
    {
      "email": "user@example.com",
      "password": "P@ssw0rd!",
      "fullName": "User Name",
      "phoneNumber": "0901234567",
      "address": "HCM City"
    }
    ```

### Protected endpoints

- `POST /users/staff`
- `GET /users`
- `GET /users/my-info`
- `GET /users/{userId}`
- `PUT /users/{userId}`
- `DELETE /users/{userId}`
- `GET /users/roles`

All protected user APIs require:

- header: `Authorization: Bearer <access_token>`

---

## 3) Role APIs (`/roles`) - protected

- `POST /roles`
- `GET /roles`
- `DELETE /roles/{role}`

---

## 4) Permission APIs (`/permissions`) - protected

- `POST /permissions`
- `GET /permissions`
- `DELETE /permissions/{permission}`

---

## FE Integration Checklist

- Set FE env: `VITE_API_BASE_URL=http://localhost:8080/hyra_ai`
- Login flow:
  1. `POST /auth/token`
  2. Save `result.token` and `result.refreshToken`
  3. Send `Authorization: Bearer ...` for protected APIs
