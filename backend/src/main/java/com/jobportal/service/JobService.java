package com.jobportal.service;

import com.jobportal.dto.JobRequest;
import com.jobportal.dto.JobResponse;
import com.jobportal.entity.Job;
import com.jobportal.entity.User;
import com.jobportal.repository.JobRepository;
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
public class JobService {

    private final JobRepository jobRepository;
    private final CompanyService companyService;
    private final CategoryService categoryService;
    private final SkillService skillService;

    public Job createJob(JobRequest jobRequest, User postedBy) {
        Job job = new Job();
        job.setTitle(jobRequest.getTitle());
        job.setDescription(jobRequest.getDescription());
        job.setLocation(jobRequest.getLocation());
        job.setJobType(jobRequest.getJobType());
        job.setExperienceLevel(jobRequest.getExperienceLevel());
        job.setMinSalary(jobRequest.getMinSalary());
        job.setMaxSalary(jobRequest.getMaxSalary());
        job.setCurrency(jobRequest.getCurrency());
        job.setIsRemote(jobRequest.getIsRemote());
        job.setApplicationDeadline(jobRequest.getApplicationDeadline());
        job.setRequirements(jobRequest.getRequirements());
        job.setBenefits(jobRequest.getBenefits());
        job.setApplicationInstructions(jobRequest.getApplicationInstructions());
        job.setPostedBy(postedBy);
        job.setIsActive(true);
        job.setViewsCount(0);
        job.setApplicationsCount(0);

        // Set company if provided
        if (jobRequest.getCompanyId() != null) {
            job.setCompany(companyService.findById(jobRequest.getCompanyId()).orElse(null));
        }

        // Set category if provided
        if (jobRequest.getCategoryId() != null) {
            job.setCategory(categoryService.findById(jobRequest.getCategoryId()).orElse(null));
        }

        Job savedJob = jobRepository.save(job);

        // Add required skills
        if (jobRequest.getRequiredSkillIds() != null && !jobRequest.getRequiredSkillIds().isEmpty()) {
            jobRequest.getRequiredSkillIds().forEach(skillId -> {
                skillService.findById(skillId).ifPresent(skill -> {
                    savedJob.getRequiredSkills().add(skill);
                });
            });
        }

        return jobRepository.save(savedJob);
    }

    public Optional<Job> findById(Long id) {
        return jobRepository.findById(id);
    }

    public Job updateJob(Long id, JobRequest jobRequest, User currentUser) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        // Check if user has permission to update this job
        if (!job.getPostedBy().getId().equals(currentUser.getId()) && !currentUser.isAdmin()) {
            throw new RuntimeException("You don't have permission to update this job");
        }

        job.setTitle(jobRequest.getTitle());
        job.setDescription(jobRequest.getDescription());
        job.setLocation(jobRequest.getLocation());
        job.setJobType(jobRequest.getJobType());
        job.setExperienceLevel(jobRequest.getExperienceLevel());
        job.setMinSalary(jobRequest.getMinSalary());
        job.setMaxSalary(jobRequest.getMaxSalary());
        job.setCurrency(jobRequest.getCurrency());
        job.setIsRemote(jobRequest.getIsRemote());
        job.setApplicationDeadline(jobRequest.getApplicationDeadline());
        job.setRequirements(jobRequest.getRequirements());
        job.setBenefits(jobRequest.getBenefits());
        job.setApplicationInstructions(jobRequest.getApplicationInstructions());

        // Update company if provided
        if (jobRequest.getCompanyId() != null) {
            job.setCompany(companyService.findById(jobRequest.getCompanyId()).orElse(null));
        }

        // Update category if provided
        if (jobRequest.getCategoryId() != null) {
            job.setCategory(categoryService.findById(jobRequest.getCategoryId()).orElse(null));
        }

        // Update required skills
        job.getRequiredSkills().clear();
        if (jobRequest.getRequiredSkillIds() != null && !jobRequest.getRequiredSkillIds().isEmpty()) {
            jobRequest.getRequiredSkillIds().forEach(skillId -> {
                skillService.findById(skillId).ifPresent(skill -> {
                    job.getRequiredSkills().add(skill);
                });
            });
        }

        return jobRepository.save(job);
    }

    public void deleteJob(Long id, User currentUser) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        // Check if user has permission to delete this job
        if (!job.getPostedBy().getId().equals(currentUser.getId()) && !currentUser.isAdmin()) {
            throw new RuntimeException("You don't have permission to delete this job");
        }

        jobRepository.deleteById(id);
    }

    public Page<Job> getAllJobs(Pageable pageable) {
        return jobRepository.findByIsActiveTrueOrderByCreatedAtDesc(pageable);
    }

    public Page<Job> searchJobs(String keyword, String location, Job.JobType jobType, 
                               Job.ExperienceLevel experienceLevel, Boolean isRemote, Pageable pageable) {
        return jobRepository.findJobsWithFilters(keyword, location, jobType, experienceLevel, isRemote, pageable);
    }

    public List<Job> getJobsByUser(User user) {
        return jobRepository.findByPostedByOrderByCreatedAtDesc(user);
    }

    public List<Job> getJobsByCompany(Long companyId) {
        return jobRepository.findByCompanyIdAndIsActiveTrueOrderByCreatedAtDesc(companyId);
    }

    public List<Job> getJobsByCategory(Long categoryId) {
        return jobRepository.findByCategoryIdAndIsActiveTrueOrderByCreatedAtDesc(categoryId);
    }

    public List<Job> getRecentJobs(int limit) {
        return jobRepository.findTop10ByIsActiveTrueOrderByCreatedAtDesc();
    }

    public List<Job> getFeaturedJobs() {
        return jobRepository.findTop10ByIsActiveTrueOrderByViewsCountDesc();
    }

    public Job incrementViews(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        job.incrementViews();
        return jobRepository.save(job);
    }

    public Job incrementApplications(Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        job.incrementApplications();
        return jobRepository.save(job);
    }

    public List<Job> getExpiredJobs() {
        return jobRepository.findByApplicationDeadlineBeforeAndIsActiveTrue(LocalDateTime.now());
    }

    public void deactivateExpiredJobs() {
        List<Job> expiredJobs = getExpiredJobs();
        expiredJobs.forEach(job -> {
            job.setIsActive(false);
            jobRepository.save(job);
        });
    }
}
