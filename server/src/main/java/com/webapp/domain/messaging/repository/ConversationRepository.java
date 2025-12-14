package com.webapp.domain.messaging.repository;

import com.webapp.domain.messaging.entity.Conversation;
import com.webapp.domain.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c WHERE " +
           "((c.participantOne.id = :userId AND c.participantOneDeleted = false) " +
           "OR (c.participantTwo.id = :userId AND c.participantTwoDeleted = false)) " +
           "ORDER BY c.lastMessageAt DESC")
    Page<Conversation> findByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT c FROM Conversation c WHERE " +
           "((c.participantOne.id = :userId AND c.participantOneDeleted = false) " +
           "OR (c.participantTwo.id = :userId AND c.participantTwoDeleted = false)) " +
           "ORDER BY c.lastMessageAt DESC")
    List<Conversation> findAllByUserId(@Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c WHERE " +
           "((c.participantOne.id = :userOneId AND c.participantTwo.id = :userTwoId) " +
           "OR (c.participantOne.id = :userTwoId AND c.participantTwo.id = :userOneId))")
    Optional<Conversation> findByParticipants(
        @Param("userOneId") Long userOneId,
        @Param("userTwoId") Long userTwoId
    );

    @Query("SELECT c FROM Conversation c WHERE " +
           "((c.participantOne.id = :userOneId AND c.participantTwo.id = :userTwoId) " +
           "OR (c.participantOne.id = :userTwoId AND c.participantTwo.id = :userOneId)) " +
           "AND c.propertyId = :propertyId")
    Optional<Conversation> findByParticipantsAndPropertyId(
        @Param("userOneId") Long userOneId,
        @Param("userTwoId") Long userTwoId,
        @Param("propertyId") Long propertyId
    );

    @Query("SELECT COUNT(c) FROM Conversation c WHERE " +
           "((c.participantOne.id = :userId AND c.participantOneUnreadCount > 0 AND c.participantOneDeleted = false) " +
           "OR (c.participantTwo.id = :userId AND c.participantTwoUnreadCount > 0 AND c.participantTwoDeleted = false))")
    int countConversationsWithUnreadMessages(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(CASE WHEN c.participantOne.id = :userId THEN c.participantOneUnreadCount " +
           "ELSE c.participantTwoUnreadCount END), 0) FROM Conversation c WHERE " +
           "((c.participantOne.id = :userId AND c.participantOneDeleted = false) " +
           "OR (c.participantTwo.id = :userId AND c.participantTwoDeleted = false))")
    int getTotalUnreadCount(@Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c WHERE c.id = :conversationId " +
           "AND ((c.participantOne.id = :userId AND c.participantOneDeleted = false) " +
           "OR (c.participantTwo.id = :userId AND c.participantTwoDeleted = false))")
    Optional<Conversation> findByIdAndUserId(
        @Param("conversationId") Long conversationId,
        @Param("userId") Long userId
    );

    @Query("SELECT c FROM Conversation c WHERE " +
           "((c.participantOne.id = :userId AND c.participantOneDeleted = false) " +
           "OR (c.participantTwo.id = :userId AND c.participantTwoDeleted = false)) " +
           "AND (LOWER(c.participantOne.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(c.participantOne.lastName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(c.participantTwo.firstName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(c.participantTwo.lastName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(c.subject) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(c.propertyTitle) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY c.lastMessageAt DESC")
    Page<Conversation> searchConversations(
        @Param("userId") Long userId,
        @Param("search") String search,
        Pageable pageable
    );

    boolean existsByParticipantOneAndParticipantTwo(User participantOne, User participantTwo);
}
