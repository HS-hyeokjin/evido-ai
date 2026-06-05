package com.evido.api.auth.infrastructure.security;

import com.evido.api.auth.api.controller.OAuth2SuccessHandler;
import com.evido.api.auth.application.port.in.IssueTokenUseCase;
import com.evido.api.auth.application.port.out.TokenProviderPort;
import com.evido.api.auth.infrastructure.cookie.AuthCookieManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class AuthSecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            OAuth2SuccessHandler oAuth2SuccessHandler
    ) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .headers(headers -> headers
                        .frameOptions(HeadersConfigurer.FrameOptionsConfig::disable)
                )
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**").permitAll()
                        .requestMatchers("/actuator/health").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                        .requestMatchers("/api/auth/refresh", "/api/auth/logout", "/api/auth/guest/token", "/api/auth/session").permitAll()
                        .requestMatchers("/api/workspaces/**").hasAnyRole("USER", "GUEST")
                        .requestMatchers("/api/conversations/**").hasAnyRole("USER", "GUEST")
                        .requestMatchers("/api/qa/**").hasAnyRole("USER", "GUEST")
                        .requestMatchers("/api/upload/**").hasAnyRole("USER", "GUEST")
                        .requestMatchers("/api/**").hasAnyRole("USER", "GUEST")
                        .anyRequest().permitAll()
                )

                .oauth2Login(oauth -> oauth
                        .successHandler(oAuth2SuccessHandler)
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter(TokenProviderPort tokenProvider) {
        return new JwtAuthenticationFilter(tokenProvider);
    }

    @Bean
    public OAuth2SuccessHandler oAuth2SuccessHandler(
            IssueTokenUseCase issueTokenUseCase,
            AuthCookieManager cookieManager
    ) {
        return new OAuth2SuccessHandler(issueTokenUseCase, cookieManager);
    }
}