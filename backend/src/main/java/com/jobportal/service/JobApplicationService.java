package com.jobportal.service;

import com.jobportal.dto.ApplicationRequest;
import com.jobportal.dto.ApplicationResponse;
import com.jobportal.entity.Job;
import com.jobportal.entity.JobApplication;
import com.jobportal.entity.Notification;
import com.jobportal.entity.User;
import com.jobportal.repository.JobApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final JobService jobService;
    private final NotificationService notificationService;

    public JobApplication createApplication(ApplicationRequest applicationRequest, User user) {
        Job job = jobService.findById(applicationRequest.getJobId())
                .orElseThrow(() -> new RuntimeException("Job not found"));

        // Check if user has already applied for this job
        if (jobApplicationRepository.existsByUserAndJob(user, job)) {
            throw new RuntimeException("You have already applied for this job");
        }

        // Check if job is still active and not expired
        if (!job.getIsActive() || job.isExpired()) {
            throw new RuntimeException("This job is no longer accepting applications");
        }

        JobApplication application = new JobApplication();
        application.setUser(user);
        application.setJob(job);
        application.setCoverLetter(applicationRequest.getCoverLetter());
        application.setResumeUrl(applicationRequest.getResumeUrl());
        application.setStatus(JobApplication.ApplicationStatus.PENDING);
        application.setAppliedAt(LocalDateTime.now());

        JobApplication savedApplication = jobApplicationRepository.save(application);

        // Increment job applications count
        jobService.incrementApplications(job.getId());

        // Send notification to job poster
        notificationService.createNotification(
                job.getPostedBy(),
                "New Job Application",
                user.getFullName() + " has applied for your job: " + job.getTitle(),
                Notification.NotificationType.JOB_APPLICATION,
                "/jobs/" + job.getId() + "/applications"
        );

        return savedApplication;
    }

    public Optional<JobApplication> findById(Long id) {
        return jobApplicationRepository.findById(id);
    }

    public JobApplication updateApplicationStatus(Long id, JobApplication.ApplicationStatus status, 
                                                String notes, User currentUser) {
        JobApplication application = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        // Check if user has permission to update this application
        if (!application.getJob().getPostedBy().getId().equals(currentUser.getId()) && !currentUser.isAdmin()) {
            throw new RuntimeException("You don't have permission to update this application");
        }

        application.updateStatus(status);
        application.setNotes(notes);

        if (status == JobApplication.ApplicationStatus.REJECTED) {
            application.setRejectionReason(notes);
        }

        JobApplication savedApplication = jobApplicationRepository.save(application);

        // Send notification to applicant
        String message = "Your application for " + application.getJob().getTitle() + 
                        " has been " + status.name().toLowerCase().replace("_", " ");
        
        notificationService.createNotification(
                application.getUser(),
                "Application Status Update",
                message,
                Notification.NotificationType.APPLICATION_STATUS_UPDATE,
                "/applications/" + application.getId()
        );

        return savedApplication;
    }

    public JobApplication scheduleInterview(Long id, LocalDateTime interviewTime, String notes, User currentUser) {
        JobApplication application = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        // Check if user has permission to schedule interview
        if (!application.getJob().getPostedBy().getId().equals(currentUser.getId()) && !currentUser.isAdmin()) {
            throw new RuntimeException("You don't have permission to schedule interview for this application");
        }

        application.scheduleInterview(interviewTime);
        application.setNotes(notes);

        JobApplication savedApplication = jobApplicationRepository.save(application);

        // Send notification to applicant
        notificationService.createNotification(
                application.getUser(),
                "Interview Scheduled",
                "An interview has been scheduled for your application: " + application.getJob().getTitle() + 
                " on " + interviewTime.toString(),
                Notification.NotificationType.INTERVIEW_SCHEDULED,
                "/applications/" + application.getId()
        );

        return savedApplication;
    }

    public void withdrawApplication(Long id, User currentUser) {
        JobApplication application = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        // Check if user has permission to withdraw this application
        if (!application.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You don't have permission to withdraw this application");
        }

        application.updateStatus(JobApplication.ApplicationStatus.WITHDRAWN);
        jobApplicationRepository.save(application);
    }

    public Page<JobApplication> getApplicationsByUser(User user, Pageable pageable) {
        return jobApplicationRepository.findByUserOrderByAppliedAtDesc(user, pageable);
    }

    public Page<JobApplication> getApplicationsByJob(Long jobId, Pageable pageable) {
        return jobApplicationRepository.findByJobIdOrderByAppliedAtDesc(jobId, pageable);
    }

    public List<JobApplication> getApplicationsByJob(Long jobId) {
        return jobApplicationRepository.findByJobIdOrderByAppliedAtDesc(jobId);
    }

    public Page<JobApplication> getApplicationsByStatus(JobApplication.ApplicationStatus status, Pageable pageable) {
        return jobApplicationRepository.findByStatusOrderByAppliedAtDesc(status, pageable);
    }

    public List<JobApplication> getApplicationsByStatus(JobApplication.ApplicationStatus status) {
        return jobApplicationRepository.findByStatusOrderByAppliedAtDesc(status);
    }

    public long getApplicationCountByUser(User user) {
        return jobApplicationRepository.countByUser(user);
    }

    public long getApplicationCountByJob(Long jobId) {
        return jobApplicationRepository.countByJobId(jobId);
    }

    public boolean hasUserAppliedForJob(User user, Long jobId) {
        return jobApplicationRepository.existsByUserAndJobId(user, jobId);
    }
}
