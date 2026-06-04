package org.shivang.inboxapplication.repository;

import org.shivang.inboxapplication.model.UnreadEmailStats;
import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.data.cassandra.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UnreadEmailStatsRepo
        extends CassandraRepository<UnreadEmailStats, String> {

    List<UnreadEmailStats> findAllById(
            String userId
    );

    @Query("""
        UPDATE unread_email_stats
        SET unread_count = unread_count + 1
        WHERE user_id = ?0
        AND label = ?1
    """)
    void incrementUnreadCount(
            String userId,
            String label
    );

    @Query("""
        UPDATE unread_email_stats
        SET unread_count = unread_count - 1
        WHERE user_id = ?0
        AND label = ?1
    """)
    void decrementUnreadCount(
            String userId,
            String label
    );
}
