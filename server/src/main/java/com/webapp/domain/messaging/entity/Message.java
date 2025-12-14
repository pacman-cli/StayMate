package com.webapp.domain.messaging.entity;

import com.webapp.domain.user.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Column(name = "content", nullable = false, length = 5000)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", nullable = false)
    @Builder.Default
    private MessageType messageType = MessageType.TEXT;

    @Column(name = "attachment_url")
    private String attachmentUrl;

    @Column(name = "attachment_name")
    private String attachmentName;

    @Column(name = "is_read")
    @Builder.Default
    private boolean read = false;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "is_deleted_by_sender")
    @Builder.Default
    private boolean deletedBySender = false;

    @Column(name = "is_deleted_by_recipient")
    @Builder.Default
    private boolean deletedByRecipient = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void markAsRead() {
        if (!this.read) {
            this.read = true;
            this.readAt = LocalDateTime.now();
        }
    }

    public boolean isVisibleToUser(Long userId) {
        if (sender != null && sender.getId().equals(userId)) {
            return !deletedBySender;
        }
        if (recipient != null && recipient.getId().equals(userId)) {
            return !deletedByRecipient;
        }
        return false;
    }

    public void deleteForUser(Long userId) {
        if (sender != null && sender.getId().equals(userId)) {
            deletedBySender = true;
        }
        if (recipient != null && recipient.getId().equals(userId)) {
            deletedByRecipient = true;
        }
    }

    public enum MessageType {
        TEXT,
        IMAGE,
        FILE,
        SYSTEM
    }
}
