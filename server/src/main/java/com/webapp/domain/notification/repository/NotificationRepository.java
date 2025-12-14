package com.webapp.domain.notification.repository;

import com.webapp.domain.notification.entity.Notification;
import com.webapp.domain.notification.entity.Notification.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Find all notifications for a user, ordered by creation date
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId ORDER BY n.createdAt DESC")
    Page<Notification> findByUserId(@Param("userId") Long userId, Pageable pageable);

    // Find all notifications for a user (without pagination)
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId ORDER BY n.createdAt DESC")
    List<Notification> findAllByUserId(@Param("userId") Long userId);

    // Find unread notifications for a user
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.read = false ORDER BY n.createdAt DESC")
    List<Notification> findUnreadByUserId(@Param("userId") Long userId);

    // Find unread notifications with pagination
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.read = false ORDER BY n.createdAt DESC")
    Page<Notification> findUnreadByUserId(@Param("userId") Long userId, Pageable pageable);

    // Count unread notifications for a user
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.id = :userId AND n.read = false")
    int countUnreadByUserId(@Param("userId") Long userId);

    // Find notifications by type for a user
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.type = :type ORDER BY n.createdAt DESC")
    Page<Notification> findByUserIdAndType(
        @Param("userId") Long userId,
        @Param("type") NotificationType type,
        Pageable pageable
    );

    // Find notifications by multiple types for a user
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.type IN :types ORDER BY n.createdAt DESC")
    Page<Notification> findByUserIdAndTypeIn(
        @Param("userId") Long userId,
        @Param("types") List<NotificationType> types,
        Pageable pageable
    );

    // Mark a single notification as read
    @Modifying
    @Query("UPDATE Notification n SET n.read = true, n.readAt = CURRENT_TIMESTAMP WHERE n.id = :notificationId AND n.user.id = :userId")
    int markAsRead(@Param("notificationId") Long notificationId, @Param("userId") Long userId);

    // Mark all notifications as read for a user
    @Modifying
    @Query("UPDATE Notification n SET n.read = true, n.readAt = CURRENT_TIMESTAMP WHERE n.user.id = :userId AND n.read = false")
    int markAllAsRead(@Param("userId") Long userId);

    // Mark multiple notifications as read
    @Modifying
    @Query("UPDATE Notification n SET n.read = true, n.readAt = CURRENT_TIMESTAMP WHERE n.id IN :notificationIds AND n.user.id = :userId AND n.read = false")
    int markMultipleAsRead(@Param("notificationIds") List<Long> notificationIds, @Param("userId") Long userId);

    // Delete old read notifications (for cleanup)
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.user.id = :userId AND n.read = true AND n.createdAt < :before")
    int deleteOldReadNotifications(@Param("userId") Long userId, @Param("before") LocalDateTime before);

    // Delete all notifications for a user
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.user.id = :userId")
    int deleteAllByUserId(@Param("userId") Long userId);

    // Delete a specific notification for a user
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.id = :notificationId AND n.user.id = :userId")
    int deleteByIdAndUserId(@Param("notificationId") Long notificationId, @Param("userId") Long userId);

    // Find recent notifications (last 7 days)
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.createdAt > :since ORDER BY n.createdAt DESC")
    List<Notification> findRecentByUserId(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    // Check if notification exists for user
    boolean existsByIdAndUserId(Long id, Long userId);

    // Count notifications by type for a user
    @Query("SELECT n.type, COUNT(n) FROM Notification n WHERE n.user.id = :userId AND n.read = false GROUP BY n.type")
    List<Object[]> countUnreadGroupedByType(@Param("userId") Long userId);

    // Find notifications related to a specific property
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.propertyId = :propertyId ORDER BY n.createdAt DESC")
    List<Notification> findByUserIdAndPropertyId(@Param("userId") Long userId, @Param("propertyId") Long propertyId);

    // Find notifications from a specific sender
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.senderId = :senderId ORDER BY n.createdAt DESC")
    List<Notification> findByUserIdAndSenderId(@Param("userId") Long userId, @Param("senderId") Long senderId);
}
