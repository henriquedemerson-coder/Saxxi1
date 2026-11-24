package com.saxxi.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CaixinhaDto(
    @NotBlank @Size(max = 80) String id,
    @NotBlank @Size(max = 100) String label,
    @NotBlank @Size(max = 16) String emoji) {}
