package com.hyra_ai.backend.dto.response;

import lombok.Data;

import java.util.HashMap;
import java.util.Map;

@Data
public class TaskStatusResponse {

    String status;
    Map<String, Object> extra = new HashMap<>();
}
