package com.checkpoint.backend.config;

import com.checkpoint.backend.entity.Achievement;
import com.checkpoint.backend.entity.Category;
import com.checkpoint.backend.repository.AchievementRepository;
import com.checkpoint.backend.repository.CategoryRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class DataInitializer implements ApplicationRunner {

    private final AchievementRepository achievementRepository;
    private final CategoryRepository categoryRepository;

    public DataInitializer(
            AchievementRepository achievementRepository,
            CategoryRepository categoryRepository) {
        this.achievementRepository = achievementRepository;
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        inicializarAchievements();
        inicializarCategories();
    }

    private void inicializarAchievements() {
        if (achievementRepository.count() > 0) return;

        achievementRepository.saveAll(List.of(
                achievement("Primera Misión",    "Completa tu primera misión",        0,   "⚔️"),
                achievement("Explorador",        "Acumula 100 XP",                    100, "🌍"),
                achievement("Racha de Fuego",    "Completa 5 misiones",               0,   "🔥"),
                achievement("Coleccionista",     "Ten 3 misiones favoritas",          0,   "❤️"),
                achievement("Veterano",          "Acumula 500 XP",                    500, "⚔️"),
                achievement("Leyenda",           "Completa 10 misiones",              0,   "👑"),
                achievement("Maestro",           "Acumula 1000 XP",                   1000,"🌟"),
                achievement("Imparable",         "Completa 20 misiones",              0,   "💫")
        ));
    }

    private void inicializarCategories() {
        if (categoryRepository.count() > 0) return;

        categoryRepository.saveAll(List.of(
                category("Misiones de Combate",   "⚔️", "#ff6b6b"),
                category("Conocimiento Místico",   "📜", "#a855f7"),
                category("Fortaleza Interior",    "💪", "#00ff9d"),
                category("El Refugio",            "🏕️", "#ffd447"),
                category("Travesías",             "🗺️", "#00e5ff"),
                category("Gremio de Trabajo",     "⚒️", "#6c4bf4")
        ));
    }

    private Achievement achievement(String titulo, String descripcion, int xpRequerido, String icono) {
        Achievement a = new Achievement();
        a.setTitulo(titulo);
        a.setDescripcion(descripcion);
        a.setXpRequerido(xpRequerido);
        a.setIcono(icono);
        return a;
    }

    private Category category(String nombre, String icono, String color) {
        Category c = new Category();
        c.setNombre(nombre);
        c.setIcono(icono);
        c.setColor(color);
        return c;
    }
}