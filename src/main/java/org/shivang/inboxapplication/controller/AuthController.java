package org.shivang.inboxapplication.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
        origins = "http://localhost:5173",
        allowCredentials = "true"
)
public class AuthController {

    @GetMapping("/me")
    public Map<String, Object> currentUser(
            @AuthenticationPrincipal OAuth2User principal
    ) {

        Map<String, Object> response =
                new HashMap<>();

        if (principal == null) {

            response.put(
                    "authenticated",
                    false
            );

            return response;
        }

        response.put(
                "authenticated",
                true
        );

        response.put(
                "login",
                principal.getAttribute("login")
        );

        response.put(
                "name",
                principal.getAttribute("name")
        );

        response.put(
                "avatarUrl",
                principal.getAttribute("avatar_url")
        );

        return response;
    }
}
