package org.shivang.inboxapplication.repository;

import org.shivang.inboxapplication.model.User;
import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepo extends CassandraRepository<User, String> {
    Optional<User> findByUsername(String username);
}
