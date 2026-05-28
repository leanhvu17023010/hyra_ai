package com.hyra_ai.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WhisperTaskResponse {
    private String id;
    private String audioUrl;
    private String status;
    private Integer progress;
    private String resultTxtUrl;
    private String resultSrtUrl;
    private String createdAt;
}
