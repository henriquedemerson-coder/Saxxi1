package com.saxxi.api.controller;

import com.saxxi.api.dto.FinanceStateDto;
import com.saxxi.api.dto.SyncResponse;
import com.saxxi.api.dto.TransacaoDto;
import com.saxxi.api.service.FinanceStateService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1")
public class TransactionController {
  private final FinanceStateService financeStateService;

  public TransactionController(FinanceStateService financeStateService) {
    this.financeStateService = financeStateService;
  }

  @GetMapping("/transactions")
  public ResponseEntity<List<TransacaoDto>> listTransactions(@AuthenticationPrincipal Jwt jwt) {
    FinanceStateDto state = financeStateService.getState(userId(jwt));
    return ResponseEntity.ok(state.transacoes());
  }

  @PostMapping("/transactions")
  public ResponseEntity<TransacaoDto> createTransaction(
      @AuthenticationPrincipal Jwt jwt,
      @Valid @RequestBody TransacaoDto transaction) {
    var result = financeStateService.addTransaction(userId(jwt), transaction);
    if (!result.created()) {
      return ResponseEntity.ok(result.transaction());
    }
    return ResponseEntity.created(URI.create("/api/v1/transactions/" + transaction.id()))
        .body(result.transaction());
  }

  @PostMapping("/sync")
  public ResponseEntity<SyncResponse> syncTransactions(
      @AuthenticationPrincipal Jwt jwt,
      @Valid @RequestBody List<@NotNull @Valid TransacaoDto> operations) {
    return ResponseEntity.ok(financeStateService.syncTransactions(userId(jwt), operations));
  }

  private UUID userId(Jwt jwt) {
    try {
      String subject = jwt.getSubject();
      if (subject == null) {
        throw new IllegalArgumentException("JWT subject ausente.");
      }
      return UUID.fromString(subject);
    } catch (IllegalArgumentException exception) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "O token não contém um usuário válido.");
    }
  }
}
