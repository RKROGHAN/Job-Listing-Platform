package com.jobportal.service;

import com.jobportal.entity.Company;
import com.jobportal.entity.User;
import com.jobportal.repository.CompanyRepository;
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
public class CompanyService {

    private final CompanyRepository companyRepository;

    public Company createCompany(Company company, User user) {
        company.setUser(user);
        company.setIsActive(true);
        company.setIsVerified(false);
        return companyRepository.save(company);
    }

    public Optional<Company> findById(Long id) {
        return companyRepository.findById(id);
    }

    public Optional<Company> findByUser(User user) {
        return companyRepository.findByUser(user);
    }

    public Company updateCompany(Long id, Company companyDetails, User currentUser) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        // Check if user has permission to update this company
        if (!company.getUser().getId().equals(currentUser.getId()) && !currentUser.isAdmin()) {
            throw new RuntimeException("You don't have permission to update this company");
        }

        company.setName(companyDetails.getName());
        company.setDescription(companyDetails.getDescription());
        company.setWebsite(companyDetails.getWebsite());
        company.setEmail(companyDetails.getEmail());
        company.setPhone(companyDetails.getPhone());
        company.setAddress(companyDetails.getAddress());
        company.setCity(companyDetails.getCity());
        company.setState(companyDetails.getState());
        company.setZipCode(companyDetails.getZipCode());
        company.setCountry(companyDetails.getCountry());
        company.setIndustry(companyDetails.getIndustry());
        company.setCompanySize(companyDetails.getCompanySize());
        company.setFoundedYear(companyDetails.getFoundedYear());
        company.setLogoUrl(companyDetails.getLogoUrl());
        company.setCoverImageUrl(companyDetails.getCoverImageUrl());
        company.setLinkedinUrl(companyDetails.getLinkedinUrl());
        company.setTwitterUrl(companyDetails.getTwitterUrl());
        company.setFacebookUrl(companyDetails.getFacebookUrl());

        return companyRepository.save(company);
    }

    public void deleteCompany(Long id, User currentUser) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        // Check if user has permission to delete this company
        if (!company.getUser().getId().equals(currentUser.getId()) && !currentUser.isAdmin()) {
            throw new RuntimeException("You don't have permission to delete this company");
        }

        companyRepository.deleteById(id);
    }

    public Page<Company> getAllCompanies(Pageable pageable) {
        return companyRepository.findByIsActiveTrueOrderByCreatedAtDesc(pageable);
    }

    public List<Company> searchCompanies(String keyword) {
        return companyRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(keyword);
    }

    public List<Company> getCompaniesByIndustry(String industry) {
        return companyRepository.findByIndustryAndIsActiveTrue(industry);
    }

    public List<Company> getVerifiedCompanies() {
        return companyRepository.findByIsVerifiedTrueAndIsActiveTrueOrderByCreatedAtDesc();
    }

    public Company verifyCompany(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        company.setIsVerified(true);
        return companyRepository.save(company);
    }

    public Company updateCompanyLogo(Long companyId, String logoUrl) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        company.setLogoUrl(logoUrl);
        return companyRepository.save(company);
    }

    public Company updateCompanyCoverImage(Long companyId, String coverImageUrl) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        company.setCoverImageUrl(coverImageUrl);
        return companyRepository.save(company);
    }
}
