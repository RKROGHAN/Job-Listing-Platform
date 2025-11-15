package com.jobportal.service;

import com.jobportal.entity.Job;
import com.jobportal.entity.SavedJob;
import com.jobportal.entity.User;
import com.jobportal.repository.SavedJobRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SavedJobService {

    private final SavedJobRepository savedJobRepository;
    private final JobService jobService;

    public SavedJob saveJob(Long jobId, User user) {
        Job job = jobService.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        // Check if job is already saved
        if (savedJobRepository.existsByUserAndJob(user, job)) {
            throw new RuntimeException("Job is already saved");
        }

        SavedJob savedJob = new SavedJob(user, job);
        return savedJobRepository.save(savedJob);
    }

    public void unsaveJob(Long jobId, User user) {
        Job job = jobService.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        SavedJob savedJob = savedJobRepository.findByUserAndJob(user, job)
                .orElseThrow(() -> new RuntimeException("Job is not saved"));

        savedJobRepository.delete(savedJob);
    }

    public List<SavedJob> getSavedJobsByUser(User user) {
        return savedJobRepository.findByUserOrderBySavedAtDesc(user);
    }

    public Page<SavedJob> getSavedJobsByUser(User user, Pageable pageable) {
        return savedJobRepository.findByUserOrderBySavedAtDesc(user, pageable);
    }

    public boolean isJobSavedByUser(Long jobId, User user) {
        return savedJobRepository.existsByUserAndJobId(user, jobId);
    }

    public long getSavedJobCountByUser(User user) {
        return savedJobRepository.countByUser(user);
    }

    public Optional<SavedJob> findByUserAndJob(User user, Job job) {
        return savedJobRepository.findByUserAndJob(user, job);
    }
}
