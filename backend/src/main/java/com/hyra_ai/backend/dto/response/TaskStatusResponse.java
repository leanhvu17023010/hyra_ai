package com.hyra_ai.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.HashMap;
import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TaskStatusResponse {

    String status;

    /** Một số bản FaceFusion trả trực tiếp ở root (song song với extra). */
    Integer progress;

    Map<String, Object> extra = new HashMap<>();
}
