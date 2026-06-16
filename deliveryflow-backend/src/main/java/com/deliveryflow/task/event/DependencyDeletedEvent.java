package com.deliveryflow.task.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class DependencyDeletedEvent extends ApplicationEvent {
    private final String sourceTaskId;
    private final String targetTaskId;

    public DependencyDeletedEvent(Object source, String sourceTaskId, String targetTaskId) {
        super(source);
        this.sourceTaskId = sourceTaskId;
        this.targetTaskId = targetTaskId;
    }
}
