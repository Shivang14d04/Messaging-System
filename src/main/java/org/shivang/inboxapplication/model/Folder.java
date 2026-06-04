package org.shivang.inboxapplication.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.cassandra.core.cql.PrimaryKeyType;
import org.springframework.data.cassandra.core.mapping.PrimaryKeyColumn;
import org.springframework.data.cassandra.core.mapping.Table;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Table("folders_by_users")
public class Folder {

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

    private String color;
}
