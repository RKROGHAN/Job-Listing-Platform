package com.jobportal.controller;

import com.jobportal.dto.ApplicationRequest;
import com.jobportal.dto.ApplicationResponse;
import com.jobportal.entity.JobApplication;
import com.jobportal.entity.User;
import com.jobportal.service.AuthService;
import com.jobportal.service.JobApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Job Applications", description = "Job application management APIs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;
    private final AuthService authService;

    @PostMapping
    @Operation(summary = "Apply for a job", description = "Submit a job application")
    public ResponseEntity<?> applyForJob(@Valid @RequestBody ApplicationRequest applicationRequest) {
        try {
            User currentUser = authService.getCurrentUser();
            JobApplication application = jobApplicationService.createApplication(applicationRequest, currentUser);
            return ResponseEntity.ok(ApplicationResponse.fromApplication(application));
        } catch (Exception e) {
            log.error("Failed to create application", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to apply for job");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping
    @Operation(summary = "Get my applications", description = "Get applications submitted by current user")
    public ResponseEntity<Page<ApplicationResponse>> getMyApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "appliedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        User currentUser = authService.getCurrentUser();
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<JobApplication> applications = jobApplicationService.getApplicationsByUser(currentUser, pageable);
        Page<ApplicationResponse> applicationResponses = applications.map(ApplicationResponse::fromApplication);
        
        return ResponseEntity.ok(applicationResponses);
    }

    @GetMapping("/job/{jobId}")
    @Operation(summary = "Get applications for a job", description = "Get all applications for a specific job")
    public ResponseEntity<?> getApplicationsForJob(
            @PathVariable Long jobId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "appliedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        try {
            User currentUser = authService.getCurrentUser();
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<JobApplication> applications = jobApplicationService.getApplicationsByJob(jobId, pageable);
            Page<ApplicationResponse> applicationResponses = applications.map(ApplicationResponse::fromApplication);
            
            return ResponseEntity.ok(applicationResponses);
        } catch (Exception e) {
            log.error("Failed to get applications for job: {}", jobId, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get applications");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get application by ID", description = "Get application details by ID")
    public ResponseEntity<?> getApplicationById(@PathVariable Long id) {
        try {
            JobApplication application = jobApplicationService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Application not found"));
            return ResponseEntity.ok(ApplicationResponse.fromApplication(application));
        } catch (Exception e) {
            log.error("Failed to get application with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Application not found");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update application status", description = "Update the status of an application")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable Long id,
            @RequestParam JobApplication.ApplicationStatus status,
            @RequestParam(required = false) String notes) {
        
        try {
            User currentUser = authService.getCurrentUser();
            JobApplication application = jobApplicationService.updateApplicationStatus(id, status, notes, currentUser);
            return ResponseEntity.ok(ApplicationResponse.fromApplication(application));
        } catch (Exception e) {
            log.error("Failed to update application status for id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update application status");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/{id}/interview")
    @Operation(summary = "Schedule interview", description = "Schedule an interview for an application")
    public ResponseEntity<?> scheduleInterview(
            @PathVariable Long id,
            @RequestParam String interviewTime,
            @RequestParam(required = false) String notes) {
        
        try {
            User currentUser = authService.getCurrentUser();
            LocalDateTime interviewDateTime = LocalDateTime.parse(interviewTime);
            JobApplication application = jobApplicationService.scheduleInterview(id, interviewDateTime, notes, currentUser);
            return ResponseEntity.ok(ApplicationResponse.fromApplication(application));
        } catch (Exception e) {
            log.error("Failed to schedule interview for application id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to schedule interview");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Withdraw application", description = "Withdraw a job application")
    public ResponseEntity<?> withdrawApplication(@PathVariable Long id) {
        try {
            User currentUser = authService.getCurrentUser();
            jobApplicationService.withdrawApplication(id, currentUser);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Application withdrawn successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to withdraw application with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to withdraw application");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get applications by status", description = "Get applications filtered by status")
    public ResponseEntity<Page<ApplicationResponse>> getApplicationsByStatus(
            @PathVariable JobApplication.ApplicationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "appliedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<JobApplication> applications = jobApplicationService.getApplicationsByStatus(status, pageable);
        Page<ApplicationResponse> applicationResponses = applications.map(ApplicationResponse::fromApplication);
        
        return ResponseEntity.ok(applicationResponses);
    }

    @GetMapping("/stats")
    @Operation(summary = "Get application statistics", description = "Get application statistics for current user")
    public ResponseEntity<?> getApplicationStats() {
        try {
            User currentUser = authService.getCurrentUser();
            long totalApplications = jobApplicationService.getApplicationCountByUser(currentUser);
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalApplications", totalApplications);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Failed to get application stats", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get application statistics");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
