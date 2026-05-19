package com.hyra_ai.backend.controller;

import com.hyra_ai.backend.repository.UserRepository;
import com.hyra_ai.backend.service.SwapTaskService;
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
    SwapTaskService swapTaskService;
    com.hyra_ai.backend.repository.SwapTaskRepository swapTaskRepository;
    com.hyra_ai.backend.repository.UserRepository userRepository;

    @PostMapping("/upload")
    public ApiResponse<Media> uploadFile(@RequestParam("file") MultipartFile file,
                                         @RequestParam(value = "taskId", required = false) String taskId,
                                         @RequestParam(value = "role", required = false) String role ) {

        try {
            String contentType = file.getContentType();
            String type = "IMAGE";

            // BƯỚC 1: Chỉ xác định Loại File (Type) để lưu Database
            if (contentType != null && contentType.startsWith("video/")) {
                type = "VIDEO";
            } else if (contentType != null && contentType.startsWith("image/")) {
                type = "IMAGE";
            } else if (contentType != null && contentType.startsWith("audio/")) {
                type = "AUDIO";
            } else {
                String fileName = file.getOriginalFilename();
                if (fileName != null) {
                    String lowerCaseName = fileName.toLowerCase();
                    if (lowerCaseName.endsWith(".mp4") || lowerCaseName.endsWith(".mov") || lowerCaseName.endsWith(".avi")) {
                        type = "VIDEO";
                    } else if (lowerCaseName.endsWith(".mp3") || lowerCaseName.endsWith(".wav") || lowerCaseName.endsWith(".ogg") || lowerCaseName.endsWith(".m4a")) {
                        type = "AUDIO";
                    }
                }
            }

            // BƯỚC 2: Tính toán đường dẫn động (Folder)
            String folder = "library";
            if (taskId != null && !taskId.isEmpty()) {
                com.hyra_ai.backend.entity.SwapTask task = swapTaskRepository.findById(taskId).orElse(null);
                if (task != null && task.getUser() != null) {
                    folder = task.getUser().getId() + "/" + taskId;
                }
            } else {
                String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
                com.hyra_ai.backend.entity.User user = userRepository.findByEmail(email).orElse(null);
                if (user != null) {
                    folder = user.getId() + "/library";
                }
            }

            // BƯỚC 3: Lưu file xuống ổ cứng
            String filePath = storageService.store(file, folder);

            String url = "/uploads/" + filePath;

            Media media = Media.builder()
                    .fileName(file.getOriginalFilename())
                    .fileType(type.toUpperCase())
                    .url(url)
                    .build();

            Media savedMedia = mediaRepository.save(media);

            if(taskId != null && !taskId.isEmpty()){
                swapTaskService.addMediaToTask(taskId, savedMedia, role);
            }

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
