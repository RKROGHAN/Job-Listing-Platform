package com.jobportal.dto;

import com.jobportal.entity.Job;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class JobResponse {
    
    private Long id;
    private String title;
    private String description;
    private String location;
    private Job.JobType jobType;
    private Job.ExperienceLevel experienceLevel;
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private String currency;
    private Boolean isRemote;
    private Boolean isActive;
    private LocalDateTime applicationDeadline;
    private String requirements;
    private String benefits;
    private String applicationInstructions;
    private Integer viewsCount;
    private Integer applicationsCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Related entities
    private UserSummary postedBy;
    private CompanySummary company;
    private CategorySummary category;
    private Set<SkillSummary> requiredSkills;
    
    // Helper methods
    public String getSalaryRange() {
        if (minSalary != null && maxSalary != null) {
            return minSalary + " - " + maxSalary + " " + currency;
        } else if (minSalary != null) {
            return "From " + minSalary + " " + currency;
        } else if (maxSalary != null) {
            return "Up to " + maxSalary + " " + currency;
        }
        return "Salary not specified";
    }
    
    public boolean isExpired() {
        return applicationDeadline != null && LocalDateTime.now().isAfter(applicationDeadline);
    }
    
    @Data
    public static class UserSummary {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
    }
    
    @Data
    public static class CompanySummary {
        private Long id;
        private String name;
        private String logoUrl;
        private String industry;
        private String location;
    }
    
    @Data
    public static class CategorySummary {
        private Long id;
        private String name;
        private String icon;
        private String color;
    }
    
    @Data
    public static class SkillSummary {
        private Long id;
        private String name;
        private String category;
    }
    
    public static JobResponse fromJob(Job job) {
        JobResponse response = new JobResponse();
        response.setId(job.getId());
        response.setTitle(job.getTitle());
        response.setDescription(job.getDescription());
        response.setLocation(job.getLocation());
        response.setJobType(job.getJobType());
        response.setExperienceLevel(job.getExperienceLevel());
        response.setMinSalary(job.getMinSalary());
        response.setMaxSalary(job.getMaxSalary());
        response.setCurrency(job.getCurrency());
        response.setIsRemote(job.getIsRemote());
        response.setIsActive(job.getIsActive());
        response.setApplicationDeadline(job.getApplicationDeadline());
        response.setRequirements(job.getRequirements());
        response.setBenefits(job.getBenefits());
        response.setApplicationInstructions(job.getApplicationInstructions());
        response.setViewsCount(job.getViewsCount());
        response.setApplicationsCount(job.getApplicationsCount());
        response.setCreatedAt(job.getCreatedAt());
        response.setUpdatedAt(job.getUpdatedAt());
        
        // Set posted by user summary
        if (job.getPostedBy() != null) {
            UserSummary userSummary = new UserSummary();
            userSummary.setId(job.getPostedBy().getId());
            userSummary.setFirstName(job.getPostedBy().getFirstName());
            userSummary.setLastName(job.getPostedBy().getLastName());
            userSummary.setEmail(job.getPostedBy().getEmail());
            response.setPostedBy(userSummary);
        }
        
        // Set company summary
        if (job.getCompany() != null) {
            CompanySummary companySummary = new CompanySummary();
            companySummary.setId(job.getCompany().getId());
            companySummary.setName(job.getCompany().getName());
            companySummary.setLogoUrl(job.getCompany().getLogoUrl());
            companySummary.setIndustry(job.getCompany().getIndustry());
            companySummary.setLocation(job.getCompany().getFullAddress());
            response.setCompany(companySummary);
        }
        
        // Set category summary
        if (job.getCategory() != null) {
            CategorySummary categorySummary = new CategorySummary();
            categorySummary.setId(job.getCategory().getId());
            categorySummary.setName(job.getCategory().getName());
            categorySummary.setIcon(job.getCategory().getIcon());
            categorySummary.setColor(job.getCategory().getColor());
            response.setCategory(categorySummary);
        }
        
        // Set required skills
        if (job.getRequiredSkills() != null) {
            response.setRequiredSkills(job.getRequiredSkills().stream()
                .map(skill -> {
                    SkillSummary skillSummary = new SkillSummary();
                    skillSummary.setId(skill.getId());
                    skillSummary.setName(skill.getName());
                    skillSummary.setCategory(skill.getCategory().name());
                    return skillSummary;
                })
                .collect(java.util.stream.Collectors.toSet()));
        }
        
        return response;
    }
}
