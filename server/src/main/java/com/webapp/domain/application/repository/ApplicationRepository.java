package com.webapp.domain.application.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.*;
import com.webapp.domain.application.entity.Application;
import com.webapp.domain.application.enums.ApplicationStatus;
import com.webapp.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    Page<Application> findBySender(User sender, Pageable pageable);

    Page<Application> findByReceiver(User receiver, Pageable pageable);

    Page<Application> findBySenderAndStatus(User sender, ApplicationStatus status, Pageable pageable);

    Page<Application> findByReceiverAndStatus(User receiver, ApplicationStatus status, Pageable pageable);

    Optional<Application> findBySenderAndReceiver(User sender, User receiver);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.sender.id = :senderId AND a.status = :status")
    long countBySenderIdAndStatus(@Param("senderId") Long senderId,
                                  @Param("status") ApplicationStatus status);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.receiver.id = :receiverId AND a.status = :status")
    long countByReceiverIdAndStatus(@Param("receiverId") Long receiverId,
                                    @Param("status") ApplicationStatus status);

    @Modifying
    @Query("DELETE FROM Application a WHERE a.sender.id = :userId OR a.receiver.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(a) FROM Application a WHERE a.sender.id = :senderId")
    long countBySenderId(@Param("senderId") Long senderId);

    List<Application> findAllBySenderIdOrReceiverId(Long senderId, Long receiverId);
}
