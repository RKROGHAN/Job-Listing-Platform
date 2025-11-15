package com.jobportal.controller;

import com.jobportal.entity.Category;
import com.jobportal.service.CategoryService;
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
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Categories", description = "Category management APIs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    @Operation(summary = "Create a new category", description = "Create a new job category")
    public ResponseEntity<?> createCategory(@Valid @RequestBody Category category) {
        try {
            Category createdCategory = categoryService.createCategory(category);
            return ResponseEntity.ok(createCategoryResponse(createdCategory));
        } catch (Exception e) {
            log.error("Failed to create category", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create category");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping
    @Operation(summary = "Get all categories", description = "Get list of all active categories")
    public ResponseEntity<List<Map<String, Object>>> getAllCategories() {
        List<Category> categories = categoryService.getAllCategories();
        List<Map<String, Object>> categoryResponses = categories.stream()
                .map(this::createCategoryResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(categoryResponses);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID", description = "Get category details by ID")
    public ResponseEntity<?> getCategoryById(@PathVariable Long id) {
        try {
            Category category = categoryService.findById(id)
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            return ResponseEntity.ok(createCategoryResponse(category));
        } catch (Exception e) {
            log.error("Failed to get category with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Category not found");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update category", description = "Update category details")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @Valid @RequestBody Category categoryDetails) {
        try {
            Category category = categoryService.updateCategory(id, categoryDetails);
            return ResponseEntity.ok(createCategoryResponse(category));
        } catch (Exception e) {
            log.error("Failed to update category with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update category");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete category", description = "Delete a category")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            categoryService.deleteCategory(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Category deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to delete category with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to delete category");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}/activate")
    @Operation(summary = "Activate category", description = "Activate a category")
    public ResponseEntity<?> activateCategory(@PathVariable Long id) {
        try {
            Category category = categoryService.activateCategory(id);
            return ResponseEntity.ok(createCategoryResponse(category));
        } catch (Exception e) {
            log.error("Failed to activate category with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to activate category");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate category", description = "Deactivate a category")
    public ResponseEntity<?> deactivateCategory(@PathVariable Long id) {
        try {
            Category category = categoryService.deactivateCategory(id);
            return ResponseEntity.ok(createCategoryResponse(category));
        } catch (Exception e) {
            log.error("Failed to deactivate category with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to deactivate category");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    private Map<String, Object> createCategoryResponse(Category category) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", category.getId());
        response.put("name", category.getName());
        response.put("description", category.getDescription());
        response.put("icon", category.getIcon());
        response.put("color", category.getColor());
        response.put("isActive", category.getIsActive());
        response.put("createdAt", category.getCreatedAt());
        response.put("updatedAt", category.getUpdatedAt());
        return response;
    }
}
