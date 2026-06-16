package com.deliveryflow.task.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class TaskDeletedEvent extends ApplicationEvent {
    private final String taskId;

    public TaskDeletedEvent(Object source, String taskId) {
        super(source);
        this.taskId = taskId;
    }
}
