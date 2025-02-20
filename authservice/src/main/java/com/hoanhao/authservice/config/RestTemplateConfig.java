package com.hoanhao.authservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    // Định nghĩa Bean cho RestTemplate
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();  // Tạo một đối tượng RestTemplate
    }
}
