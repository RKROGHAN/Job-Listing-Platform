package com.jobportal.repository;

import com.jobportal.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {
    
    Optional<Skill> findByName(String name);
    
    List<Skill> findByIsActiveTrue();
    
    List<Skill> findByCategory(Skill.SkillCategory category);
    
    @Query("SELECT s FROM Skill s WHERE " +
           "LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Skill> searchSkills(@Param("keyword") String keyword);
    
    @Query("SELECT s FROM Skill s WHERE " +
           "s.isActive = true AND " +
           "s.category = :category")
    List<Skill> findActiveSkillsByCategory(@Param("category") Skill.SkillCategory category);
    
    @Query("SELECT s FROM Skill s WHERE " +
           "s.isActive = true AND " +
           "LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Skill> findActiveSkillsByNameContaining(@Param("keyword") String keyword);
    
    @Query("SELECT COUNT(s) FROM Skill s WHERE s.isActive = true")
    long countActiveSkills();
    
    @Query("SELECT COUNT(s) FROM Skill s WHERE s.category = :category")
    long countByCategory(@Param("category") Skill.SkillCategory category);
    
    // Additional methods used in services
    List<Skill> findByIsActiveTrueOrderByNameAsc();
    
    List<Skill> findByCategoryAndIsActiveTrueOrderByNameAsc(Skill.SkillCategory category);
    
    List<Skill> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);
}
