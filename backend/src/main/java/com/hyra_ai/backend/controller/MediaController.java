package com.hyra_ai.backend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.hyra_ai.backend.dto.request.ApiResponse;
import com.hyra_ai.backend.entity.Media;
import com.hyra_ai.backend.repository.MediaRepository;
import com.hyra_ai.backend.service.StorageService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/media")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class MediaController {

    StorageService storageService;
    MediaRepository mediaRepository;

    @PostMapping("/upload")
    public ApiResponse<Media> uploadFile(@RequestParam("file") MultipartFile file) {
        
        try {
            String contentType = file.getContentType();
            String type = "IMAGE";
            String folder = "img";

            if (contentType != null && contentType.startsWith("video/")) {
                type = "VIDEO";
                folder = "video";
            } else if (contentType != null && contentType.startsWith("image/")) {
                type = "IMAGE";
                folder = "img";
            } else {
                // Fallback check by extension if content type is generic
                String fileName = file.getOriginalFilename();
                if (fileName != null && (fileName.endsWith(".mp4") || fileName.endsWith(".mov") || fileName.endsWith(".avi"))) {
                    type = "VIDEO";
                    folder = "video";
                }
            }

            String filePath = storageService.store(file, folder);
            
            // Generate URL (relative to context path)
            String url = "/uploads/" + filePath;
            
            Media media = Media.builder()
                    .fileName(file.getOriginalFilename())
                    .fileType(type.toUpperCase())
                    .url(url)
                    .build();
            
            Media savedMedia = mediaRepository.save(media);
            
            return ApiResponse.<Media>builder()
                    .code(200)
                    .message("Upload successful")
                    .result(savedMedia)
                    .build();
            
        } catch (Exception e) {
            log.error("Upload failed", e);
            return ApiResponse.<Media>builder()
                    .code(500)
                    .message("Upload failed: " + e.getMessage())
                    .build();
        }
    }
}
