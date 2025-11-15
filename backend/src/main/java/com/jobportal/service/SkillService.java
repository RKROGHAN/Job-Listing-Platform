package com.jobportal.service;

import com.jobportal.entity.Skill;
import com.jobportal.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SkillService {

    private final SkillRepository skillRepository;

    public Skill createSkill(Skill skill) {
        skill.setIsActive(true);
        return skillRepository.save(skill);
    }

    public Optional<Skill> findById(Long id) {
        return skillRepository.findById(id);
    }

    public Optional<Skill> findByName(String name) {
        return skillRepository.findByName(name);
    }

    public Skill updateSkill(Long id, Skill skillDetails) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Skill not found"));

        skill.setName(skillDetails.getName());
        skill.setDescription(skillDetails.getDescription());
        skill.setCategory(skillDetails.getCategory());

        return skillRepository.save(skill);
    }

    public void deleteSkill(Long id) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Skill not found"));
        skillRepository.deleteById(id);
    }

    public List<Skill> getAllSkills() {
        return skillRepository.findByIsActiveTrueOrderByNameAsc();
    }

    public List<Skill> getAllSkillsIncludingInactive() {
        return skillRepository.findAll();
    }

    public List<Skill> getSkillsByCategory(Skill.SkillCategory category) {
        return skillRepository.findByCategoryAndIsActiveTrueOrderByNameAsc(category);
    }

    public List<Skill> searchSkills(String keyword) {
        return skillRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(keyword);
    }

    public Skill deactivateSkill(Long id) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Skill not found"));
        skill.setIsActive(false);
        return skillRepository.save(skill);
    }

    public Skill activateSkill(Long id) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Skill not found"));
        skill.setIsActive(true);
        return skillRepository.save(skill);
    }
}
