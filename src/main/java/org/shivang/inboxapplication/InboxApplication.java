package org.shivang.inboxapplication;

import com.datastax.oss.driver.api.core.CqlIdentifier;

import org.shivang.inboxapplication.configuration.DataStaxAstraProperties;

import org.shivang.inboxapplication.model.Folder;
import org.shivang.inboxapplication.repository.FolderRepo;
import org.shivang.inboxapplication.repository.UnreadEmailStatsRepo;
import org.shivang.inboxapplication.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.cassandra.autoconfigure.CqlSessionBuilderCustomizer;
import org.springframework.context.annotation.Bean;

import org.springframework.beans.factory.annotation.Autowired;

import java.io.IOException;
import java.util.Arrays;

@SpringBootApplication
public class InboxApplication {
    public static void main(String[] args) {
        SpringApplication.run(InboxApplication.class, args);
    }
    @Value("${astra.db.application.token}")
    private String astraToken;

    @Autowired
    private FolderRepo folderRepo;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UnreadEmailStatsRepo unreadEmailStatsRepo;

    @Bean
    public CqlSessionBuilderCustomizer sessionBuilderCustomizer(
            DataStaxAstraProperties props) {

        return builder -> {
            try {
                builder.withCloudSecureConnectBundle(
                        props.getSecureConnectBundle()
                                .getFile()
                                .toPath()
                );

                builder.withAuthCredentials(
                        "token",
                        astraToken
                );

                builder.withKeyspace(
                        CqlIdentifier.fromCql("main")
                );

            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        };
    }

    @Bean
    CommandLineRunner loadData() {
        return args -> {
            folderRepo.save(new Folder("Shivang","Inbox","blue"));
            folderRepo.save(new Folder("Shivang","Sent","green"));
            folderRepo.save(new Folder("Shivang","Important","yellow"));

            unreadEmailStatsRepo.incrementUnreadCount("Shivang","Inbox");
            unreadEmailStatsRepo.incrementUnreadCount("Shivang","Inbox");
            unreadEmailStatsRepo.incrementUnreadCount("Shivang","Inbox");

            for(int i = 0; i < 10; i++){
                emailService.sendEmail("Shivang", Arrays.asList("Shivang","Aarushi"), "Subject" + i, "Body");
            }
        };
    }
}
