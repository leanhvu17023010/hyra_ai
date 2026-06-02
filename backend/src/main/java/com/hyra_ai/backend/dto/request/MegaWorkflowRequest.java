package com.hyra_ai.backend.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MegaWorkflowRequest {
    String sourceFaceId;
    String targetVideoId;
    String voiceSampleId;
    String inputText;
}
