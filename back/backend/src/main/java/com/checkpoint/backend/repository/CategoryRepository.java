package com.checkpoint.backend.repository;

import com.checkpoint.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Acceso a base de datos para categorías.
 */
public interface CategoryRepository extends JpaRepository<Category, Long> {
}
