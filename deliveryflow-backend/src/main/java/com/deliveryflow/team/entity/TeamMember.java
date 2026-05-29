package com.deliveryflow.team.entity;

import com.deliveryflow.common.enums.TeamMemberRole;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.io.Serializable;

@Entity
@Table(name = "team_members")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(TeamMemberId.class)
public class TeamMember {

    @Id
    private String teamId;

    @Id
    private String userId;

    @Enumerated(EnumType.STRING)
    private TeamMemberRole role = TeamMemberRole.MEMBER;
}

/**
 * Composite primary key for TeamMember.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
class TeamMemberId implements Serializable {
    private String teamId;
    private String userId;
}
