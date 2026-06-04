package org.shivang.inboxapplication.repository;

import org.shivang.inboxapplication.model.Folder;
import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FolderRepo
        extends CassandraRepository<Folder, String> {

    List<Folder> findAllById(
            String userId
    );
}
