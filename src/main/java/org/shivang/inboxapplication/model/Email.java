package org.shivang.inboxapplication.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.cassandra.core.mapping.Table;

import java.util.List;
import java.util.UUID;

@Data
@Table("message_by_id")
public class Email {

  @Id
  private UUID id;

  private String from;

  private List<String> to;

  private String subject;

  private String body;
}
