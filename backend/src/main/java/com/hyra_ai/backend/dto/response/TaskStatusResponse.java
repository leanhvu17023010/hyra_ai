package com.hyra_ai.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.HashMap;
import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TaskStatusResponse {

    String status;

    /**
     * FaceFusion có thể trả {@code 45}, {@code 45.2}, phân số {@code 0.45}, chuỗi {@code "45"}, hoặc object
     * dạng {@code {"current":1,"total":4}} — dùng {@code Object} để Jackson bind được, rồi chuẩn hoá ở service.
     */
    Object progress;

    Map<String, Object> extra = new HashMap<>();
}
