package com.webapp.domain.messaging.entity;

import com.webapp.domain.user.entity.User;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "conversations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_one_id", nullable = false)
    private User participantOne;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_two_id", nullable = false)
    private User participantTwo;

    @Column(name = "subject")
    private String subject;

    @Column(name = "property_id")
    private Long propertyId;

    @Column(name = "property_title")
    private String propertyTitle;

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    @Builder.Default
    private List<Message> messages = new ArrayList<>();

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @Column(name = "last_message_preview", length = 255)
    private String lastMessagePreview;

    @Column(name = "participant_one_unread_count")
    @Builder.Default
    private Integer participantOneUnreadCount = 0;

    @Column(name = "participant_two_unread_count")
    @Builder.Default
    private Integer participantTwoUnreadCount = 0;

    @Column(name = "participant_one_deleted")
    @Builder.Default
    private boolean participantOneDeleted = false;

    @Column(name = "participant_two_deleted")
    @Builder.Default
    private boolean participantTwoDeleted = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        lastMessageAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public boolean isParticipant(Long userId) {
        return (participantOne != null && participantOne.getId().equals(userId)) ||
               (participantTwo != null && participantTwo.getId().equals(userId));
    }

    public User getOtherParticipant(Long userId) {
        if (participantOne != null && participantOne.getId().equals(userId)) {
            return participantTwo;
        }
        return participantOne;
    }

    public int getUnreadCountForUser(Long userId) {
        if (participantOne != null && participantOne.getId().equals(userId)) {
            return participantOneUnreadCount != null ? participantOneUnreadCount : 0;
        }
        return participantTwoUnreadCount != null ? participantTwoUnreadCount : 0;
    }

    public void incrementUnreadCount(Long recipientId) {
        if (participantOne != null && participantOne.getId().equals(recipientId)) {
            participantOneUnreadCount = (participantOneUnreadCount != null ? participantOneUnreadCount : 0) + 1;
        } else {
            participantTwoUnreadCount = (participantTwoUnreadCount != null ? participantTwoUnreadCount : 0) + 1;
        }
    }

    public void resetUnreadCount(Long userId) {
        if (participantOne != null && participantOne.getId().equals(userId)) {
            participantOneUnreadCount = 0;
        } else {
            participantTwoUnreadCount = 0;
        }
    }

    public boolean isDeletedForUser(Long userId) {
        if (participantOne != null && participantOne.getId().equals(userId)) {
            return participantOneDeleted;
        }
        return participantTwoDeleted;
    }

    public void setDeletedForUser(Long userId, boolean deleted) {
        if (participantOne != null && participantOne.getId().equals(userId)) {
            participantOneDeleted = deleted;
        } else {
            participantTwoDeleted = deleted;
        }
    }

    public void updateLastMessage(String preview) {
        this.lastMessageAt = LocalDateTime.now();
        this.lastMessagePreview = preview != null && preview.length() > 255
            ? preview.substring(0, 252) + "..."
            : preview;
    }
}
