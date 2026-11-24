package com.saxxi.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record SonhoDto(
    @NotBlank @Size(max = 80) String id,
    @NotBlank @Size(max = 120) String title,
    @NotBlank @Size(max = 16) String emoji,
    @NotNull @DecimalMin("0.00") BigDecimal current,
    @NotNull @DecimalMin("0.01") BigDecimal target,
    @NotBlank @Size(max = 120) String tag) {}
