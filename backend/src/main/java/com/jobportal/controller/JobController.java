package com.jobportal.controller;

import com.jobportal.dto.JobRequest;
import com.jobportal.dto.JobResponse;
import com.jobportal.entity.Job;
import com.jobportal.entity.User;
import com.jobportal.service.AuthService;
import com.jobportal.service.JobService;
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

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Jobs", description = "Job management APIs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class JobController {

    private final JobService jobService;
    private final AuthService authService;

    @PostMapping
    @Operation(summary = "Create a new job", description = "Create a new job posting")
    public ResponseEntity<?> createJob(@Valid @RequestBody JobRequest jobRequest) {
        try {
            User currentUser = authService.getCurrentUser();
            Job job = jobService.createJob(jobRequest, currentUser);
            return ResponseEntity.ok(JobResponse.fromJob(job));
        } catch (Exception e) {
            log.error("Failed to create job", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create job");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping
    @Operation(summary = "Get all jobs", description = "Get paginated list of all active jobs")
    public ResponseEntity<Page<JobResponse>> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Job> jobs = jobService.getAllJobs(pageable);
        Page<JobResponse> jobResponses = jobs.map(JobResponse::fromJob);
        
        return ResponseEntity.ok(jobResponses);
    }

    @GetMapping("/search")
    @Operation(summary = "Search jobs", description = "Search jobs with filters")
    public ResponseEntity<Page<JobResponse>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Job.JobType jobType,
            @RequestParam(required = false) Job.ExperienceLevel experienceLevel,
            @RequestParam(required = false) Boolean isRemote,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Job> jobs = jobService.searchJobs(keyword, location, jobType, experienceLevel, isRemote, pageable);
        Page<JobResponse> jobResponses = jobs.map(JobResponse::fromJob);
        
        return ResponseEntity.ok(jobResponses);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get job by ID", description = "Get job details by ID")
    public ResponseEntity<?> getJobById(@PathVariable Long id) {
        try {
            Job job = jobService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Job not found"));
            
            // Increment view count
            jobService.incrementViews(id);
            
            return ResponseEntity.ok(JobResponse.fromJob(job));
        } catch (Exception e) {
            log.error("Failed to get job with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Job not found");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update job", description = "Update job details")
    public ResponseEntity<?> updateJob(@PathVariable Long id, @Valid @RequestBody JobRequest jobRequest) {
        try {
            User currentUser = authService.getCurrentUser();
            Job job = jobService.updateJob(id, jobRequest, currentUser);
            return ResponseEntity.ok(JobResponse.fromJob(job));
        } catch (Exception e) {
            log.error("Failed to update job with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update job");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete job", description = "Delete a job")
    public ResponseEntity<?> deleteJob(@PathVariable Long id) {
        try {
            User currentUser = authService.getCurrentUser();
            jobService.deleteJob(id, currentUser);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Job deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to delete job with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete job");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/my-jobs")
    @Operation(summary = "Get my jobs", description = "Get jobs posted by current user")
    public ResponseEntity<List<JobResponse>> getMyJobs() {
        User currentUser = authService.getCurrentUser();
        List<Job> jobs = jobService.getJobsByUser(currentUser);
        List<JobResponse> jobResponses = jobs.stream()
                .map(JobResponse::fromJob)
                .collect(Collectors.toList());
        return ResponseEntity.ok(jobResponses);
    }

    @GetMapping("/recent")
    @Operation(summary = "Get recent jobs", description = "Get recently posted jobs")
    public ResponseEntity<List<JobResponse>> getRecentJobs(@RequestParam(defaultValue = "10") int limit) {
        List<Job> jobs = jobService.getRecentJobs(limit);
        List<JobResponse> jobResponses = jobs.stream()
                .map(JobResponse::fromJob)
                .collect(Collectors.toList());
        return ResponseEntity.ok(jobResponses);
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured jobs", description = "Get most viewed jobs")
    public ResponseEntity<List<JobResponse>> getFeaturedJobs() {
        List<Job> jobs = jobService.getFeaturedJobs();
        List<JobResponse> jobResponses = jobs.stream()
                .map(JobResponse::fromJob)
                .collect(Collectors.toList());
        return ResponseEntity.ok(jobResponses);
    }

    @GetMapping("/company/{companyId}")
    @Operation(summary = "Get jobs by company", description = "Get all jobs posted by a company")
    public ResponseEntity<List<JobResponse>> getJobsByCompany(@PathVariable Long companyId) {
        List<Job> jobs = jobService.getJobsByCompany(companyId);
        List<JobResponse> jobResponses = jobs.stream()
                .map(JobResponse::fromJob)
                .collect(Collectors.toList());
        return ResponseEntity.ok(jobResponses);
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get jobs by category", description = "Get all jobs in a category")
    public ResponseEntity<List<JobResponse>> getJobsByCategory(@PathVariable Long categoryId) {
        List<Job> jobs = jobService.getJobsByCategory(categoryId);
        List<JobResponse> jobResponses = jobs.stream()
                .map(JobResponse::fromJob)
                .collect(Collectors.toList());
        return ResponseEntity.ok(jobResponses);
    }
}
