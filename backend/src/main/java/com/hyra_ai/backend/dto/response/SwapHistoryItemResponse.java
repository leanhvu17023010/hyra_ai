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
public class SwapHistoryItemResponse {
    String id;
    String resultUrl;
    /** "image" hoặc "video" — suy từ đuôi file kết quả. */
    String mediaType;
    String status;
    String createdAt;
}
