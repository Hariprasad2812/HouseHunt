package com.househunt.controller;

import com.househunt.dto.PropertyDtos;
import com.househunt.service.FavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final FavoriteService favoriteService;

    @GetMapping("/favorites")
    public List<PropertyDtos.PropertyCard> favorites() {
        return favoriteService.mine();
    }
}
