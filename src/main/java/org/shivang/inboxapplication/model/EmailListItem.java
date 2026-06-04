package org.shivang.inboxapplication.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import org.shivang.inboxapplication.key.EmailListItemKey;
import org.springframework.data.annotation.Transient;
import org.springframework.data.cassandra.core.mapping.PrimaryKey;
import org.springframework.data.cassandra.core.mapping.Table;

import java.util.List;

@Data
@Table("messages_by_user_folder")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EmailListItem {

    @PrimaryKey
    private EmailListItemKey key;

    private String from;

    private List<String> to;

    private String subject;

    private boolean read;

    @Transient
    private String agoTimeString;
}
