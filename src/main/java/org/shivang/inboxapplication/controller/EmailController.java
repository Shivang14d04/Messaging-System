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
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
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
            @AuthenticationPrincipal OAuth2User principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String from = principal.getAttribute("login");

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
            @AuthenticationPrincipal OAuth2User principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

        String userId = principal.getAttribute("login");
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
            @AuthenticationPrincipal OAuth2User principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userId = principal.getAttribute("login");
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
            @AuthenticationPrincipal OAuth2User principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String userId = principal.getAttribute("login");
        emailService.markAsRead(userId, folder, id);

        return ResponseEntity.ok().build();
    }
}
