package org.shivang.inboxapplication.service;

import org.shivang.inboxapplication.model.EmailListItem;
import org.shivang.inboxapplication.repository.EmailListItemRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InboxService {

    @Autowired
    private EmailListItemRepo emailListItemRepo;

    public List<EmailListItem> getEmails(
            String userId,
            String folder
    ) {

        return emailListItemRepo
                .findAllByKey_IdAndKey_Label(
                        userId,
                        folder
                );
    }
}
