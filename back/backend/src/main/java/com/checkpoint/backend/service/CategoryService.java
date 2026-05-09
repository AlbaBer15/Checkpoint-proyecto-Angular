package com.checkpoint.backend.service;

import com.checkpoint.backend.entity.Category;
import com.checkpoint.backend.exception.ResourceNotFoundException;
import com.checkpoint.backend.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<Category> findAll() {
        return categoryRepository.findAll();
    }

    public Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe la categoría con id " + id));
    }

    public Category create(Category category) {
        validarCategoria(category);
        category.setNombre(category.getNombre().trim());
        return categoryRepository.save(category);
    }

    public void delete(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("No existe la categoría con id " + id);
        }
        categoryRepository.deleteById(id);
    }

    private void validarCategoria(Category category) {
        if (category.getNombre() == null || category.getNombre().isBlank())
            throw new IllegalArgumentException("El nombre de la categoría es obligatorio.");
        if (category.getNombre().trim().length() < 3)
            throw new IllegalArgumentException("El nombre debe tener al menos 3 caracteres.");
        if (category.getNombre().trim().length() > 40)
            throw new IllegalArgumentException("El nombre no puede exceder 40 caracteres.");
    }
}