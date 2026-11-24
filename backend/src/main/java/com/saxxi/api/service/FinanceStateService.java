package com.saxxi.api.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.saxxi.api.dto.FinanceStateDto;
import com.saxxi.api.dto.SyncResponse;
import com.saxxi.api.dto.TransacaoDto;
import com.saxxi.api.entity.UserFinance;
import com.saxxi.api.repository.UserFinanceRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FinanceStateService {
  private static final String EMPTY_STATE =
      "{\"caixinhas\":[],\"sonhos\":[],\"transacoes\":[],\"isPro\":true}";

  private final UserFinanceRepository repository;
  private final ObjectMapper objectMapper;

  public FinanceStateService(UserFinanceRepository repository, ObjectMapper objectMapper) {
    this.repository = repository;
    this.objectMapper = objectMapper;
  }

  @Transactional
  public FinanceStateDto getState(UUID userId) {
    return readState(lockState(userId));
  }

  @Transactional
  public AddTransactionResult addTransaction(UUID userId, TransacaoDto transaction) {
    UserFinance finance = lockState(userId);
    FinanceStateDto state = readState(finance);

    for (TransacaoDto existing : state.transacoes()) {
      if (existing.id().equals(transaction.id())) {
        return new AddTransactionResult(existing, false);
      }
    }

    List<TransacaoDto> updatedTransactions = new ArrayList<>();
    updatedTransactions.add(transaction);
    updatedTransactions.addAll(state.transacoes());
    writeState(finance, new FinanceStateDto(
        state.caixinhas(), state.sonhos(), updatedTransactions, state.isPro()));
    return new AddTransactionResult(transaction, true);
  }

  @Transactional
  public SyncResponse syncTransactions(UUID userId, List<TransacaoDto> operations) {
    UserFinance finance = lockState(userId);
    FinanceStateDto state = readState(finance);
    Set<String> knownIds = new HashSet<>();
    state.transacoes().forEach(transaction -> knownIds.add(transaction.id()));

    List<TransacaoDto> accepted = new ArrayList<>();
    int duplicates = 0;
    for (TransacaoDto operation : operations) {
      if (knownIds.add(operation.id())) {
        accepted.add(operation);
      } else {
        duplicates++;
      }
    }

    if (!accepted.isEmpty()) {
      List<TransacaoDto> updatedTransactions = new ArrayList<>(accepted);
      updatedTransactions.addAll(state.transacoes());
      writeState(finance, new FinanceStateDto(
          state.caixinhas(), state.sonhos(), updatedTransactions, state.isPro()));
    }
    return new SyncResponse(accepted.size(), duplicates);
  }

  private UserFinance lockState(UUID userId) {
    repository.createIfAbsent(userId, EMPTY_STATE);
    return repository.findByUserIdForUpdate(userId)
        .orElseThrow(() -> new IllegalStateException("Não foi possível carregar o estado financeiro."));
  }

  private FinanceStateDto readState(UserFinance finance) {
    try {
      return objectMapper.treeToValue(finance.getData(), FinanceStateDto.class);
    } catch (JsonProcessingException exception) {
      throw new IllegalStateException("O estado financeiro armazenado possui formato inválido.", exception);
    }
  }

  private void writeState(UserFinance finance, FinanceStateDto state) {
    JsonNode json = objectMapper.valueToTree(state);
    finance.setData(json);
    finance.setUpdatedAt(Instant.now());
  }

  public record AddTransactionResult(TransacaoDto transaction, boolean created) {}
}
