package com.deliveryflow.task.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class GraphEdgeDto {
    private String id;
    private String source;
    private String target;
    private String type;
}
