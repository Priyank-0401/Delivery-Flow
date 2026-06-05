package com.deliveryflow.task.mapper;

import com.deliveryflow.common.enums.TaskPriority;
import com.deliveryflow.common.enums.TaskType;
import com.deliveryflow.task.dto.CreateTaskRequest;
import com.deliveryflow.task.dto.TaskResponse;
import com.deliveryflow.task.entity.Task;

import java.math.BigDecimal;
import java.time.LocalDate;

public class TaskMapper {

    public static TaskResponse toResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setProjectId(task.getProjectId());
        response.setSprintId(task.getSprintId());
        response.setAssigneeId(task.getAssigneeId());
        response.setReporterId(task.getReporterId());
        response.setTaskKey(task.getTaskKey());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setStatus(task.getStatus());
        response.setPriority(task.getPriority());
        response.setType(task.getType());
        response.setStoryPoints(task.getStoryPoints());
        response.setEstimatedHours(task.getEstimatedHours());
        response.setActualHours(task.getActualHours());
        response.setExternalId(task.getExternalId());
        response.setDueDate(task.getDueDate());
        response.setCreatedAt(task.getCreatedAt());
        response.setUpdatedAt(task.getUpdatedAt());
        return response;
    }

    public static Task toEntity(CreateTaskRequest request) {
        Task task = new Task();
        task.setProjectId(request.getProjectId());
        task.setSprintId(request.getSprintId());
        task.setAssigneeId(request.getAssigneeId());
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getPriority() != null) {
            task.setPriority(TaskPriority.valueOf(request.getPriority()));
        }
        if (request.getType() != null) {
            task.setType(TaskType.valueOf(request.getType()));
        }
        if (request.getStoryPoints() != null) {
            task.setStoryPoints(request.getStoryPoints());
        }
        if (request.getEstimatedHours() != null) {
            task.setEstimatedHours(new BigDecimal(request.getEstimatedHours()));
        }
        if (request.getDueDate() != null) {
            task.setDueDate(LocalDate.parse(request.getDueDate()));
        }
        return task;
    }
}
