package com.webapp.domain.roommate;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RoommateRequestRepository extends JpaRepository<RoommateRequest, Long> {

  @Query("SELECT r FROM RoommateRequest r WHERE (r.requester.id = :userId AND r.receiver.id = :targetId) OR (r.requester.id = :targetId AND r.receiver.id = :userId)")
  Optional<RoommateRequest> findExistingRequest(@Param("userId") Long userId, @Param("targetId") Long targetId);

  List<RoommateRequest> findByReceiverIdAndStatus(Long receiverId, RoommateRequestStatus status);

  List<RoommateRequest> findByRequesterId(Long requesterId);

  List<RoommateRequest> findByReceiverId(Long receiverId);

  @org.springframework.data.jpa.repository.Modifying
  @org.springframework.data.jpa.repository.Query("DELETE FROM RoommateRequest r WHERE r.requester.id = :userId OR r.receiver.id = :userId")
  void deleteAllByUserId(@Param("userId") Long userId);
}
