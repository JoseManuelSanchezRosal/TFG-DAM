package com.tuturno.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // Aplica a toda la API
                        .allowedOrigins("*") // Permite a cualquiera (archivos locales, webs...)
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Permite todo
                        .allowedHeaders("*");
            }
        };
    }
}