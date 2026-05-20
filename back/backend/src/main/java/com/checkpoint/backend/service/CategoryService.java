package com.checkpoint.backend.service;

import com.checkpoint.backend.constants.CheckpointConstants;
import com.checkpoint.backend.entity.Category;
import com.checkpoint.backend.exception.ResourceNotFoundException;
import com.checkpoint.backend.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Lógica de negocio: gestionar categorías de las misiones
 * Las categorías predefinidas se crean en el arranque gracias a {@code DataInitializer}.
 */
@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    /**
     * Devuelve todas las categorías disponibles.
     */
    public List<Category> findAll() {
        return categoryRepository.findAll();
    }

    /**
     * Busca una categoría por su ID.
     *
     * @param id : ID de la categoría
     * @return categoría
     * @throws ResourceNotFoundException si no existe
     */
    public Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No existe la categoría con id " + id));
    }

    /**
     * Crea una nueva categoría tras validar el nombre.
     *
     * @param category datos de la categoría a crear
     * @return categoría con ID creado
     * @throws IllegalArgumentException si el nombre no cumple las validaciones
     */
    public Category create(Category category) {
        validarCategoria(category);
        category.setNombre(category.getNombre().trim());
        return categoryRepository.save(category);
    }

    /**
     * Elimina una categoría por su ID.
     * Las misiones con esta categoria se quedan sin ella
     * porque la FK admite null (relacion es opcional)
     * Misión puede existir sin categoría
     *
     * @param id ID de la categoría a eliminar
     * @throws ResourceNotFoundException si no existe
     */
    public void delete(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("No existe la categoría con id " + id);
        }
        categoryRepository.deleteById(id);
    }

    /**
     * Valida el nombre de la categoría: obligatorio, entre 3 y 40 caracteres (sin espacios: trim).
     *
     * @throws IllegalArgumentException si el nombre no cumple las validaciones
     */
    private void validarCategoria(Category category) {
        if (category.getNombre() == null || category.getNombre().isBlank())
            throw new IllegalArgumentException("El nombre de la categoría es obligatorio.");
        if (category.getNombre().trim().length() < CheckpointConstants.MIN_TITULO)
            throw new IllegalArgumentException("El nombre debe tener al menos " + CheckpointConstants.MIN_TITULO + " caracteres.");
        if (category.getNombre().trim().length() > CheckpointConstants.MAX_NOMBRE_CATEGORIA)
            throw new IllegalArgumentException("El nombre no puede exceder " + CheckpointConstants.MAX_NOMBRE_CATEGORIA + " caracteres.");
    }
}