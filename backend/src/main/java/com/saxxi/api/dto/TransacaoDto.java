package com.saxxi.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record TransacaoDto(
    @NotBlank @Size(max = 80) @Pattern(regexp = "[A-Za-z0-9_-]+") String id,
    @NotNull TransactionType type,
    @NotNull @DecimalMin("0.01") BigDecimal amount,
    @NotBlank @Size(max = 160) String label,
    @Size(max = 80) String caixinhaId,
    @Size(max = 80) String sonhoId,
    @NotNull Instant date) {}
