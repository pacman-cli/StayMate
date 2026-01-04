package com.webapp.domain.application.repository;

import com.webapp.domain.application.entity.Application;
import com.webapp.domain.application.enums.ApplicationStatus;
import com.webapp.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

        Page<Application> findBySender(User sender, Pageable pageable);

        Page<Application> findByReceiver(User receiver, Pageable pageable);

        Page<Application> findBySenderAndStatus(User sender, ApplicationStatus status, Pageable pageable);

        Page<Application> findByReceiverAndStatus(User receiver, ApplicationStatus status, Pageable pageable);

        Optional<Application> findBySenderAndReceiver(User sender, User receiver);

        @org.springframework.data.jpa.repository.Query("SELECT COUNT(a) FROM Application a WHERE a.sender.id = :senderId AND a.status = :status")
        long countBySenderIdAndStatus(@org.springframework.data.repository.query.Param("senderId") Long senderId,
                        @org.springframework.data.repository.query.Param("status") ApplicationStatus status);

        @org.springframework.data.jpa.repository.Query("SELECT COUNT(a) FROM Application a WHERE a.receiver.id = :receiverId AND a.status = :status")
        long countByReceiverIdAndStatus(@org.springframework.data.repository.query.Param("receiverId") Long receiverId,
                        @org.springframework.data.repository.query.Param("status") ApplicationStatus status);

        @org.springframework.data.jpa.repository.Modifying
        @org.springframework.data.jpa.repository.Query("DELETE FROM Application a WHERE a.sender.id = :userId OR a.receiver.id = :userId")
        void deleteByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);

        @org.springframework.data.jpa.repository.Query("SELECT COUNT(a) FROM Application a WHERE a.sender.id = :senderId")
        long countBySenderId(@org.springframework.data.repository.query.Param("senderId") Long senderId);

        java.util.List<Application> findAllBySenderIdOrReceiverId(Long senderId, Long receiverId);
}
