package com.evido.api.document.infrastructure.rag.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.services.s3.*;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
public class S3Config {

    @Bean
    public S3Client s3Client() {
        return S3Client.builder().build();
    }

    @Bean
    public S3Presigner s3Presigner() {
        return S3Presigner.builder().build();
    }
}