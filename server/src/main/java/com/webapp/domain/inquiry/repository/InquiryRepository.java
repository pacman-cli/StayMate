package com.webapp.domain.inquiry.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.webapp.domain.inquiry.entity.Inquiry;
import com.webapp.domain.user.entity.User;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
  Page<Inquiry> findByOwnerOrderByCreatedAtDesc(User owner, Pageable pageable);

  Page<Inquiry> findBySenderOrderByCreatedAtDesc(User sender, Pageable pageable);

  List<Inquiry> findByPropertyId(Long propertyId);
}
