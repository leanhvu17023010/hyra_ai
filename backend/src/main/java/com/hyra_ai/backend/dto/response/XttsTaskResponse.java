package com.hyra_ai.backend.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class XttsTaskResponse {
    String id;
    String text;
    String speakerWavUrl;
    String language;
    String status;
    String resultUrl;
    String createdAt;
}
