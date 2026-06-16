package com.deliveryflow.task.event;

import com.deliveryflow.task.entity.Task;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class TaskUpdatedEvent extends ApplicationEvent {
    private final Task task;

    public TaskUpdatedEvent(Object source, Task task) {
        super(source);
        this.task = task;
    }
}
