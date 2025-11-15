package com.jobportal.service;

import com.jobportal.dto.RegisterRequest;
import com.jobportal.entity.User;
import com.jobportal.entity.Skill;
import com.jobportal.repository.UserRepository;
import com.jobportal.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final PasswordEncoder passwordEncoder;

    public User createUser(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        User user = new User();
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setPhone(registerRequest.getPhone());
        user.setRole(registerRequest.getRole());
        user.setIsActive(true);
        user.setIsVerified(false);

        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public User updateUser(User user) {
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getUsersByRole(User.Role role) {
        return userRepository.findByRole(role);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User verifyUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsVerified(true);
        return userRepository.save(user);
    }

    public User updateProfile(User user, String firstName, String lastName, String phone, 
                             String bio, String location, String website, String linkedinUrl, String githubUrl) {
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPhone(phone);
        user.setBio(bio);
        user.setLocation(location);
        user.setWebsite(website);
        user.setLinkedinUrl(linkedinUrl);
        user.setGithubUrl(githubUrl);
        return userRepository.save(user);
    }

    public User updatePassword(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }

    public User updateProfilePicture(User user, String profilePictureUrl) {
        user.setProfilePicture(profilePictureUrl);
        return userRepository.save(user);
    }

    public User updateResume(User user, String resumeUrl) {
        user.setResumeUrl(resumeUrl);
        return userRepository.save(user);
    }
    
    public User deleteResume(User user) {
        user.setResumeUrl(null);
        return userRepository.save(user);
    }

    public User addSkill(User user, Long skillId) {
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Skill not found"));
        user.getSkills().add(skill);
        return userRepository.save(user);
    }

    public User removeSkill(User user, Long skillId) {
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException("Skill not found"));
        user.getSkills().remove(skill);
        return userRepository.save(user);
    }

    public User updateSkills(User user, List<Long> skillIds) {
        Set<Skill> skills = new java.util.HashSet<>();
        for (Long skillId : skillIds) {
            Skill skill = skillRepository.findById(skillId)
                    .orElseThrow(() -> new RuntimeException("Skill not found: " + skillId));
            skills.add(skill);
        }
        user.setSkills(skills);
        return userRepository.save(user);
    }
}
