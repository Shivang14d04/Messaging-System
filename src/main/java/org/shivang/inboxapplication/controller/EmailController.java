package org.shivang.inboxapplication.controller;

import com.datastax.oss.driver.api.core.uuid.Uuids;
import org.ocpsoft.prettytime.PrettyTime;
import org.shivang.inboxapplication.dto.EmailListItemResponseDto;
import org.shivang.inboxapplication.dto.EmailRequestDto;
import org.shivang.inboxapplication.dto.EmailResponseDto;
import org.shivang.inboxapplication.model.Email;
import org.shivang.inboxapplication.model.EmailListItem;
import org.shivang.inboxapplication.service.EmailService;
import org.shivang.inboxapplication.service.InboxService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.shivang.inboxapplication.model.UserPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/emails")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class EmailController {
    @Autowired
    private  EmailService emailService;
    @Autowired
    private  InboxService inboxService;



    @PostMapping
    public ResponseEntity<?> sendEmail(
            @RequestBody EmailRequestDto payload,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String from = principal.getUsername();

        emailService.sendEmail(
                from,
                payload.getTo(),
                payload.getSubject(),
                payload.getBody()
        );

        return ResponseEntity.ok("Email sent successfully");
    }

    @GetMapping
    public ResponseEntity<?> getEmails(
            @RequestParam(defaultValue = "Inbox") String folder,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String userId = principal.getUsername();
        List<EmailListItem> emails = inboxService.getEmails(userId, folder);

        PrettyTime prettyTime = new PrettyTime();
        List<EmailListItemResponseDto> response = emails.stream().map(email -> {
            UUID timeUuid = email.getKey().getTimeUUID();
            Date emailDate = new Date(Uuids.unixTimestamp(timeUuid));
            String agoTimeString = prettyTime.format(emailDate);

            return new EmailListItemResponseDto(
                    timeUuid,
                    email.getFrom(),
                    email.getTo(),
                    email.getSubject(),
                    email.isRead(),
                    agoTimeString
            );
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getEmail(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userId = principal.getUsername();
        Email email = emailService.getEmail(id);

        if (!emailService.doesHaveAccess(email, userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        EmailResponseDto response = new EmailResponseDto(
                email.getId(),
                email.getFrom(),
                email.getTo(),
                email.getSubject(),
                email.getBody()
        );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
            @PathVariable UUID id,
            @RequestParam String folder,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userId = principal.getUsername();
        emailService.markAsRead(userId, folder, id);

        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    public ResponseEntity<?> deleteEmails(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String userId = principal.getUsername();
        if (payload == null || !payload.containsKey("emailIds") || !payload.containsKey("folder")) {
            return ResponseEntity.badRequest().body("Missing required parameters");
        }

        String folder = (String) payload.get("folder");
        List<?> rawIds = (List<?>) payload.get("emailIds");
        if (rawIds == null || folder == null) {
            return ResponseEntity.badRequest().body("Invalid parameters");
        }

        try {
            List<UUID> emailIds = rawIds.stream()
                    .map(id -> UUID.fromString(id.toString()))
                    .collect(Collectors.toList());

            emailService.deleteEmails(userId, folder, emailIds);
            return ResponseEntity.ok("Emails deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid UUID format: " + e.getMessage());
        }
    }

    @PostMapping("/copy")
    public ResponseEntity<?> copyEmails(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String userId = principal.getUsername();
        if (payload == null || !payload.containsKey("emailIds") 
                || !payload.containsKey("sourceFolder") || !payload.containsKey("targetFolder")) {
            return ResponseEntity.badRequest().body("Missing required parameters");
        }

        String sourceFolder = (String) payload.get("sourceFolder");
        String targetFolder = (String) payload.get("targetFolder");
        List<?> rawIds = (List<?>) payload.get("emailIds");
        if (rawIds == null || sourceFolder == null || targetFolder == null) {
            return ResponseEntity.badRequest().body("Invalid parameters");
        }

        try {
            List<UUID> emailIds = rawIds.stream()
                    .map(id -> UUID.fromString(id.toString()))
                    .collect(Collectors.toList());

            emailService.copyEmails(userId, sourceFolder, targetFolder, emailIds);
            return ResponseEntity.ok("Emails copied successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid UUID format: " + e.getMessage());
        }
    }
}
