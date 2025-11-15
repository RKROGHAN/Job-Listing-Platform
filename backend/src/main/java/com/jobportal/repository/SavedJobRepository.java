package com.jobportal.repository;

import com.jobportal.entity.SavedJob;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, Long> {
    
    List<SavedJob> findByUser_Id(Long userId);
    
    Optional<SavedJob> findByUser_IdAndJob_Id(Long userId, Long jobId);
    
    boolean existsByUser_IdAndJob_Id(Long userId, Long jobId);
    
    void deleteByUser_IdAndJob_Id(Long userId, Long jobId);
    
    @Query("SELECT COUNT(sj) FROM SavedJob sj WHERE sj.user.id = :userId")
    long countByUser(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(sj) FROM SavedJob sj WHERE sj.job.id = :jobId")
    long countByJob(@Param("jobId") Long jobId);
    
    // Additional methods used in services
    Page<SavedJob> findByUserOrderBySavedAtDesc(com.jobportal.entity.User user, Pageable pageable);
    
    List<SavedJob> findByUserOrderBySavedAtDesc(com.jobportal.entity.User user);
    
    boolean existsByUserAndJob(com.jobportal.entity.User user, com.jobportal.entity.Job job);
    
    boolean existsByUserAndJobId(com.jobportal.entity.User user, Long jobId);
    
    Optional<SavedJob> findByUserAndJob(com.jobportal.entity.User user, com.jobportal.entity.Job job);
    
    long countByUser(com.jobportal.entity.User user);
}
