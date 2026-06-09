package com.hyra_ai.backend.service.impl;

import com.hyra_ai.backend.service.StorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.nio.channels.Channels;
import java.nio.channels.ReadableByteChannel;
import java.util.UUID;

@Primary
@Service
@Slf4j
public class CloudflareStorageService implements StorageService {

    @Autowired(required = false)
    private S3Client s3Client;

    @Value("${cloudflare.r2.bucket}")
    private String bucketName;

    @Value("${cloudflare.r2.public-url}")
    private String publicUrl;

    @Override
    public void init() {
        if (s3Client == null) {
            log.warn("S3Client is null. Please configure Cloudflare R2 credentials.");
        } else {
            log.info("Cloudflare R2 Storage Service initialized.");
        }
    }

    @Override
    public String store(MultipartFile file, String folder) {
        if (s3Client == null) {
            throw new RuntimeException("Cloudflare R2 chưa được cấu hình!");
        }
        
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Failed to store empty file.");
            }

            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
            String extension = originalFilename.contains(".") ? originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
            String filename = UUID.randomUUID().toString() + extension;
            String objectKey = folder + "/" + filename;

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            // Nếu public URL không có dấu gạch chéo ở cuối, nối thêm vào
            String baseUrl = publicUrl.endsWith("/") ? publicUrl : publicUrl + "/";
            return baseUrl + objectKey;
            
        } catch (IOException e) {
            log.error("Lỗi khi tải file lên Cloudflare R2", e);
            throw new RuntimeException("Lỗi upload: " + e.getMessage(), e);
        }
    }
    
    /**
     * Tải byte array lên Cloudflare R2 (Dùng để lưu file kết quả từ máy chủ AI)
     */
    public String uploadBytes(byte[] data, String folder, String filename) {
        if (s3Client == null) {
            throw new RuntimeException("Cloudflare R2 chưa được cấu hình!");
        }
        
        String objectKey = folder + "/" + UUID.randomUUID().toString() + "_" + filename;
        
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(objectKey)
                .build();
                
        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(data));
        
        String baseUrl = publicUrl.endsWith("/") ? publicUrl : publicUrl + "/";
        return baseUrl + objectKey;
    }

    /**
     * Tải file từ Cloudflare về máy chủ Java dưới dạng File Tạm (Temp File).
     * Phục vụ cho việc đọc file từ R2 và bắn tiếp sang các máy chủ AI (XTTS, WhisperX) 
     * thông qua Multipart FormData, sau đó File Tạm nên được xóa đi.
     */
    public java.nio.file.Path downloadToTempFile(String fileUrl) {
        try {
            // Khắc phục lỗi URL bị lưu sai trong database do lỗi trước đó
            if (fileUrl != null && fileUrl.startsWith("/uploads/http")) {
                fileUrl = fileUrl.substring("/uploads/".length());
            }
            
            URL url = new URL(fileUrl);
            String extension = fileUrl.contains(".") ? fileUrl.substring(fileUrl.lastIndexOf(".")) : ".tmp";
            
            // Xử lý query param nếu có
            if (extension.contains("?")) {
                extension = extension.substring(0, extension.indexOf("?"));
            }

            File tempFile = File.createTempFile("ai_temp_", extension);
            
            try (ReadableByteChannel rbc = Channels.newChannel(url.openStream());
                 FileOutputStream fos = new FileOutputStream(tempFile)) {
                fos.getChannel().transferFrom(rbc, 0, Long.MAX_VALUE);
            }
            
            return tempFile.toPath();
            
        } catch (Exception e) {
            log.error("Không thể tải file từ R2 về file tạm", e);
            throw new RuntimeException("Lỗi tải file R2: " + e.getMessage(), e);
        }
    }

    /**
     * Xóa toàn bộ file có chung prefix (thư mục) trên Cloudflare R2
     */
    public void deletePrefix(String prefix) {
        if (s3Client == null) return;
        try {
            software.amazon.awssdk.services.s3.model.ListObjectsV2Request listReq = software.amazon.awssdk.services.s3.model.ListObjectsV2Request.builder()
                    .bucket(bucketName)
                    .prefix(prefix)
                    .build();
            software.amazon.awssdk.services.s3.model.ListObjectsV2Response listRes = s3Client.listObjectsV2(listReq);
            for (software.amazon.awssdk.services.s3.model.S3Object s3Object : listRes.contents()) {
                s3Client.deleteObject(software.amazon.awssdk.services.s3.model.DeleteObjectRequest.builder()
                        .bucket(bucketName)
                        .key(s3Object.key())
                        .build());
            }
        } catch (Exception e) {
            log.error("Lỗi khi xóa prefix {} trên R2", prefix, e);
        }
    }
}
