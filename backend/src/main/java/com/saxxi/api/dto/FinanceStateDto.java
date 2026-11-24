package com.saxxi.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record FinanceStateDto(
    @NotNull List<@Valid CaixinhaDto> caixinhas,
    @NotNull List<@Valid SonhoDto> sonhos,
    @NotNull List<@Valid TransacaoDto> transacoes,
    boolean isPro) {

  public static FinanceStateDto empty() {
    return new FinanceStateDto(List.of(), List.of(), List.of(), true);
  }
}
