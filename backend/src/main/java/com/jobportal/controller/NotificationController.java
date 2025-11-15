package com.jobportal.controller;

import com.jobportal.entity.Notification;
import com.jobportal.entity.User;
import com.jobportal.service.AuthService;
import com.jobportal.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Notifications", description = "Notification management APIs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    @GetMapping
    @Operation(summary = "Get user notifications", description = "Get paginated list of user notifications")
    public ResponseEntity<Page<Map<String, Object>>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        User currentUser = authService.getCurrentUser();
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Notification> notifications = notificationService.getNotificationsByUser(currentUser, pageable);
        Page<Map<String, Object>> notificationResponses = notifications.map(this::createNotificationResponse);
        
        return ResponseEntity.ok(notificationResponses);
    }

    @GetMapping("/unread")
    @Operation(summary = "Get unread notifications", description = "Get list of unread notifications")
    public ResponseEntity<List<Map<String, Object>>> getUnreadNotifications() {
        User currentUser = authService.getCurrentUser();
        List<Notification> notifications = notificationService.getUnreadNotificationsByUser(currentUser);
        List<Map<String, Object>> notificationResponses = notifications.stream()
                .map(this::createNotificationResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(notificationResponses);
    }

    @GetMapping("/count")
    @Operation(summary = "Get unread notification count", description = "Get count of unread notifications")
    public ResponseEntity<Map<String, Object>> getUnreadNotificationCount() {
        User currentUser = authService.getCurrentUser();
        long count = notificationService.getUnreadNotificationCount(currentUser);
        Map<String, Object> response = new HashMap<>();
        response.put("unreadCount", count);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get notification by ID", description = "Get notification details by ID")
    public ResponseEntity<?> getNotificationById(@PathVariable Long id) {
        try {
            User currentUser = authService.getCurrentUser();
            // Note: We need to add a method to get notification by ID and user
            // For now, we'll get all notifications and filter
            List<Notification> notifications = notificationService.getNotificationsByUser(currentUser);
            Notification notification = notifications.stream()
                    .filter(n -> n.getId().equals(id))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Notification not found"));
            
            return ResponseEntity.ok(createNotificationResponse(notification));
        } catch (Exception e) {
            log.error("Failed to get notification with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Notification not found");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark notification as read", description = "Mark a notification as read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        try {
            User currentUser = authService.getCurrentUser();
            Notification notification = notificationService.markAsRead(id, currentUser);
            return ResponseEntity.ok(createNotificationResponse(notification));
        } catch (Exception e) {
            log.error("Failed to mark notification as read with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to mark notification as read");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/mark-all-read")
    @Operation(summary = "Mark all notifications as read", description = "Mark all user notifications as read")
    public ResponseEntity<?> markAllAsRead() {
        try {
            User currentUser = authService.getCurrentUser();
            notificationService.markAllAsRead(currentUser);
            Map<String, String> response = new HashMap<>();
            response.put("message", "All notifications marked as read");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to mark all notifications as read", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to mark all notifications as read");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete notification", description = "Delete a notification")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        try {
            User currentUser = authService.getCurrentUser();
            notificationService.deleteNotification(id, currentUser);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Notification deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to delete notification with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete notification");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/all")
    @Operation(summary = "Delete all notifications", description = "Delete all user notifications")
    public ResponseEntity<?> deleteAllNotifications() {
        try {
            User currentUser = authService.getCurrentUser();
            notificationService.deleteAllNotifications(currentUser);
            Map<String, String> response = new HashMap<>();
            response.put("message", "All notifications deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to delete all notifications", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete all notifications");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    private Map<String, Object> createNotificationResponse(Notification notification) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", notification.getId());
        response.put("title", notification.getTitle());
        response.put("message", notification.getMessage());
        response.put("type", notification.getType());
        response.put("isRead", notification.getIsRead());
        response.put("readAt", notification.getReadAt());
        response.put("actionUrl", notification.getActionUrl());
        response.put("createdAt", notification.getCreatedAt());
        return response;
    }
}
