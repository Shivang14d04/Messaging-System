package org.shivang.inboxapplication.service;

import com.datastax.oss.driver.api.core.uuid.Uuids;
import org.shivang.inboxapplication.key.EmailListItemKey;
import org.shivang.inboxapplication.model.Email;
import org.shivang.inboxapplication.model.EmailListItem;
import org.shivang.inboxapplication.repository.EmailListItemRepo;
import org.shivang.inboxapplication.repository.EmailRepo;
import org.shivang.inboxapplication.repository.UnreadEmailStatsRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class EmailService {

    @Autowired
    private EmailRepo emailRepo;
    @Autowired
    private EmailListItemRepo emailListItemRepo;
    @Autowired
    private UnreadEmailStatsRepo unreadEmailStatsRepo;

    public void sendEmail(
            String from,
            List<String> to,
            String subject,
            String body
    ) {

        Email email = new Email();

        email.setId(Uuids.timeBased());
        email.setFrom(from);
        email.setTo(to);
        email.setSubject(subject);
        email.setBody(body);

        emailRepo.save(email);

        for (String recipient : to) {

            EmailListItem inboxItem =
                    createEmailListItem(
                            recipient,
                            "Inbox",
                            email
                    );

            emailListItemRepo.save(inboxItem);

            unreadEmailStatsRepo.incrementUnreadCount(
                    recipient,
                    "Inbox"
            );
        }

        EmailListItem sentItem =
                createEmailListItem(
                        from,
                        "Sent Items",
                        email
                );

        sentItem.setRead(true);

        emailListItemRepo.save(sentItem);
    }

    public Email getEmail(UUID id) {

        return emailRepo.findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Email not found"
                        )
                );
    }

    public boolean doesHaveAccess(
            Email email,
            String userId
    ) {

        return userId.equals(email.getFrom())
                || email.getTo().contains(userId);
    }

    public void markAsRead(
            String userId,
            String folder,
            UUID emailId
    ) {

        EmailListItemKey key =
                new EmailListItemKey();

        key.setId(userId);
        key.setLabel(folder);
        key.setTimeUUID(emailId);

        emailListItemRepo.findById(key)
                .ifPresent(item -> {

                    if (!item.isRead()) {

                        item.setRead(true);

                        emailListItemRepo.save(item);

                        unreadEmailStatsRepo
                                .decrementUnreadCount(
                                        userId,
                                        folder
                                );
                    }
                });
    }

    public String getReplySubject(
            String subject
    ) {

        return "Re: " + subject;
    }

    public String getReplyBody(
            Email email
    ) {

        return "\n\n\n----------------------------------\n"
                + "From: " + email.getFrom() + "\n"
                + "To: " + String.join(", ", email.getTo()) + "\n\n"
                + email.getBody();
    }

    private EmailListItem createEmailListItem(
            String owner,
            String folder,
            Email email
    ) {

        EmailListItemKey key =
                new EmailListItemKey();

        key.setId(owner);
        key.setLabel(folder);
        key.setTimeUUID(email.getId());

        EmailListItem item =
                new EmailListItem();

        item.setKey(key);
        item.setFrom(email.getFrom());
        item.setTo(email.getTo());
        item.setSubject(email.getSubject());
        item.setRead(false);

        return item;
    }
}
