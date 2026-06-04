package org.shivang.inboxapplication.model;

import lombok.Data;
import org.springframework.data.cassandra.core.cql.PrimaryKeyType;
import org.springframework.data.cassandra.core.mapping.CassandraType;
import org.springframework.data.cassandra.core.mapping.PrimaryKeyColumn;
import org.springframework.data.cassandra.core.mapping.Table;

@Data
@Table("unread_email_stats")
public class UnreadEmailStats {

    @PrimaryKeyColumn(
            name = "user_id",
            ordinal = 0,
            type = PrimaryKeyType.PARTITIONED
    )
    private String id;

    @PrimaryKeyColumn(
            name = "label",
            ordinal = 1,
            type = PrimaryKeyType.CLUSTERED
    )
    private String label;

    @CassandraType(type = CassandraType.Name.COUNTER)
    private long unreadCount;
}
