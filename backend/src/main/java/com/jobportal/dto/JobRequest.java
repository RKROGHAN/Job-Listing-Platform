package com.jobportal.dto;

import com.jobportal.entity.Job;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class JobRequest {
    
    @NotBlank(message = "Job title is required")
    private String title;
    
    @NotBlank(message = "Job description is required")
    private String description;
    
    @NotBlank(message = "Location is required")
    private String location;
    
    @NotNull(message = "Job type is required")
    private Job.JobType jobType;
    
    @NotNull(message = "Experience level is required")
    private Job.ExperienceLevel experienceLevel;
    
    private BigDecimal minSalary;
    
    private BigDecimal maxSalary;
    
    private String currency = "USD";
    
    private Boolean isRemote = false;
    
    private LocalDateTime applicationDeadline;
    
    private String requirements;
    
    private String benefits;
    
    private String applicationInstructions;
    
    private Long categoryId;
    
    private Long companyId;
    
    private java.util.List<Long> requiredSkillIds;
}
