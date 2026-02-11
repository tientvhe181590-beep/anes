package com.anes.server.user.repository;

import com.anes.server.user.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findAllByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Payment> findByTransactionId(String transactionId);
}
