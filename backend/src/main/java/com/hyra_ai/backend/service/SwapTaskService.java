package com.hyra_ai.backend.service;

import com.hyra_ai.backend.entity.Media;
import com.hyra_ai.backend.entity.SwapTask;
import com.hyra_ai.backend.exception.AppException;
import com.hyra_ai.backend.exception.ErrorCode;
import com.hyra_ai.backend.repository.SwapTaskRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SwapTaskService {

    SwapTaskRepository swapTaskRepository;
    final FaceFusionService faceFusionService;

    public void addMediaToTask(String taskId, Media media, String role){

        SwapTask swapTask = swapTaskRepository.findById(taskId)
                .orElseThrow(()-> new RuntimeException("Không tìm thấy phiên làm việc với ID: "+ taskId ));

        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        if(swapTask.getUser() == null || !swapTask.getUser().getEmail().equals(currentEmail)){
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        if ("source".equalsIgnoreCase(role)) {
            swapTask.setSourceImage(media);
        } else if ("target".equalsIgnoreCase(role)) {
            swapTask.setTargetMedia(media);
        } else if ("audio".equalsIgnoreCase(role)) {
            swapTask.setAudioMedia(media); // Nhận file Voice
        } else {
            // Tương thích ngược nếu không truyền role
            if("IMAGE".equalsIgnoreCase(media.getFileType())){
                swapTask.setSourceImage(media);
            } else if( "VIDEO".equalsIgnoreCase(media.getFileType())){
                swapTask.setTargetMedia(media);
            }
        }
        swapTaskRepository.save(swapTask);

        if(swapTask.getSourceImage() != null && swapTask.getTargetMedia() != null){
            faceFusionService.sendtoFaceFusion(swapTask);
        }

    }
}
