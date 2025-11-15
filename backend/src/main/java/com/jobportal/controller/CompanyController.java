package com.jobportal.controller;

import com.jobportal.entity.Company;
import com.jobportal.entity.User;
import com.jobportal.service.AuthService;
import com.jobportal.service.CompanyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Companies", description = "Company management APIs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CompanyController {

    private final CompanyService companyService;
    private final AuthService authService;

    @PostMapping
    @Operation(summary = "Create a new company", description = "Create a new company profile")
    public ResponseEntity<?> createCompany(@Valid @RequestBody Company company) {
        try {
            User currentUser = authService.getCurrentUser();
            Company createdCompany = companyService.createCompany(company, currentUser);
            return ResponseEntity.ok(createCompanyResponse(createdCompany));
        } catch (Exception e) {
            log.error("Failed to create company", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create company");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping
    @Operation(summary = "Get all companies", description = "Get paginated list of all companies")
    public ResponseEntity<Page<Map<String, Object>>> getAllCompanies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Company> companies = companyService.getAllCompanies(pageable);
        Page<Map<String, Object>> companyResponses = companies.map(this::createCompanyResponse);
        
        return ResponseEntity.ok(companyResponses);
    }

    @GetMapping("/search")
    @Operation(summary = "Search companies", description = "Search companies by keyword")
    public ResponseEntity<List<Map<String, Object>>> searchCompanies(@RequestParam String keyword) {
        List<Company> companies = companyService.searchCompanies(keyword);
        List<Map<String, Object>> companyResponses = companies.stream()
                .map(this::createCompanyResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(companyResponses);
    }

    @GetMapping("/industry/{industry}")
    @Operation(summary = "Get companies by industry", description = "Get companies filtered by industry")
    public ResponseEntity<List<Map<String, Object>>> getCompaniesByIndustry(@PathVariable String industry) {
        List<Company> companies = companyService.getCompaniesByIndustry(industry);
        List<Map<String, Object>> companyResponses = companies.stream()
                .map(this::createCompanyResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(companyResponses);
    }

    @GetMapping("/verified")
    @Operation(summary = "Get verified companies", description = "Get list of verified companies")
    public ResponseEntity<List<Map<String, Object>>> getVerifiedCompanies() {
        List<Company> companies = companyService.getVerifiedCompanies();
        List<Map<String, Object>> companyResponses = companies.stream()
                .map(this::createCompanyResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(companyResponses);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get company by ID", description = "Get company details by ID")
    public ResponseEntity<?> getCompanyById(@PathVariable Long id) {
        try {
            Company company = companyService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Company not found"));
            return ResponseEntity.ok(createCompanyResponse(company));
        } catch (Exception e) {
            log.error("Failed to get company with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Company not found");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/my-company")
    @Operation(summary = "Get my company", description = "Get current user's company profile")
    public ResponseEntity<?> getMyCompany() {
        try {
            User currentUser = authService.getCurrentUser();
            Company company = companyService.findByUser(currentUser)
                    .orElseThrow(() -> new RuntimeException("No company profile found"));
            return ResponseEntity.ok(createCompanyResponse(company));
        } catch (Exception e) {
            log.error("Failed to get user's company", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Company not found");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update company", description = "Update company details")
    public ResponseEntity<?> updateCompany(@PathVariable Long id, @Valid @RequestBody Company companyDetails) {
        try {
            User currentUser = authService.getCurrentUser();
            Company company = companyService.updateCompany(id, companyDetails, currentUser);
            return ResponseEntity.ok(createCompanyResponse(company));
        } catch (Exception e) {
            log.error("Failed to update company with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update company");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete company", description = "Delete a company")
    public ResponseEntity<?> deleteCompany(@PathVariable Long id) {
        try {
            User currentUser = authService.getCurrentUser();
            companyService.deleteCompany(id, currentUser);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Company deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to delete company with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete company");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}/logo")
    @Operation(summary = "Update company logo", description = "Update company logo URL")
    public ResponseEntity<?> updateCompanyLogo(@PathVariable Long id, @RequestParam String logoUrl) {
        try {
            Company company = companyService.updateCompanyLogo(id, logoUrl);
            return ResponseEntity.ok(createCompanyResponse(company));
        } catch (Exception e) {
            log.error("Failed to update company logo for id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update company logo");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}/cover-image")
    @Operation(summary = "Update company cover image", description = "Update company cover image URL")
    public ResponseEntity<?> updateCompanyCoverImage(@PathVariable Long id, @RequestParam String coverImageUrl) {
        try {
            Company company = companyService.updateCompanyCoverImage(id, coverImageUrl);
            return ResponseEntity.ok(createCompanyResponse(company));
        } catch (Exception e) {
            log.error("Failed to update company cover image for id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update company cover image");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/{id}/verify")
    @Operation(summary = "Verify company", description = "Verify a company (Admin only)")
    public ResponseEntity<?> verifyCompany(@PathVariable Long id) {
        try {
            User currentUser = authService.getCurrentUser();
            if (!currentUser.isAdmin()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Access denied");
                error.put("message", "Only administrators can verify companies");
                return ResponseEntity.badRequest().body(error);
            }
            
            Company company = companyService.verifyCompany(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Company verified successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to verify company with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to verify company");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    private Map<String, Object> createCompanyResponse(Company company) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", company.getId());
        response.put("name", company.getName());
        response.put("description", company.getDescription());
        response.put("website", company.getWebsite());
        response.put("email", company.getEmail());
        response.put("phone", company.getPhone());
        response.put("address", company.getAddress());
        response.put("city", company.getCity());
        response.put("state", company.getState());
        response.put("zipCode", company.getZipCode());
        response.put("country", company.getCountry());
        response.put("industry", company.getIndustry());
        response.put("companySize", company.getCompanySize());
        response.put("foundedYear", company.getFoundedYear());
        response.put("logoUrl", company.getLogoUrl());
        response.put("coverImageUrl", company.getCoverImageUrl());
        response.put("linkedinUrl", company.getLinkedinUrl());
        response.put("twitterUrl", company.getTwitterUrl());
        response.put("facebookUrl", company.getFacebookUrl());
        response.put("isVerified", company.getIsVerified());
        response.put("isActive", company.getIsActive());
        response.put("createdAt", company.getCreatedAt());
        response.put("updatedAt", company.getUpdatedAt());
        response.put("fullAddress", company.getFullAddress());
        return response;
    }
}
