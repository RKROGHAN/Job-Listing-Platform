package com.jobportal.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class JobApplication {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;
    
    @Column(name = "resume_url")
    private String resumeUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ApplicationStatus status = ApplicationStatus.PENDING;
    
    @Column(name = "applied_at", nullable = false, updatable = false)
    private LocalDateTime appliedAt;
    
    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
    
    @Column(name = "interview_scheduled_at")
    private LocalDateTime interviewScheduledAt;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;
    
    public enum ApplicationStatus {
        PENDING, REVIEWED, SHORTLISTED, INTERVIEW_SCHEDULED, 
        INTERVIEWED, ACCEPTED, REJECTED, WITHDRAWN
    }
    
    // Helper methods
    public boolean isPending() {
        return status == ApplicationStatus.PENDING;
    }
    
    public boolean isAccepted() {
        return status == ApplicationStatus.ACCEPTED;
    }
    
    public boolean isRejected() {
        return status == ApplicationStatus.REJECTED;
    }
    
    public boolean isShortlisted() {
        return status == ApplicationStatus.SHORTLISTED;
    }
    
    public boolean isInterviewScheduled() {
        return status == ApplicationStatus.INTERVIEW_SCHEDULED;
    }
    
    public void updateStatus(ApplicationStatus newStatus) {
        this.status = newStatus;
        this.reviewedAt = LocalDateTime.now();
    }
    
    public void scheduleInterview(LocalDateTime interviewTime) {
        this.status = ApplicationStatus.INTERVIEW_SCHEDULED;
        this.interviewScheduledAt = interviewTime;
        this.reviewedAt = LocalDateTime.now();
    }
}
