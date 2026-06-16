package com.deliveryflow.task.event;

import com.deliveryflow.task.entity.TaskDependency;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class DependencyCreatedEvent extends ApplicationEvent {
    private final TaskDependency dependency;

    public DependencyCreatedEvent(Object source, TaskDependency dependency) {
        super(source);
        this.dependency = dependency;
    }
}
