package com.hyra_ai.backend.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.hyra_ai.backend.exception.AppException;
import com.hyra_ai.backend.exception.ErrorCode;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class BrevoEmailService {

    RestTemplate restTemplate = new RestTemplate();
    String apiKey;
    String senderEmail;

    public BrevoEmailService(
            @Value("${brevo.api.key}") String apiKey, @Value("${brevo.sender.email}") String senderEmail) {
        this.apiKey = apiKey;
        this.senderEmail = senderEmail;
    }

    private static final String BREVO_API_URL =
            "https://api.brevo.com/v3/smtp/email"; // correct Brevo transactional email endpoint

    public void sendOtpEmail(String toEmail, String otpCode) {
        try {
            log.info("Sending OTP email via Brevo API to: {}", toEmail);
            log.info("OTP Code for {}: {}", toEmail, otpCode);

            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", apiKey);

            // Prepare request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("sender", Map.of("email", senderEmail, "name", "HyraTek"));
            requestBody.put("to", new Object[] {Map.of("email", toEmail, "name", "User")});
            requestBody.put("subject", "Mã xác thực OTP - HyraTek");

            String emailContent = String.format(
                    "Xin chào,\n\n" + "Mã xác thực OTP của bạn là: %s\n\n"
                            + "Mã này có hiệu lực trong 5 phút.\n"
                            + "Vui lòng không chia sẻ mã này với bất kỳ ai.\n\n"
                            + "Trân trọng,\n"
                            + "Đội ngũ HyraTek",
                    otpCode);

            requestBody.put("textContent", emailContent);
            requestBody.put("htmlContent", emailContent.replace("\n", "<br>"));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            // Send request
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.postForEntity(BREVO_API_URL, request, Map.class);

            if (response.getStatusCode() == HttpStatus.CREATED) {
                log.info("Email sent successfully to: {} via Brevo API", toEmail);
            } else {
                log.error("Failed to send email via Brevo API. Status: {}", response.getStatusCode());
                throw new AppException(ErrorCode.EMAIL_SEND_FAILED);
            }

        } catch (Exception e) {
            log.error("Failed to send email via Brevo API to: {} - Error: {}", toEmail, e.getMessage(), e);
            throw new AppException(ErrorCode.EMAIL_SEND_FAILED);
        }
    }

    public void sendAccountLockedEmail(String toEmail, String userName, String roleName) {
        try {
            log.info("Sending account locked notification email via Brevo API to: {}", toEmail);

            // Prepare headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", apiKey);

            // Prepare request body
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("sender", Map.of("email", senderEmail, "name", "HyraTek Admin"));
            requestBody.put("to", new Object[] {Map.of("email", toEmail, "name", userName != null ? userName : "User")});
            requestBody.put("subject", "Thông báo: Tài khoản của bạn đã bị khóa - HyraTek");

            String roleDisplayName = "Người dùng";
            if (roleName != null) {
                switch (roleName.toUpperCase()) {
                    case "USER":
                        roleDisplayName = "Người dùng";
                        break;
                    case "ADMIN":
                        roleDisplayName = "Quản trị viên";
                        break;
                    default:
                        roleDisplayName = "Người dùng";
                        break;
                }
            }

            String emailContent = String.format(
                    "Xin chào %s,\n\n"
                            + "Chúng tôi xin thông báo rằng tài khoản %s của bạn tại HyraTek đã bị khóa.\n\n"
                            + "Thông tin tài khoản:\n"
                            + "- Email: %s\n"
                            + "- Vai trò: %s\n\n"
                            + "Khi tài khoản bị khóa, bạn sẽ không thể đăng nhập vào hệ thống.\n\n"
                            + "Nếu bạn cho rằng đây là sự nhầm lẫn hoặc cần được hỗ trợ, vui lòng liên hệ với chúng tôi:\n"
                            + "- Email hỗ trợ: %s\n"
                            + "- Hoặc liên hệ qua hotline:  \n\n"
                            + "Chúng tôi sẽ xem xét và phản hồi yêu cầu của bạn trong thời gian sớm nhất.\n\n"
                            + "Trân trọng,\n"
                            + "Đội ngũ HyraTek",
                    userName != null ? userName : "Quý khách", roleDisplayName, toEmail, roleDisplayName, senderEmail);

            requestBody.put("textContent", emailContent);
            requestBody.put("htmlContent", emailContent.replace("\n", "<br>"));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            // Send request
            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.postForEntity(BREVO_API_URL, request, Map.class);

            if (response.getStatusCode() == HttpStatus.CREATED) {
                log.info("Account locked notification email sent successfully to: {} via Brevo API", toEmail);
            } else {
                log.error("Failed to send account locked email via Brevo API. Status: {}", response.getStatusCode());
                throw new AppException(ErrorCode.EMAIL_SEND_FAILED);
            }

        } catch (Exception e) {
            log.error(
                    "Failed to send account locked email via Brevo API to: {} - Error: {}", toEmail, e.getMessage(), e);
            // Don't throw exception here - account lock should succeed even if email fails
            // Just log the error
        }
    }

    public void sendProfileUpdatedEmail(String toEmail, String userName, String roleName) {
        if (toEmail == null || toEmail.isBlank()) {
            return;
        }

        try {
            log.info("Sending profile updated notification email via Brevo API to: {}", toEmail);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", apiKey);

            String roleDisplayName = "Người dùng";
            if (roleName != null) {
                switch (roleName.toUpperCase()) {
                    case "USER":
                        roleDisplayName = "Người dùng";
                        break;
                    case "ADMIN":
                        roleDisplayName = "Quản trị viên";
                        break;
                    default:
                        roleDisplayName = "Người dùng";
                }
            }

            String emailContent = String.format(
                    "Xin chào %s,\n\n"
                            + "Thông tin tài khoản %s của bạn tại HyraTek vừa được quản trị viên cập nhật.\n"
                            + "Nếu bạn không yêu cầu thay đổi này, vui lòng liên hệ với chúng tôi để được hỗ trợ.\n\n"
                            + "Trân trọng,\n"
                            + "Đội ngũ HyraTek",
                    userName != null && !userName.isBlank() ? userName : "Quý khách",
                    roleDisplayName);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("sender", Map.of("email", senderEmail, "name", "HyraTek Admin"));
            requestBody.put("to", new Object[] {Map.of("email", toEmail, "name", userName != null ? userName : "User")});
            requestBody.put("subject", "Thông báo cập nhật tài khoản - HyraTek");
            requestBody.put("textContent", emailContent);
            requestBody.put("htmlContent", emailContent.replace("\n", "<br>"));

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            @SuppressWarnings("rawtypes")
            ResponseEntity<Map> response = restTemplate.postForEntity(BREVO_API_URL, request, Map.class);

            if (response.getStatusCode() == HttpStatus.CREATED) {
                log.info("Profile updated notification email sent to {}", toEmail);
            } else {
                log.error("Failed to send profile updated email via Brevo API. Status: {}", response.getStatusCode());
            }
        } catch (Exception e) {
            log.error(
                    "Failed to send profile updated email via Brevo API to: {} - Error: {}",
                    toEmail,
                    e.getMessage(),
                    e);
        }
    }
}
