package org.shivang.inboxapplication.repository;

import org.shivang.inboxapplication.model.Email;
import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface EmailRepo
        extends CassandraRepository<Email, UUID> {
}
