package org.shivang.inboxapplication.controller;

import org.shivang.inboxapplication.dto.FolderRequestDto;
import org.shivang.inboxapplication.dto.FolderResponseDto;
import org.shivang.inboxapplication.model.Folder;
import org.shivang.inboxapplication.service.FolderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/folders")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class FolderController {

    @Autowired
    private FolderService folderService;

    @GetMapping
    public ResponseEntity<?> getFolders(
            @AuthenticationPrincipal OAuth2User principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String userId = principal.getAttribute("login");
        Map<String, Object> folderData = folderService.getFolderData(userId);

        List<Folder> folders = (List<Folder>) folderData.get("folders");
        List<Folder> defaultFolders = (List<Folder>) folderData.get("defaultFolders");

        List<FolderResponseDto> customFolderDtos = folders.stream()
                .map(f -> new FolderResponseDto(f.getLabel(), f.getColor()))
                .collect(Collectors.toList());

        List<FolderResponseDto> defaultFolderDtos = defaultFolders.stream()
                .map(f -> new FolderResponseDto(f.getLabel(), f.getColor()))
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("defaultFolders", defaultFolderDtos);
        response.put("userFolders", customFolderDtos);

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> addFolder(
            @RequestBody FolderRequestDto payload,
            @AuthenticationPrincipal OAuth2User principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String userId = principal.getAttribute("login");
        String label = payload.getLabel();
        String color = payload.getColor();

        if (label == null || label.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Folder name cannot be empty");
        }
        if (color == null || color.trim().isEmpty()) {
            color = "blue";
        }

        if (folderService.folderExists(userId, label)) {
            return ResponseEntity.badRequest().body("Folder with this name already exists");
        }

        Folder savedFolder = folderService.addFolder(userId, label, color);
        FolderResponseDto response = new FolderResponseDto(savedFolder.getLabel(), savedFolder.getColor());
        return ResponseEntity.ok(response);
    }
}
