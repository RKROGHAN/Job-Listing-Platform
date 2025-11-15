package com.jobportal.repository;

import com.jobportal.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    
    List<Job> findByIsActiveTrue();
    
    Page<Job> findByIsActiveTrue(Pageable pageable);
    
    List<Job> findByPostedBy_Id(Long userId);
    
    List<Job> findByCompany_Id(Long companyId);
    
    List<Job> findByCategory_Id(Long categoryId);
    
    List<Job> findByJobType(Job.JobType jobType);
    
    List<Job> findByExperienceLevel(Job.ExperienceLevel experienceLevel);
    
    List<Job> findByIsRemoteTrue();
    
    @Query("SELECT j FROM Job j WHERE " +
           "j.isActive = true AND " +
           "j.applicationDeadline > :now")
    List<Job> findActiveJobsNotExpired(@Param("now") LocalDateTime now);
    
    @Query("SELECT j FROM Job j WHERE " +
           "j.isActive = true AND " +
           "(LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.location) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Job> searchJobs(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT j FROM Job j WHERE " +
           "j.isActive = true AND " +
           "j.location LIKE %:location%")
    Page<Job> findByLocation(@Param("location") String location, Pageable pageable);
    
    @Query("SELECT j FROM Job j WHERE " +
           "j.isActive = true AND " +
           "j.minSalary >= :minSalary AND j.maxSalary <= :maxSalary")
    Page<Job> findBySalaryRange(@Param("minSalary") BigDecimal minSalary, 
                                @Param("maxSalary") BigDecimal maxSalary, 
                                Pageable pageable);
    
    @Query("SELECT j FROM Job j WHERE " +
           "j.isActive = true AND " +
           "j.jobType = :jobType")
    Page<Job> findByJobType(@Param("jobType") Job.JobType jobType, Pageable pageable);
    
    @Query("SELECT j FROM Job j WHERE " +
           "j.isActive = true AND " +
           "j.experienceLevel = :experienceLevel")
    Page<Job> findByExperienceLevel(@Param("experienceLevel") Job.ExperienceLevel experienceLevel, 
                                   Pageable pageable);
    
    @Query("SELECT j FROM Job j WHERE " +
           "j.isActive = true AND " +
           "j.company.id = :companyId")
    Page<Job> findByCompany(@Param("companyId") Long companyId, Pageable pageable);
    
    @Query("SELECT j FROM Job j WHERE " +
           "j.isActive = true AND " +
           "j.category.id = :categoryId")
    Page<Job> findByCategory(@Param("categoryId") Long categoryId, Pageable pageable);
    
    @Query("SELECT j FROM Job j WHERE " +
           "j.isActive = true AND " +
           "j.isRemote = :isRemote")
    Page<Job> findByRemoteStatus(@Param("isRemote") Boolean isRemote, Pageable pageable);
    
    @Query("SELECT j FROM Job j WHERE " +
           "j.isActive = true AND " +
           "j.viewsCount = (SELECT MAX(j2.viewsCount) FROM Job j2 WHERE j2.isActive = true)")
    List<Job> findMostViewedJobs();
    
    @Query("SELECT j FROM Job j WHERE " +
           "j.isActive = true AND " +
           "j.applicationsCount = (SELECT MAX(j2.applicationsCount) FROM Job j2 WHERE j2.isActive = true)")
    List<Job> findMostAppliedJobs();
    
    @Query("SELECT j FROM Job j WHERE " +
           "j.isActive = true AND " +
           "j.createdAt >= :since")
    List<Job> findRecentJobs(@Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(j) FROM Job j WHERE j.isActive = true")
    long countActiveJobs();
    
    @Query("SELECT COUNT(j) FROM Job j WHERE j.postedBy.id = :userId")
    long countByPostedBy(@Param("userId") Long userId);
    
    // Additional methods used in services
    Page<Job> findByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);
    
    List<Job> findByPostedByOrderByCreatedAtDesc(com.jobportal.entity.User user);
    
    List<Job> findByCompanyIdAndIsActiveTrueOrderByCreatedAtDesc(Long companyId);
    
    List<Job> findByCategoryIdAndIsActiveTrueOrderByCreatedAtDesc(Long categoryId);
    
    List<Job> findTop10ByIsActiveTrueOrderByCreatedAtDesc();
    
    List<Job> findTop10ByIsActiveTrueOrderByViewsCountDesc();
    
    List<Job> findByApplicationDeadlineBeforeAndIsActiveTrue(LocalDateTime deadline);
    
    @Query("SELECT j FROM Job j WHERE " +
           "j.isActive = true AND " +
           "(:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:jobType IS NULL OR j.jobType = :jobType) AND " +
           "(:experienceLevel IS NULL OR j.experienceLevel = :experienceLevel) AND " +
           "(:isRemote IS NULL OR j.isRemote = :isRemote)")
    Page<Job> findJobsWithFilters(@Param("keyword") String keyword,
                                  @Param("location") String location,
                                  @Param("jobType") Job.JobType jobType,
                                  @Param("experienceLevel") Job.ExperienceLevel experienceLevel,
                                  @Param("isRemote") Boolean isRemote,
                                  Pageable pageable);
}
