package com.jobportal.controller;

import com.jobportal.entity.User;
import com.jobportal.service.AuthService;
import com.jobportal.service.SavedJobService;
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
@RequestMapping("/api/saved-jobs")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Saved Jobs", description = "Saved job management APIs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SavedJobController {

    private final SavedJobService savedJobService;
    private final AuthService authService;

    @PostMapping("/{jobId}")
    @Operation(summary = "Save a job", description = "Save a job to user's saved jobs list")
    public ResponseEntity<?> saveJob(@PathVariable Long jobId) {
        try {
            User currentUser = authService.getCurrentUser();
            savedJobService.saveJob(jobId, currentUser);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Job saved successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to save job with id: {}", jobId, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to save job");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{jobId}")
    @Operation(summary = "Unsave a job", description = "Remove a job from user's saved jobs list")
    public ResponseEntity<?> unsaveJob(@PathVariable Long jobId) {
        try {
            User currentUser = authService.getCurrentUser();
            savedJobService.unsaveJob(jobId, currentUser);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Job removed from saved jobs");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to unsave job with id: {}", jobId, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to unsave job");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping
    @Operation(summary = "Get saved jobs", description = "Get paginated list of user's saved jobs")
    public ResponseEntity<Page<Map<String, Object>>> getSavedJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "savedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        User currentUser = authService.getCurrentUser();
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<com.jobportal.entity.SavedJob> savedJobs = savedJobService.getSavedJobsByUser(currentUser, pageable);
        Page<Map<String, Object>> savedJobResponses = savedJobs.map(this::createSavedJobResponse);
        
        return ResponseEntity.ok(savedJobResponses);
    }

    @GetMapping("/all")
    @Operation(summary = "Get all saved jobs", description = "Get list of all user's saved jobs")
    public ResponseEntity<List<Map<String, Object>>> getAllSavedJobs() {
        User currentUser = authService.getCurrentUser();
        List<com.jobportal.entity.SavedJob> savedJobs = savedJobService.getSavedJobsByUser(currentUser);
        List<Map<String, Object>> savedJobResponses = savedJobs.stream()
                .map(this::createSavedJobResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(savedJobResponses);
    }

    @GetMapping("/{jobId}/is-saved")
    @Operation(summary = "Check if job is saved", description = "Check if a job is saved by current user")
    public ResponseEntity<Map<String, Object>> isJobSaved(@PathVariable Long jobId) {
        User currentUser = authService.getCurrentUser();
        boolean isSaved = savedJobService.isJobSavedByUser(jobId, currentUser);
        Map<String, Object> response = new HashMap<>();
        response.put("isSaved", isSaved);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/count")
    @Operation(summary = "Get saved jobs count", description = "Get count of saved jobs for current user")
    public ResponseEntity<Map<String, Object>> getSavedJobsCount() {
        User currentUser = authService.getCurrentUser();
        long count = savedJobService.getSavedJobCountByUser(currentUser);
        Map<String, Object> response = new HashMap<>();
        response.put("savedJobsCount", count);
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> createSavedJobResponse(com.jobportal.entity.SavedJob savedJob) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", savedJob.getId());
        response.put("savedAt", savedJob.getSavedAt());
        
        // Job details
        if (savedJob.getJob() != null) {
            Map<String, Object> jobDetails = new HashMap<>();
            jobDetails.put("id", savedJob.getJob().getId());
            jobDetails.put("title", savedJob.getJob().getTitle());
            jobDetails.put("description", savedJob.getJob().getDescription());
            jobDetails.put("location", savedJob.getJob().getLocation());
            jobDetails.put("jobType", savedJob.getJob().getJobType());
            jobDetails.put("experienceLevel", savedJob.getJob().getExperienceLevel());
            jobDetails.put("minSalary", savedJob.getJob().getMinSalary());
            jobDetails.put("maxSalary", savedJob.getJob().getMaxSalary());
            jobDetails.put("currency", savedJob.getJob().getCurrency());
            jobDetails.put("isRemote", savedJob.getJob().getIsRemote());
            jobDetails.put("applicationDeadline", savedJob.getJob().getApplicationDeadline());
            jobDetails.put("viewsCount", savedJob.getJob().getViewsCount());
            jobDetails.put("applicationsCount", savedJob.getJob().getApplicationsCount());
            jobDetails.put("createdAt", savedJob.getJob().getCreatedAt());
            
            // Company details
            if (savedJob.getJob().getCompany() != null) {
                Map<String, Object> companyDetails = new HashMap<>();
                companyDetails.put("id", savedJob.getJob().getCompany().getId());
                companyDetails.put("name", savedJob.getJob().getCompany().getName());
                companyDetails.put("logoUrl", savedJob.getJob().getCompany().getLogoUrl());
                companyDetails.put("industry", savedJob.getJob().getCompany().getIndustry());
                jobDetails.put("company", companyDetails);
            }
            
            // Category details
            if (savedJob.getJob().getCategory() != null) {
                Map<String, Object> categoryDetails = new HashMap<>();
                categoryDetails.put("id", savedJob.getJob().getCategory().getId());
                categoryDetails.put("name", savedJob.getJob().getCategory().getName());
                categoryDetails.put("icon", savedJob.getJob().getCategory().getIcon());
                categoryDetails.put("color", savedJob.getJob().getCategory().getColor());
                jobDetails.put("category", categoryDetails);
            }
            
            response.put("job", jobDetails);
        }
        
        return response;
    }
}
