package org.shivang.inboxapplication.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailRequestDto {
    private List<String> to;
    private String subject;
    private String body;
}
