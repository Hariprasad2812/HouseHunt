package com.househunt.security;

import com.househunt.entity.Role;

/** Lightweight authenticated principal carried in the SecurityContext. */
public record JwtPrincipal(Long userId, String email, Role role) {}
