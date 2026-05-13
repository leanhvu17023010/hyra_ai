package com.hyra_ai.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    void init();
    String store(MultipartFile file, String folder);
}
