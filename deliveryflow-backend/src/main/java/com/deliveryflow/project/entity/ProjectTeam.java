package com.deliveryflow.project.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.io.Serializable;

@Entity
@Table(name = "project_teams")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(ProjectTeamId.class)
public class ProjectTeam {

    @Id
    private String projectId;

    @Id
    private String teamId;
}

/**
 * Composite primary key for ProjectTeam.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
class ProjectTeamId implements Serializable {
    private String projectId;
    private String teamId;
}
