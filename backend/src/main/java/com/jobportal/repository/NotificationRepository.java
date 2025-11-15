package com.jobportal.repository;

import com.jobportal.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByUser_Id(Long userId);
    
    Page<Notification> findByUser_Id(Long userId, Pageable pageable);
    
    List<Notification> findByUser_IdAndIsReadFalse(Long userId);
    
    List<Notification> findByUser_IdAndType(Long userId, Notification.NotificationType type);
    
    @Query("SELECT n FROM Notification n WHERE " +
           "n.user.id = :userId AND " +
           "n.isRead = false")
    List<Notification> findUnreadByUser(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE " +
           "n.user.id = :userId AND " +
           "n.isRead = false")
    long countUnreadByUser(@Param("userId") Long userId);
    
    @Query("SELECT n FROM Notification n WHERE " +
           "n.user.id = :userId AND " +
           "n.createdAt >= :since")
    List<Notification> findRecentByUser(@Param("userId") Long userId, 
                                       @Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE " +
           "n.user.id = :userId")
    long countByUser(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE " +
           "n.type = :type")
    long countByType(@Param("type") Notification.NotificationType type);
    
    // Additional methods used in services
    List<Notification> findByUserOrderByCreatedAtDesc(com.jobportal.entity.User user);
    
    Page<Notification> findByUserOrderByCreatedAtDesc(com.jobportal.entity.User user, Pageable pageable);
    
    List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(com.jobportal.entity.User user);
    
    long countByUserAndIsReadFalse(com.jobportal.entity.User user);
    
    void deleteByUser(com.jobportal.entity.User user);
    
    void deleteByCreatedAtBeforeAndIsReadTrue(LocalDateTime cutoffDate);
}
