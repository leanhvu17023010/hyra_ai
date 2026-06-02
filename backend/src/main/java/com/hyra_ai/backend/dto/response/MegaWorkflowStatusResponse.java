package com.hyra_ai.backend.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MegaWorkflowStatusResponse {
    String id;
    String status;
    Integer progress;
    String swapResultUrl;
    String xttsResultUrl;
    String srtResultUrl;
    String finalResultUrl;
}
