package org.shivang.inboxapplication.service;

import org.shivang.inboxapplication.model.Folder;
import org.shivang.inboxapplication.model.UnreadEmailStats;
import org.shivang.inboxapplication.repository.FolderRepo;
import org.shivang.inboxapplication.repository.UnreadEmailStatsRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class FolderService {

    @Autowired
    private FolderRepo folderRepo;
    @Autowired
    private UnreadEmailStatsRepo unreadEmailStatsRepo;

    public List<Folder> fetchDefaultFolders(String userId) {

        return Arrays.asList(
                new Folder(userId, "Inbox", "blue"),
                new Folder(userId, "Sent Items", "green"),
                new Folder(userId, "Important", "red")
        );
    }

    public Map<String, Integer> mapCountToLabels(
            String userId
    ) {

        List<UnreadEmailStats> stats =
                unreadEmailStatsRepo.findAllById(userId);

        return stats.stream()
                .collect(
                        Collectors.toMap(
                                UnreadEmailStats::getLabel,
                                stat -> (int) stat.getUnreadCount()
                        )
                );
    }

    public Map<String, Object> getFolderData(
            String userId
    ) {

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "folders",
                folderRepo.findAllById(userId)
        );

        response.put(
                "defaultFolders",
                fetchDefaultFolders(userId)
        );

        response.put(
                "stats",
                mapCountToLabels(userId)
        );

        return response;
    }

    public boolean folderExists(String userId, String label) {
        if (label == null) {
            return false;
        }
        if (fetchDefaultFolders(userId).stream().anyMatch(f -> f.getLabel().equalsIgnoreCase(label))) {
            return true;
        }
        return folderRepo.findAllById(userId).stream()
                .anyMatch(f -> f.getLabel().equalsIgnoreCase(label));
    }

    public Folder addFolder(
            String userId,
            String label,
            String color
    ) {
        unreadEmailStatsRepo.save(new UnreadEmailStats(userId, label, 0));
        return folderRepo.save(new Folder(userId, label, color));
    }
}
