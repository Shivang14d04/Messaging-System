package org.shivang.inboxapplication.controller;

import org.shivang.inboxapplication.model.User;
import org.shivang.inboxapplication.model.UserPrincipal;
import org.shivang.inboxapplication.repository.UserRepo;
import org.shivang.inboxapplication.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
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

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (user.getUsername() == null || user.getUsername().trim().isEmpty() ||
                user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Username and password cannot be empty");
        }

        if (userRepo.existsById(user.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        user.setPassword(encoder.encode(user.getPassword()));
        userRepo.save(user);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            Authentication authentication = authenticationManager
                    .authenticate(new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword()));

            if (authentication.isAuthenticated()) {
                String token = jwtService.generateToken(user.getUsername());
                Map<String, String> response = new HashMap<>();
                response.put("token", token);
                response.put("username", user.getUsername());
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login Failed");
    }

    @GetMapping("/me")
    public Map<String, Object> currentUser(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        Map<String, Object> response = new HashMap<>();

        if (principal == null) {
            response.put("authenticated", false);
            return response;
        }

        response.put("authenticated", true);
        response.put("login", principal.getUsername());
        response.put("name", principal.getUsername());
        response.put("avatarUrl", "https://api.dicebear.com/7.x/initials/svg?seed=" + principal.getUsername());

        return response;
    }
}
