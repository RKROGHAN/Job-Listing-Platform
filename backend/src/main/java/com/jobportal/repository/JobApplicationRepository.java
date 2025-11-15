package com.jobportal.repository;

import com.jobportal.entity.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    
    List<JobApplication> findByUser_Id(Long userId);
    
    List<JobApplication> findByJob_Id(Long jobId);
    
    Page<JobApplication> findByUser_Id(Long userId, Pageable pageable);
    
    Page<JobApplication> findByJob_Id(Long jobId, Pageable pageable);
    
    Optional<JobApplication> findByUser_IdAndJob_Id(Long userId, Long jobId);
    
    boolean existsByUser_IdAndJob_Id(Long userId, Long jobId);
    
    List<JobApplication> findByStatus(JobApplication.ApplicationStatus status);
    
    List<JobApplication> findByUser_IdAndStatus(Long userId, JobApplication.ApplicationStatus status);
    
    List<JobApplication> findByJob_IdAndStatus(Long jobId, JobApplication.ApplicationStatus status);
    
    @Query("SELECT ja FROM JobApplication ja WHERE " +
           "ja.job.postedBy.id = :employerId")
    Page<JobApplication> findByEmployer(@Param("employerId") Long employerId, Pageable pageable);
    
    @Query("SELECT ja FROM JobApplication ja WHERE " +
           "ja.job.postedBy.id = :employerId AND " +
           "ja.status = :status")
    List<JobApplication> findByEmployerAndStatus(@Param("employerId") Long employerId, 
                                                @Param("status") JobApplication.ApplicationStatus status);
    
    @Query("SELECT ja FROM JobApplication ja WHERE " +
           "ja.appliedAt >= :since")
    List<JobApplication> findRecentApplications(@Param("since") LocalDateTime since);
    
    @Query("SELECT COUNT(ja) FROM JobApplication ja WHERE " +
           "ja.job.id = :jobId")
    long countByJob(@Param("jobId") Long jobId);
    
    @Query("SELECT COUNT(ja) FROM JobApplication ja WHERE " +
           "ja.user.id = :userId")
    long countByUser(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(ja) FROM JobApplication ja WHERE " +
           "ja.job.postedBy.id = :employerId")
    long countByEmployer(@Param("employerId") Long employerId);
    
    @Query("SELECT COUNT(ja) FROM JobApplication ja WHERE " +
           "ja.status = :status")
    long countByStatus(@Param("status") JobApplication.ApplicationStatus status);
    
    @Query("SELECT ja FROM JobApplication ja WHERE " +
           "ja.interviewScheduledAt BETWEEN :start AND :end")
    List<JobApplication> findInterviewsScheduledBetween(@Param("start") LocalDateTime start, 
                                                       @Param("end") LocalDateTime end);
    
    // Additional methods used in services
    boolean existsByUserAndJob(com.jobportal.entity.User user, com.jobportal.entity.Job job);
    
    Page<JobApplication> findByUserOrderByAppliedAtDesc(com.jobportal.entity.User user, Pageable pageable);
    
    Page<JobApplication> findByJobIdOrderByAppliedAtDesc(Long jobId, Pageable pageable);
    
    List<JobApplication> findByJobIdOrderByAppliedAtDesc(Long jobId);
    
    Page<JobApplication> findByStatusOrderByAppliedAtDesc(JobApplication.ApplicationStatus status, Pageable pageable);
    
    List<JobApplication> findByStatusOrderByAppliedAtDesc(JobApplication.ApplicationStatus status);
    
    long countByUser(com.jobportal.entity.User user);
    
    long countByJobId(Long jobId);
    
    boolean existsByUserAndJobId(com.jobportal.entity.User user, Long jobId);
}
