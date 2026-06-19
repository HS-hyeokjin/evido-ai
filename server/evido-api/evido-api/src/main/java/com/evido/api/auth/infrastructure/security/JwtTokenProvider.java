package com.evido.api.auth.infrastructure.security;

import com.evido.api.auth.application.port.out.TokenProviderPort;
import com.evido.api.auth.domain.Role;
import com.evido.api.auth.domain.TokenPayload;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import java.security.Key;
import java.util.Date;

public class JwtTokenProvider implements TokenProviderPort {

    private static final String TOKEN_TYPE_ACCESS = "ACCESS";
    private static final String TOKEN_TYPE_REFRESH = "REFRESH";
    private static final String TOKEN_TYPE_GUEST = "GUEST";

    private final Key key;
    private final long guestExpire = 1000L * 60 * 60 * 24;
    private final long accessExpire = 1000L * 60 * 15;
    private final long refreshExpire = 1000L * 60 * 60 * 24 * 7;

    public JwtTokenProvider(String secretKey) {
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    @Override
    public String createGuestToken(String guestUuid) {
        return buildToken(guestUuid, TOKEN_TYPE_GUEST, Role.ROLE_GUEST, guestExpire);
    }

    @Override
    public String createAccessToken(String userId, Role role) {
        return buildToken(userId, TOKEN_TYPE_ACCESS, role, accessExpire);
    }

    @Override
    public String createRefreshToken(String userId, Role role) {
        return buildToken(userId, TOKEN_TYPE_REFRESH, role, refreshExpire);
    }

    private String buildToken(String subject, String type, Role role, long expire) {

        Date now = new Date();
        Date expiry = new Date(now.getTime() + expire);

        return Jwts.builder()
                .setSubject(subject)
                .claim("type", type)
                .claim("role", role.name())
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    @Override
    public boolean validate(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public TokenPayload parse(String token) {

        Claims claims = parseClaims(token);

        return new TokenPayload(
                claims.getSubject(),
                claims.get("type", String.class),
                Role.valueOf(claims.get("role", String.class))
        );
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
