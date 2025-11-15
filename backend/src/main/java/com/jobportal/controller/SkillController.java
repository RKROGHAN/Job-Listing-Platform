package com.jobportal.controller;

import com.jobportal.entity.Skill;
import com.jobportal.service.SkillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Skills", description = "Skill management APIs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SkillController {

    private final SkillService skillService;

    @PostMapping
    @Operation(summary = "Create a new skill", description = "Create a new skill")
    public ResponseEntity<?> createSkill(@Valid @RequestBody Skill skill) {
        try {
            Skill createdSkill = skillService.createSkill(skill);
            return ResponseEntity.ok(createSkillResponse(createdSkill));
        } catch (Exception e) {
            log.error("Failed to create skill", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create skill");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping
    @Operation(summary = "Get all skills", description = "Get list of all active skills")
    public ResponseEntity<List<Map<String, Object>>> getAllSkills() {
        List<Skill> skills = skillService.getAllSkills();
        List<Map<String, Object>> skillResponses = skills.stream()
                .map(this::createSkillResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(skillResponses);
    }

    @GetMapping("/search")
    @Operation(summary = "Search skills", description = "Search skills by keyword")
    public ResponseEntity<List<Map<String, Object>>> searchSkills(@RequestParam String keyword) {
        List<Skill> skills = skillService.searchSkills(keyword);
        List<Map<String, Object>> skillResponses = skills.stream()
                .map(this::createSkillResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(skillResponses);
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Get skills by category", description = "Get skills filtered by category")
    public ResponseEntity<List<Map<String, Object>>> getSkillsByCategory(@PathVariable Skill.SkillCategory category) {
        List<Skill> skills = skillService.getSkillsByCategory(category);
        List<Map<String, Object>> skillResponses = skills.stream()
                .map(this::createSkillResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(skillResponses);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get skill by ID", description = "Get skill details by ID")
    public ResponseEntity<?> getSkillById(@PathVariable Long id) {
        try {
            Skill skill = skillService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Skill not found"));
            return ResponseEntity.ok(createSkillResponse(skill));
        } catch (Exception e) {
            log.error("Failed to get skill with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Skill not found");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update skill", description = "Update skill details")
    public ResponseEntity<?> updateSkill(@PathVariable Long id, @Valid @RequestBody Skill skillDetails) {
        try {
            Skill skill = skillService.updateSkill(id, skillDetails);
            return ResponseEntity.ok(createSkillResponse(skill));
        } catch (Exception e) {
            log.error("Failed to update skill with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update skill");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete skill", description = "Delete a skill")
    public ResponseEntity<?> deleteSkill(@PathVariable Long id) {
        try {
            skillService.deleteSkill(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Skill deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to delete skill with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete skill");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}/activate")
    @Operation(summary = "Activate skill", description = "Activate a skill")
    public ResponseEntity<?> activateSkill(@PathVariable Long id) {
        try {
            Skill skill = skillService.activateSkill(id);
            return ResponseEntity.ok(createSkillResponse(skill));
        } catch (Exception e) {
            log.error("Failed to activate skill with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to activate skill");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate skill", description = "Deactivate a skill")
    public ResponseEntity<?> deactivateSkill(@PathVariable Long id) {
        try {
            Skill skill = skillService.deactivateSkill(id);
            return ResponseEntity.ok(createSkillResponse(skill));
        } catch (Exception e) {
            log.error("Failed to deactivate skill with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to deactivate skill");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    private Map<String, Object> createSkillResponse(Skill skill) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", skill.getId());
        response.put("name", skill.getName());
        response.put("description", skill.getDescription());
        response.put("category", skill.getCategory());
        response.put("isActive", skill.getIsActive());
        response.put("createdAt", skill.getCreatedAt());
        response.put("updatedAt", skill.getUpdatedAt());
        return response;
    }
}
