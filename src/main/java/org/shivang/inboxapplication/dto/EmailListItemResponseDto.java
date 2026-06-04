package org.shivang.inboxapplication.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailListItemResponseDto {
    private UUID id;
    private String from;
    private List<String> to;
    private String subject;
    private boolean read;
    private String agoTimeString;
}
