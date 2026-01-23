package com.webapp.domain.dashboard.controller;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.webapp.auth.exception.ResourceNotFoundException;
import com.webapp.domain.dashboard.entity.Expense;
import com.webapp.domain.dashboard.repository.ExpenseRepository;
import com.webapp.domain.property.entity.Property;
import com.webapp.domain.property.repository.PropertyRepository;
import com.webapp.domain.user.entity.User;
import com.webapp.domain.user.repository.UserRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Expenses", description = "User expense tracking")
public class ExpenseController {

  private final ExpenseRepository expenseRepository;
  private final UserRepository userRepository;
  private final PropertyRepository propertyRepository;

  @GetMapping
  @Operation(summary = "Get all expenses for current user")
  public ResponseEntity<List<ExpenseDto>> getMyExpenses(
      @AuthenticationPrincipal UserDetails userDetails) {

    User user = userRepository.findByEmail(userDetails.getUsername())
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    List<Expense> expenses = expenseRepository.findByPayerId(user.getId());
    List<ExpenseDto> dtos = expenses.stream()
        .map(this::toDto)
        .collect(Collectors.toList());

    return ResponseEntity.ok(dtos);
  }

  @GetMapping("/property/{propertyId}")
  @Operation(summary = "Get expenses for a specific property")
  public ResponseEntity<List<ExpenseDto>> getPropertyExpenses(
      @PathVariable Long propertyId) {

    List<Expense> expenses = expenseRepository.findByPropertyId(propertyId);
    List<ExpenseDto> dtos = expenses.stream()
        .map(this::toDto)
        .collect(Collectors.toList());

    return ResponseEntity.ok(dtos);
  }

  @PostMapping
  @Operation(summary = "Add a new expense")
  public ResponseEntity<ExpenseDto> addExpense(
      @AuthenticationPrincipal UserDetails userDetails,
      @Valid @RequestBody ExpenseRequest request) {

    User user = userRepository.findByEmail(userDetails.getUsername())
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    Property property = null;
    if (request.getPropertyId() != null) {
      property = propertyRepository.findById(request.getPropertyId())
          .orElse(null);
    }

    Expense expense = Expense.builder()
        .title(request.getTitle())
        .amount(request.getAmount())
        .payer(user)
        .property(property)
        .expenseDate(request.getExpenseDate() != null ? request.getExpenseDate() : LocalDate.now())
        .build();

    Expense saved = expenseRepository.save(expense);
    log.info("Created expense {} for user {}", saved.getId(), user.getId());

    return ResponseEntity.status(HttpStatus.CREATED).body(toDto(saved));
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Delete an expense")
  public ResponseEntity<Void> deleteExpense(
      @PathVariable Long id,
      @AuthenticationPrincipal UserDetails userDetails) {

    User user = userRepository.findByEmail(userDetails.getUsername())
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    Expense expense = expenseRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

    if (!expense.getPayer().getId().equals(user.getId())) {
      throw new SecurityException("Not authorized to delete this expense");
    }

    expenseRepository.delete(expense);
    log.info("Deleted expense {}", id);

    return ResponseEntity.noContent().build();
  }

  @GetMapping("/summary")
  @Operation(summary = "Get expense summary for current user")
  public ResponseEntity<ExpenseSummary> getExpenseSummary(
      @AuthenticationPrincipal UserDetails userDetails) {

    User user = userRepository.findByEmail(userDetails.getUsername())
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    List<Expense> expenses = expenseRepository.findByPayerId(user.getId());

    BigDecimal total = expenses.stream()
        .map(Expense::getAmount)
        .reduce(BigDecimal.ZERO, BigDecimal::add);

    return ResponseEntity.ok(ExpenseSummary.builder()
        .totalExpenses(total)
        .expenseCount(expenses.size())
        .build());
  }

  private ExpenseDto toDto(Expense expense) {
    return ExpenseDto.builder()
        .id(expense.getId())
        .title(expense.getTitle())
        .amount(expense.getAmount())
        .propertyId(expense.getProperty() != null ? expense.getProperty().getId() : null)
        .propertyTitle(expense.getProperty() != null ? expense.getProperty().getTitle() : null)
        .expenseDate(expense.getExpenseDate())
        .createdAt(expense.getCreatedAt())
        .build();
  }

  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class ExpenseDto {
    private Long id;
    private String title;
    private BigDecimal amount;
    private Long propertyId;
    private String propertyTitle;
    private LocalDate expenseDate;
    private java.time.LocalDateTime createdAt;
  }

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class ExpenseRequest {
    private String title;
    private BigDecimal amount;
    private Long propertyId;
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate expenseDate;
  }

  @Data
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class ExpenseSummary {
    private BigDecimal totalExpenses;
    private int expenseCount;
  }
}
