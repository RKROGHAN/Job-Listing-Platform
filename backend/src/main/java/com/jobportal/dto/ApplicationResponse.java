package com.jobportal.dto;

import com.jobportal.entity.JobApplication;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ApplicationResponse {
    
    private Long id;
    private String coverLetter;
    private String resumeUrl;
    private JobApplication.ApplicationStatus status;
    private LocalDateTime appliedAt;
    private LocalDateTime reviewedAt;
    private LocalDateTime interviewScheduledAt;
    private String notes;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Related entities
    private UserSummary user;
    private JobSummary job;
    
    @Data
    public static class UserSummary {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String profilePicture;
    }
    
    @Data
    public static class JobSummary {
        private Long id;
        private String title;
        private String location;
        private String companyName;
        private String companyLogo;
    }
    
    public static ApplicationResponse fromApplication(JobApplication application) {
        ApplicationResponse response = new ApplicationResponse();
        response.setId(application.getId());
        response.setCoverLetter(application.getCoverLetter());
        response.setResumeUrl(application.getResumeUrl());
        response.setStatus(application.getStatus());
        response.setAppliedAt(application.getAppliedAt());
        response.setReviewedAt(application.getReviewedAt());
        response.setInterviewScheduledAt(application.getInterviewScheduledAt());
        response.setNotes(application.getNotes());
        response.setRejectionReason(application.getRejectionReason());
        response.setCreatedAt(application.getCreatedAt());
        response.setUpdatedAt(application.getUpdatedAt());
        
        // Set user summary
        if (application.getUser() != null) {
            UserSummary userSummary = new UserSummary();
            userSummary.setId(application.getUser().getId());
            userSummary.setFirstName(application.getUser().getFirstName());
            userSummary.setLastName(application.getUser().getLastName());
            userSummary.setEmail(application.getUser().getEmail());
            userSummary.setProfilePicture(application.getUser().getProfilePicture());
            response.setUser(userSummary);
        }
        
        // Set job summary
        if (application.getJob() != null) {
            JobSummary jobSummary = new JobSummary();
            jobSummary.setId(application.getJob().getId());
            jobSummary.setTitle(application.getJob().getTitle());
            jobSummary.setLocation(application.getJob().getLocation());
            if (application.getJob().getCompany() != null) {
                jobSummary.setCompanyName(application.getJob().getCompany().getName());
                jobSummary.setCompanyLogo(application.getJob().getCompany().getLogoUrl());
            }
            response.setJob(jobSummary);
        }
        
        return response;
    }
}
