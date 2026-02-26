package com.evido.api.common.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
@EnableConfigurationProperties(RagProperties.class)
public class RagWebClientConfig {

    @Bean
    public WebClient ragWebClient(RagProperties props) {
        return WebClient.builder()
                .baseUrl(props.baseUrl())
                .build();
    }
}
