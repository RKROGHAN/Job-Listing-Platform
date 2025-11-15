package com.jobportal.repository;

import com.jobportal.entity.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    
    Optional<Company> findByName(String name);
    
    Optional<Company> findByEmail(String email);
    
    Optional<Company> findByUser_Id(Long userId);
    
    List<Company> findByIsActiveTrue();
    
    List<Company> findByIsVerifiedTrue();
    
    List<Company> findByIndustry(String industry);
    
    @Query("SELECT c FROM Company c WHERE " +
           "LOWER(c.city) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
           "LOWER(c.state) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
           "LOWER(c.country) LIKE LOWER(CONCAT('%', :location, '%')) OR " +
           "LOWER(c.address) LIKE LOWER(CONCAT('%', :location, '%'))")
    List<Company> findByLocationContaining(@Param("location") String location);
    
    @Query("SELECT c FROM Company c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.industry) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Company> searchCompanies(@Param("keyword") String keyword);
    
    @Query("SELECT c FROM Company c WHERE " +
           "c.city LIKE %:city% OR " +
           "c.state LIKE %:state% OR " +
           "c.country LIKE %:country%")
    List<Company> findByLocation(@Param("city") String city, 
                                @Param("state") String state, 
                                @Param("country") String country);
    
    @Query("SELECT c FROM Company c WHERE " +
           "c.companySize = :companySize")
    List<Company> findByCompanySize(@Param("companySize") String companySize);
    
    @Query("SELECT c FROM Company c WHERE " +
           "c.foundedYear >= :year")
    List<Company> findByFoundedYearAfter(@Param("year") Integer year);
    
    @Query("SELECT COUNT(c) FROM Company c WHERE c.isActive = true")
    long countActiveCompanies();
    
    @Query("SELECT COUNT(c) FROM Company c WHERE c.isVerified = true")
    long countVerifiedCompanies();
    
    // Additional methods used in services
    Page<Company> findByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);
    
    Optional<Company> findByUser(com.jobportal.entity.User user);
    
    List<Company> findByNameContainingIgnoreCaseAndIsActiveTrue(String name);
    
    List<Company> findByIndustryAndIsActiveTrue(String industry);
    
    List<Company> findByIsVerifiedTrueAndIsActiveTrueOrderByCreatedAtDesc();
}
