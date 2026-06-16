package com.deliveryflow.task.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProjectGraphResponse {
    private List<GraphNodeDto> nodes;
    private List<GraphEdgeDto> edges;
}
