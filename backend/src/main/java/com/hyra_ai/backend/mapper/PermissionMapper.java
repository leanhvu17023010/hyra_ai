package com.hyra_ai.backend.mapper;

import org.mapstruct.Mapper;

import com.hyra_ai.backend.dto.request.PermissionRequest;
import com.hyra_ai.backend.dto.response.PermissionResponse;
import com.hyra_ai.backend.entity.Permission;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toPermission(PermissionRequest request);

    PermissionResponse toPermissionResponse(Permission permission);
}
