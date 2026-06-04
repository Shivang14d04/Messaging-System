package org.shivang.inboxapplication.repository;

import org.shivang.inboxapplication.key.EmailListItemKey;
import org.shivang.inboxapplication.model.EmailListItem;
import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmailListItemRepo
        extends CassandraRepository<EmailListItem, EmailListItemKey> {

    List<EmailListItem>
    findAllByKey_IdAndKey_Label(
            String id,
            String label
    );
}
