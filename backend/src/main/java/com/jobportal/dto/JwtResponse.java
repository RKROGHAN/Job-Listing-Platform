package com.jobportal.dto;

import com.jobportal.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {
    
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private List<String> roles;
    
    // Additional fields for backward compatibility
    private String firstName;
    private String lastName;
    private User.Role role;
    
    public JwtResponse(String token, Long id, String username, String email, List<String> roles) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
        this.roles = roles;
        this.type = "Bearer";
    }
    
    // Constructor with firstName and lastName for backward compatibility
    public JwtResponse(String token, Long id, String email, String firstName, String lastName, User.Role role) {
        this.token = token;
        this.id = id;
        this.username = email; // Use email as username
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.type = "Bearer";
        // Convert role to roles list
        this.roles = List.of("ROLE_" + role.name());
    }
}
