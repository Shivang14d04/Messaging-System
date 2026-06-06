package org.shivang.inboxapplication.controller;

import org.shivang.inboxapplication.service.FolderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.shivang.inboxapplication.model.UserPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.beans.factory.annotation.Autowired;

import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class StatsController {

    @Autowired
    private FolderService folderService;

    @GetMapping
    public ResponseEntity<?> getStats(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String userId = principal.getUsername();
        Map<String, Integer> stats = folderService.mapCountToLabels(userId);

        return ResponseEntity.ok(stats);
    }
}
