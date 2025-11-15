package com.jobportal.controller;

import com.jobportal.service.AuthService;
import com.jobportal.service.UserService;
import com.jobportal.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import jakarta.annotation.PostConstruct;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "File Upload", description = "File upload management APIs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FileController {

    private final AuthService authService;
    private final UserService userService;

    @Value("${file.upload-dir:./uploads/}")
    private String uploadDir;
    
    private Path uploadPath;
    
    @PostConstruct
    public void init() {
        try {
            // Convert to absolute path
            Path basePath = Paths.get(uploadDir);
            if (!basePath.isAbsolute()) {
                // If relative, make it relative to the project root or user home
                String userHome = System.getProperty("user.home");
                uploadPath = Paths.get(userHome, "job-portal-uploads");
            } else {
                uploadPath = basePath;
            }
            
            // Create directory if it doesn't exist
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                log.info("Created upload directory: {}", uploadPath.toAbsolutePath());
            }
            
            log.info("File upload directory initialized: {}", uploadPath.toAbsolutePath());
        } catch (IOException e) {
            log.error("Failed to initialize upload directory", e);
            // Fallback to relative path
            uploadPath = Paths.get(uploadDir);
            try {
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
            } catch (IOException ex) {
                log.error("Failed to create fallback upload directory", ex);
            }
        }
    }

    @PostMapping("/upload/resume")
    @Operation(summary = "Upload resume", description = "Upload user resume file")
    public ResponseEntity<?> uploadResume(@RequestParam("file") MultipartFile file) {
        try {
            log.info("Resume upload request received");
            log.info("Security context authentication: {}", 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication());
            
            User currentUser;
            try {
                currentUser = authService.getCurrentUser();
                log.info("Current user: {}", currentUser.getEmail());
            } catch (RuntimeException e) {
                log.error("Authentication failed in getCurrentUser: {}", e.getMessage());
                Map<String, String> error = new HashMap<>();
                error.put("error", "Authentication failed");
                error.put("message", "Please login to upload resume");
                return ResponseEntity.status(401).body(error);
            }
            
            if (file.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "File is empty");
                return ResponseEntity.badRequest().body(error);
            }

            // Validate file type
            String contentType = file.getContentType();
            String originalFilename = file.getOriginalFilename();
            log.info("File content type: {}", contentType);
            log.info("File name: {}", originalFilename);
            log.info("File size: {}", file.getSize());
            
            // Determine file type from extension if Content-Type is not set or incorrect
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
            }
            
            boolean isValidType = false;
            if (contentType != null) {
                isValidType = contentType.equals("application/pdf") || 
                             contentType.equals("application/msword") ||
                             contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            }
            
            // If Content-Type validation failed, check file extension
            if (!isValidType) {
                if (fileExtension.equals(".pdf")) {
                    isValidType = true;
                    log.info("File type determined from extension: PDF");
                } else if (fileExtension.equals(".doc")) {
                    isValidType = true;
                    log.info("File type determined from extension: DOC");
                } else if (fileExtension.equals(".docx")) {
                    isValidType = true;
                    log.info("File type determined from extension: DOCX");
                }
            }
            
            if (!isValidType) {
                log.warn("Invalid file type: {} (extension: {})", contentType, fileExtension);
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid file type. Only PDF and Word documents are allowed.");
                error.put("receivedType", contentType != null ? contentType : "null");
                error.put("fileExtension", fileExtension);
                return ResponseEntity.badRequest().body(error);
            }

            // Ensure upload directory exists
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Delete old resume file if exists
            if (currentUser.getResumeUrl() != null && !currentUser.getResumeUrl().isEmpty()) {
                try {
                    String oldFilename = currentUser.getResumeUrl();
                    // Extract filename from URL (e.g., "/api/files/download/filename.pdf" -> "filename.pdf")
                    if (oldFilename.contains("/")) {
                        oldFilename = oldFilename.substring(oldFilename.lastIndexOf("/") + 1);
                    }
                    Path oldFilePath = uploadPath.resolve(oldFilename);
                    if (Files.exists(oldFilePath)) {
                        Files.delete(oldFilePath);
                        log.info("Deleted old resume file: {}", oldFilePath.toAbsolutePath());
                    }
                } catch (IOException e) {
                    log.warn("Failed to delete old resume file", e);
                    // Continue with upload even if deletion fails
                }
            }

            // Generate unique filename (originalFilename already declared above)
            String extension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                : "";
            String filename = "resume_" + currentUser.getId() + "_" + UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(filename);

            // Save file - ensure parent directory exists
            Files.createDirectories(filePath.getParent());
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            log.info("Resume saved to: {}", filePath.toAbsolutePath());

            // Generate file URL (relative path)
            String fileUrl = "/api/files/download/" + filename;

            // Update user resume URL
            User updatedUser = userService.updateResume(currentUser, fileUrl);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Resume uploaded successfully");
            response.put("fileUrl", fileUrl);
            response.put("user", createUserResponse(updatedUser));
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            // Check if it's an authentication error
            if (e.getMessage() != null && (e.getMessage().contains("not authenticated") || e.getMessage().contains("User not found"))) {
                log.error("Failed to upload resume - Authentication error", e);
                Map<String, String> error = new HashMap<>();
                error.put("error", "Authentication failed");
                error.put("message", "Please login to upload resume");
                return ResponseEntity.status(401).body(error);
            }
            // Re-throw if it's not an auth error, let it be caught by the general Exception handler
            throw e;
        } catch (IOException e) {
            log.error("Failed to upload resume - IOException", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to upload resume");
            error.put("message", e.getMessage());
            error.put("details", "IO Error: " + e.getClass().getSimpleName());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            log.error("Failed to upload resume - General error", e);
            log.error("Exception type: {}", e.getClass().getName());
            log.error("Exception message: {}", e.getMessage());
            if (e.getCause() != null) {
                log.error("Cause: {}", e.getCause().getClass().getName());
            }
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to upload resume");
            error.put("message", e.getMessage() != null ? e.getMessage() : "Unknown error occurred");
            error.put("exceptionType", e.getClass().getSimpleName());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/upload/profile-picture")
    @Operation(summary = "Upload profile picture", description = "Upload user profile picture")
    public ResponseEntity<?> uploadProfilePicture(@RequestParam("file") MultipartFile file) {
        try {
            User currentUser = authService.getCurrentUser();
            
            if (file.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "File is empty");
                return ResponseEntity.badRequest().body(error);
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Invalid file type. Only images are allowed.");
                return ResponseEntity.badRequest().body(error);
            }

            // Ensure upload directory exists
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                : ".jpg";
            String filename = "profile_" + currentUser.getId() + "_" + UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(filename);

            // Save file - ensure parent directory exists
            Files.createDirectories(filePath.getParent());
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            log.info("Profile picture saved to: {}", filePath.toAbsolutePath());

            // Generate file URL (relative path)
            String fileUrl = "/api/files/download/" + filename;

            // Update user profile picture URL
            User updatedUser = userService.updateProfilePicture(currentUser, fileUrl);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile picture uploaded successfully");
            response.put("fileUrl", fileUrl);
            response.put("user", createUserResponse(updatedUser));
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            log.error("Failed to upload profile picture", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to upload profile picture");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            log.error("Failed to upload profile picture", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to upload profile picture");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/download/{filename:.+}")
    @Operation(summary = "Download file", description = "Download uploaded file")
    public ResponseEntity<Resource> downloadFile(@PathVariable String filename) {
        try {
            // Security: prevent directory traversal
            if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
                log.warn("Invalid filename attempt: {}", filename);
                return ResponseEntity.badRequest().build();
            }
            
            Path filePath = uploadPath.resolve(filename).normalize();
            
            // Additional security: ensure the resolved path is still within upload directory
            if (!filePath.startsWith(uploadPath.normalize())) {
                log.warn("Path traversal attempt detected: {}", filename);
                return ResponseEntity.badRequest().build();
            }
            
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                String contentType = "application/octet-stream";
                try {
                    contentType = Files.probeContentType(filePath);
                    if (contentType == null) {
                        // Determine content type from extension
                        String lowerFilename = filename.toLowerCase();
                        if (lowerFilename.endsWith(".pdf")) {
                            contentType = "application/pdf";
                        } else if (lowerFilename.endsWith(".doc")) {
                            contentType = "application/msword";
                        } else if (lowerFilename.endsWith(".docx")) {
                            contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                        } else if (lowerFilename.endsWith(".jpg") || lowerFilename.endsWith(".jpeg")) {
                            contentType = "image/jpeg";
                        } else if (lowerFilename.endsWith(".png")) {
                            contentType = "image/png";
                        } else {
                            contentType = "application/octet-stream";
                        }
                    }
                } catch (IOException e) {
                    log.warn("Could not determine file type", e);
                }
                
                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .body(resource);
            } else {
                log.warn("File not found or not readable: {}", filePath.toAbsolutePath());
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Failed to download file: {}", filename, e);
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/resume")
    @Operation(summary = "Delete resume", description = "Delete user's resume file")
    public ResponseEntity<?> deleteResume() {
        try {
            User currentUser = authService.getCurrentUser();
            
            if (currentUser.getResumeUrl() == null || currentUser.getResumeUrl().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "No resume found to delete");
                return ResponseEntity.badRequest().body(error);
            }

            // Extract filename from URL
            String filename = currentUser.getResumeUrl();
            if (filename.contains("/")) {
                filename = filename.substring(filename.lastIndexOf("/") + 1);
            }
            
            Path filePath = uploadPath.resolve(filename);
            
            // Delete file if exists
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                log.info("Deleted resume file: {}", filePath.toAbsolutePath());
            }
            
            // Clear resume URL from user profile
            User updatedUser = userService.deleteResume(currentUser);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Resume deleted successfully");
            response.put("user", createUserResponse(updatedUser));
            
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            log.error("Failed to delete resume", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete resume");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        } catch (Exception e) {
            log.error("Failed to delete resume", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete resume");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    private Map<String, Object> createUserResponse(User user) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("firstName", user.getFirstName());
        response.put("lastName", user.getLastName());
        response.put("email", user.getEmail());
        response.put("phone", user.getPhone());
        response.put("role", user.getRole());
        response.put("isActive", user.getIsActive());
        response.put("isVerified", user.getIsVerified());
        response.put("profilePicture", user.getProfilePicture());
        response.put("resumeUrl", user.getResumeUrl());
        response.put("bio", user.getBio());
        response.put("location", user.getLocation());
        response.put("website", user.getWebsite());
        response.put("linkedinUrl", user.getLinkedinUrl());
        response.put("githubUrl", user.getGithubUrl());
        response.put("createdAt", user.getCreatedAt());
        response.put("updatedAt", user.getUpdatedAt());
        return response;
    }
}

