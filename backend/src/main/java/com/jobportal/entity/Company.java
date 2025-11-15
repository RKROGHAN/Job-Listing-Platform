package com.jobportal.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "companies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Company {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Size(max = 100)
    @Column(name = "name")
    private String name;
    
    @Size(max = 500)
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Size(max = 100)
    @Column(name = "website")
    private String website;
    
    @Email
    @Size(max = 100)
    @Column(name = "email")
    private String email;
    
    @Size(max = 20)
    @Column(name = "phone")
    private String phone;
    
    @Size(max = 200)
    @Column(name = "address")
    private String address;
    
    @Size(max = 100)
    @Column(name = "city")
    private String city;
    
    @Size(max = 100)
    @Column(name = "state")
    private String state;
    
    @Size(max = 20)
    @Column(name = "zip_code")
    private String zipCode;
    
    @Size(max = 100)
    @Column(name = "country")
    private String country;
    
    @Size(max = 100)
    @Column(name = "industry")
    private String industry;
    
    @Column(name = "company_size")
    private String companySize;
    
    @Column(name = "founded_year")
    private Integer foundedYear;
    
    @Column(name = "logo_url")
    private String logoUrl;
    
    @Column(name = "cover_image_url")
    private String coverImageUrl;
    
    @Column(name = "linkedin_url")
    private String linkedinUrl;
    
    @Column(name = "twitter_url")
    private String twitterUrl;
    
    @Column(name = "facebook_url")
    private String facebookUrl;
    
    @Column(name = "is_verified")
    private Boolean isVerified = false;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Job> jobs = new HashSet<>();
    
    // Helper methods
    public String getFullAddress() {
        StringBuilder address = new StringBuilder();
        if (this.address != null && !this.address.isEmpty()) {
            address.append(this.address);
        }
        if (this.city != null && !this.city.isEmpty()) {
            if (address.length() > 0) address.append(", ");
            address.append(this.city);
        }
        if (this.state != null && !this.state.isEmpty()) {
            if (address.length() > 0) address.append(", ");
            address.append(this.state);
        }
        if (this.country != null && !this.country.isEmpty()) {
            if (address.length() > 0) address.append(", ");
            address.append(this.country);
        }
        return address.toString();
    }
    
    public String getCompanySizeDisplay() {
        if (companySize == null) return "Not specified";
        return companySize;
    }
}
