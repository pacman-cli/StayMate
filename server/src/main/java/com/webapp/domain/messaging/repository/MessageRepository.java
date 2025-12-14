package com.webapp.domain.messaging.repository;

import com.webapp.domain.messaging.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId " +
           "AND ((m.sender.id = :userId AND m.deletedBySender = false) " +
           "OR (m.recipient.id = :userId AND m.deletedByRecipient = false)) " +
           "ORDER BY m.createdAt DESC")
    Page<Message> findByConversationIdAndUserId(
        @Param("conversationId") Long conversationId,
        @Param("userId") Long userId,
        Pageable pageable
    );

    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId " +
           "AND ((m.sender.id = :userId AND m.deletedBySender = false) " +
           "OR (m.recipient.id = :userId AND m.deletedByRecipient = false)) " +
           "ORDER BY m.createdAt ASC")
    List<Message> findAllByConversationIdAndUserId(
        @Param("conversationId") Long conversationId,
        @Param("userId") Long userId
    );

    @Query("SELECT COUNT(m) FROM Message m WHERE m.recipient.id = :userId " +
           "AND m.read = false AND m.deletedByRecipient = false")
    int countUnreadByRecipientId(@Param("userId") Long userId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.conversation.id = :conversationId " +
           "AND m.recipient.id = :userId AND m.read = false AND m.deletedByRecipient = false")
    int countUnreadByConversationIdAndRecipientId(
        @Param("conversationId") Long conversationId,
        @Param("userId") Long userId
    );

    @Modifying
    @Query("UPDATE Message m SET m.read = true, m.readAt = CURRENT_TIMESTAMP " +
           "WHERE m.conversation.id = :conversationId AND m.recipient.id = :userId " +
           "AND m.read = false")
    int markAllAsReadInConversation(
        @Param("conversationId") Long conversationId,
        @Param("userId") Long userId
    );

    @Modifying
    @Query("UPDATE Message m SET m.read = true, m.readAt = CURRENT_TIMESTAMP " +
           "WHERE m.id IN :messageIds AND m.recipient.id = :userId AND m.read = false")
    int markMessagesAsRead(
        @Param("messageIds") List<Long> messageIds,
        @Param("userId") Long userId
    );

    @Query("SELECT m FROM Message m WHERE m.recipient.id = :userId " +
           "AND m.read = false AND m.deletedByRecipient = false " +
           "ORDER BY m.createdAt DESC")
    List<Message> findUnreadByRecipientId(@Param("userId") Long userId);

    @Query("SELECT m.conversation.id, COUNT(m) FROM Message m " +
           "WHERE m.recipient.id = :userId AND m.read = false " +
           "AND m.deletedByRecipient = false GROUP BY m.conversation.id")
    List<Object[]> countUnreadGroupedByConversation(@Param("userId") Long userId);

    @Query("SELECT m FROM Message m WHERE m.conversation.id = :conversationId " +
           "ORDER BY m.createdAt DESC LIMIT 1")
    Message findLastMessageByConversationId(@Param("conversationId") Long conversationId);
}
