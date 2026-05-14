package com.hyra_ai.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ProcessResponse {
    @JsonProperty("task_id")
    String taskId;
    String status;
    String message;
}
