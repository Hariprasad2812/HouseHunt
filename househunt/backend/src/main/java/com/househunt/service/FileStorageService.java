package com.househunt.service;

import com.househunt.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Set<String> ALLOWED = Set.of("image/jpeg", "image/png", "image/webp");
    private final Path root;

    public FileStorageService(@Value("${househunt.upload.dir}") String dir) {
        this.root = Path.of(dir).toAbsolutePath().normalize();
    }

    public String store(MultipartFile file) {
        if (file == null || file.isEmpty()) throw ApiException.badRequest("No file provided.");
        String ct = file.getContentType();
        if (ct == null || !ALLOWED.contains(ct.toLowerCase(Locale.ROOT))) {
            throw ApiException.badRequest("Only JPG, PNG or WebP images are allowed.");
        }
        String ext = switch (ct) {
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            default -> "jpg";
        };
        try {
            Files.createDirectories(root);
            String name = UUID.randomUUID() + "." + ext;
            Path target = root.resolve(name);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + name;
        } catch (IOException e) {
            throw ApiException.badRequest("Could not store the image. Please retry.");
        }
    }
}
