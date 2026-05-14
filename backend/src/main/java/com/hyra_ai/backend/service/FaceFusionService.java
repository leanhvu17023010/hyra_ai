package com.hyra_ai.backend.service;

import com.hyra_ai.backend.dto.response.ProcessResponse;
import com.hyra_ai.backend.entity.SwapTask;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.nio.file.Path;
import java.nio.file.Paths;

@Service
@RequiredArgsConstructor
@Slf4j
public class FaceFusionService {
    private final WebClient faceFusionWebClient;

    @Async
    public void sendtoFaceFusion(SwapTask swapTask){
        try{
            log.info("Chuẩn bị gửi file sang FaceFusion cho SwapTask: {}", swapTask.getId());


            // Lay duong dan
            String sourceRelativePath = swapTask.getSourceImage().getUrl().substring(9);
            String targetRelativePath = swapTask.getSourceVideo().getUrl().substring(9);

            Path sourceFile = Paths.get("uploads", sourceRelativePath);
            Path targetFile = Paths.get("uploads", targetRelativePath);

            // Build form du lieu gui di
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("source_file", new FileSystemResource(sourceFile));
            builder.part("target_file", new FileSystemResource(targetFile));
            builder.part("processors", "face_swapper");

            log.info("Test: Da den ham gui file cho Task: {}", swapTask.getId() );

            // Goi api facefusion
            ProcessResponse response = faceFusionWebClient.post().uri("/api/process")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                        .bodyValue(builder.build())
                        .retrieve()
                    .bodyToMono(ProcessResponse.class)
                        .block();
            log.info("Facefusion đã nhận task, ID bên đó là: {}", response.getTaskId() );
//             cap nhat trang thai swaptask thanh processing
        } catch (Exception e){
            log.error("Lỗi khi kết nối với FaceFusion", e);
        }
    }
}
