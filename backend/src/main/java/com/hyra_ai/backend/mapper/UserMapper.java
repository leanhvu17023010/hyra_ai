package com.hyra_ai.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.hyra_ai.backend.dto.request.UserCreationRequest;
import com.hyra_ai.backend.dto.request.UserUpdateRequest;
import com.hyra_ai.backend.dto.response.UserResponse;
import com.hyra_ai.backend.entity.User;

@Mapper(componentModel = "spring")
public interface UserMapper {

    // Request to Entity
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "userName", ignore = true)
    @Mapping(target = "createAt", ignore = true)
    @Mapping(target = "role", ignore = true)
    User toUser(UserCreationRequest request);

    // Entity to Response
    @Mapping(target = "role", source = "role")
    @Mapping(target = "active", expression = "java(user.isActive())") // Map from User.isActive() to UserResponse.active
    UserResponse toUserResponse(User user);

    // Update Entity
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "email", ignore = true)
    @Mapping(target = "userName", ignore = true)
    @Mapping(target = "createAt", ignore = true)
    @Mapping(target = "role", ignore = true)
    void updateUser(@MappingTarget User user, UserUpdateRequest request);
}
