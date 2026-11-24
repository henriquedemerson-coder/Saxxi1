package com.saxxi.api.repository;

import com.saxxi.api.entity.UserFinance;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserFinanceRepository extends JpaRepository<UserFinance, UUID> {
  @Modifying
  @Query(value = """
      INSERT INTO public.user_finances (user_id, data, updated_at)
      VALUES (:userId, CAST(:data AS jsonb), now())
      ON CONFLICT (user_id) DO NOTHING
      """, nativeQuery = true)
  int createIfAbsent(@Param("userId") UUID userId, @Param("data") String data);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select finance from UserFinance finance where finance.userId = :userId")
  Optional<UserFinance> findByUserIdForUpdate(@Param("userId") UUID userId);
}
