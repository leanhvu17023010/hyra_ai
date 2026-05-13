package com.hyra_ai.backend.service.impl;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import jakarta.annotation.PostConstruct;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.hyra_ai.backend.service.StorageService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class FileSystemStorageService implements StorageService {

    private final Path rootLocation = Paths.get("uploads");

    @Override
    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootLocation);
            Files.createDirectories(rootLocation.resolve("img"));
            Files.createDirectories(rootLocation.resolve("video"));
        } catch (IOException e) {
            log.error("Could not initialize storage", e);
            throw new RuntimeException("Could not initialize storage", e);
        }
    }

    @Override
    public String store(MultipartFile file, String folder) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Failed to store empty file.");
            }
            
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = UUID.randomUUID().toString() + extension;
            
            Path destinationFile = this.rootLocation.resolve(folder)
                    .resolve(Paths.get(filename))
                    .normalize().toAbsolutePath();
            
            if (!destinationFile.getParent().equals(this.rootLocation.resolve(folder).toAbsolutePath())) {
                // This is a security check
                throw new RuntimeException("Cannot store file outside current directory.");
            }
            
            file.transferTo(destinationFile);
            
            return folder + "/" + filename;
        } catch (IOException e) {
            log.error("Failed to store file.", e);
            throw new RuntimeException("Failed to store file.", e);
        }
    }
}
