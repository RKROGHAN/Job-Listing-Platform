package com.jobportal.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Job {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Size(max = 200)
    @Column(name = "title")
    private String title;
    
    @NotBlank
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @NotBlank
    @Size(max = 100)
    @Column(name = "location")
    private String location;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "job_type")
    private JobType jobType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "experience_level")
    private ExperienceLevel experienceLevel;
    
    @Positive
    @Column(name = "min_salary", precision = 10, scale = 2)
    private BigDecimal minSalary;
    
    @Positive
    @Column(name = "max_salary", precision = 10, scale = 2)
    private BigDecimal maxSalary;
    
    @Column(name = "currency", length = 3)
    private String currency = "USD";
    
    @Column(name = "is_remote")
    private Boolean isRemote = false;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "application_deadline")
    private LocalDateTime applicationDeadline;
    
    @Column(name = "requirements", columnDefinition = "TEXT")
    private String requirements;
    
    @Column(name = "benefits", columnDefinition = "TEXT")
    private String benefits;
    
    @Column(name = "application_instructions", columnDefinition = "TEXT")
    private String applicationInstructions;
    
    @Column(name = "views_count")
    private Integer viewsCount = 0;
    
    @Column(name = "applications_count")
    private Integer applicationsCount = 0;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "posted_by", nullable = false)
    private User postedBy;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;
    
    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<JobApplication> applications = new HashSet<>();
    
    @OneToMany(mappedBy = "job", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<SavedJob> savedJobs = new HashSet<>();
    
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "job_skills",
               joinColumns = @JoinColumn(name = "job_id"),
               inverseJoinColumns = @JoinColumn(name = "skill_id"))
    private Set<Skill> requiredSkills = new HashSet<>();
    
    public enum JobType {
        FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE
    }
    
    public enum ExperienceLevel {
        ENTRY_LEVEL, MID_LEVEL, SENIOR_LEVEL, EXECUTIVE
    }
    
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
    
    public void incrementViews() {
        this.viewsCount = (this.viewsCount == null) ? 1 : this.viewsCount + 1;
    }
    
    public void incrementApplications() {
        this.applicationsCount = (this.applicationsCount == null) ? 1 : this.applicationsCount + 1;
    }
}
