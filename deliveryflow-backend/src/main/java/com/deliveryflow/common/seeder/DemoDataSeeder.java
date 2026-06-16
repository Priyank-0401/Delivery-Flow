package com.deliveryflow.common.seeder;

import com.deliveryflow.common.enums.*;
import com.deliveryflow.project.entity.Project;
import com.deliveryflow.project.entity.ProjectTeam;
import com.deliveryflow.project.repository.ProjectRepository;
import com.deliveryflow.project.repository.ProjectTeamRepository;
import com.deliveryflow.sprint.entity.Sprint;
import com.deliveryflow.sprint.repository.SprintRepository;
import com.deliveryflow.task.entity.Task;
import com.deliveryflow.task.repository.TaskRepository;
import com.deliveryflow.team.entity.Team;
import com.deliveryflow.team.entity.TeamMember;
import com.deliveryflow.team.repository.TeamMemberRepository;
import com.deliveryflow.team.repository.TeamRepository;
import com.deliveryflow.user.entity.User;
import com.deliveryflow.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DemoDataSeeder {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final ProjectRepository projectRepository;
    private final ProjectTeamRepository projectTeamRepository;
    private final SprintRepository sprintRepository;
    private final TaskRepository taskRepository;
    private final Environment env;
    private final PasswordEncoder passwordEncoder;

    private final Random random = new Random(42); // Fixed seed for reproducibility

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedData() {
        // Skip if data already exists (beyond the initial V1 seed user)
        if (userRepository.count() > 1) {
            // Self-heal: Update users that have the incorrect legacy password hash
            String oldHash = "$2a$12$vI8aWBnd7G4ZByP.Nsz9M.j9D1Pj4K4y1d8f1eN66t8lPkW2u8aWy";
            userRepository.findAll().forEach(u -> {
                if (oldHash.equals(u.getPasswordHash()) || u.getPasswordHash() == null || !u.getPasswordHash().startsWith("$2a$")) {
                    u.setPasswordHash(passwordEncoder.encode("Demo@12345678"));
                    userRepository.save(u);
                    log.info("Updated password hash for user: {}", u.getEmail());
                }
            });
            log.info("Database already seeded. Skipping...");
            return;
        }

        boolean isDemo = Arrays.asList(env.getActiveProfiles()).contains("demo");

        int numUsers = 20;
        int numTeams = 6;
        int numProjects = isDemo ? 15 : 5;
        int numSprints = isDemo ? 45 : 10;
        int numTasks = isDemo ? 500 : 100;

        log.info("=== DeliveryFlow Demo Data Seeder ===");
        log.info("Profile: {}", isDemo ? "demo" : "dev");
        log.info("Seeding: {} users, {} teams, {} projects, {} sprints, {} tasks",
                numUsers, numTeams, numProjects, numSprints, numTasks);

        // 1. Seed Users
        List<User> users = new ArrayList<>();
        // Keep the existing USR-1 user
        userRepository.findById("USR-1").ifPresent(u -> {
            u.setPasswordHash(passwordEncoder.encode("Demo@12345678"));
            u.setRole(UserRole.ADMIN);
            users.add(userRepository.save(u));
        });

        String[] firstNames = {"Aisha", "Ravi", "Elena", "James", "Priya", "Chen", "Sofia", "Marcus",
                "Nina", "Omar", "Lena", "Kai", "Mia", "Dev", "Sara", "Alex", "Jordan", "Zara", "Leo", "Ava"};
        UserRole[] roles = {UserRole.MEMBER, UserRole.MEMBER, UserRole.MEMBER, UserRole.MEMBER, UserRole.MANAGER};

        for (int i = 0; i < numUsers; i++) {
            User u = new User();
            u.setName(firstNames[i % firstNames.length] + " " + (char)('A' + i));
            u.setEmail(firstNames[i % firstNames.length].toLowerCase() + (i + 1) + "@deliveryflow.io");
            u.setPasswordHash(passwordEncoder.encode("Demo@12345678"));
            u.setRole(roles[i % roles.length]);
            u.setActive(true);
            users.add(userRepository.save(u));
        }
        log.info("  ✓ {} users created", numUsers);

        // 2. Seed Teams
        List<Team> teams = new ArrayList<>();
        String[] teamNames = {"Frontend Core", "Backend API", "Data Engineering", "Platform DevOps", "QA Automation", "UX Design"};
        String[] teamTypes = {"SCRUM", "KANBAN", "SCRUM", "KANBAN", "SCRUM", "KANBAN"};

        for (int i = 0; i < numTeams; i++) {
            Team t = new Team();
            t.setName(teamNames[i]);
            t.setDescription("The " + teamNames[i] + " team");
            t.setTeamType(teamTypes[i]);
            t.setCapacity(80 + (random.nextInt(6) * 10)); // 80-130
            teams.add(teamRepository.save(t));
        }
        log.info("  ✓ {} teams created", numTeams);

        // 3. Assign Users to Teams
        Set<String> assignedPairs = new HashSet<>();
        for (User u : users) {
            if ("USR-1".equals(u.getId())) continue; // Skip the original seed user
            Team t = teams.get(random.nextInt(teams.size()));
            String pairKey = t.getId() + "|" + u.getId();
            if (!assignedPairs.add(pairKey)) continue; // Skip duplicates

            TeamMember tm = new TeamMember();
            tm.setTeamId(t.getId());
            tm.setUserId(u.getId());
            tm.setRole(u.getRole() == UserRole.MANAGER ? TeamMemberRole.LEAD : TeamMemberRole.MEMBER);
            teamMemberRepository.save(tm);
        }
        log.info("  ✓ Team members assigned");

        // 4. Seed Projects
        List<Project> projects = new ArrayList<>();
        String[] projectNames = {"Project Phoenix", "Apollo Migration", "Payment Gateway v3",
                "Mobile App Redesign", "Data Lake Expansion", "Cloud Migration",
                "API Gateway Overhaul", "ML Pipeline", "Security Hardening",
                "Performance Optimization", "Customer Portal", "Admin Dashboard",
                "Notification Service", "Search Engine", "Analytics Platform"};
        String[] projectCodes = {"PHX", "APL", "PAY", "MOB", "DAT", "CLD", "API", "MLP", "SEC", "PRF", "CUS", "ADM", "NOT", "SRC", "ANL"};
        ProjectStatus[] projectStatuses = {ProjectStatus.ACTIVE, ProjectStatus.ACTIVE, ProjectStatus.PLANNING,
                ProjectStatus.AT_RISK, ProjectStatus.BLOCKED, ProjectStatus.CANCELLED, ProjectStatus.COMPLETED};

        for (int i = 0; i < numProjects; i++) {
            Project p = new Project();
            p.setName(projectNames[i 
                % projectNames.length]);
            p.setProjectCode(projectCodes[i % projectCodes.length]);
            p.setTaskSequence(0);
            p.setManagerId(users.get(random.nextInt(users.size())).getId());
            p.setStatus(projectStatuses[random.nextInt(projectStatuses.length)]);
            p.setHealth(40 + random.nextInt(61)); // 40-100
            p.setRisk(random.nextInt(3) == 0 ? "HIGH" : random.nextInt(2) == 0 ? "MEDIUM" : "LOW");
            projects.add(projectRepository.save(p));
        }
        log.info("  ✓ {} projects created", numProjects);

        // 5. Assign Teams to Projects
        Set<String> projectTeamPairs = new HashSet<>();
        for (Project p : projects) {
            int teamsPerProject = 1 + random.nextInt(2);
            for (int i = 0; i < teamsPerProject; i++) {
                Team t = teams.get(random.nextInt(teams.size()));
                String pairKey = p.getId() + "|" + t.getId();
                if (!projectTeamPairs.add(pairKey)) continue; // Skip duplicates

                ProjectTeam pt = new ProjectTeam();
                pt.setProjectId(p.getId());
                pt.setTeamId(t.getId());
                projectTeamRepository.save(pt);
            }
        }
        log.info("  ✓ Teams assigned to projects");

        // 6. Seed Sprints
        List<Sprint> sprints = new ArrayList<>();
        SprintStatus[] sprintStatuses = {SprintStatus.PLANNED, SprintStatus.ACTIVE, SprintStatus.COMPLETED};
        Map<String, Integer> sprintCounts = new HashMap<>();

        for (int i = 1; i <= numSprints; i++) {
            Project p = projects.get(random.nextInt(projects.size()));
            int sprintNum = sprintCounts.getOrDefault(p.getId(), 0) + 1;
            sprintCounts.put(p.getId(), sprintNum);

            Sprint s = new Sprint();
            s.setProjectId(p.getId());
            s.setSprintCode(p.getProjectCode() + "-S" + sprintNum);
            s.setName("Sprint " + sprintNum);
            s.setStatus(sprintStatuses[random.nextInt(sprintStatuses.length)]);
            s.setStartDate(LocalDate.now().minusDays(28).plusDays(random.nextInt(56)));
            s.setEndDate(s.getStartDate().plusDays(14));
            sprints.add(sprintRepository.save(s));
        }
        log.info("  ✓ {} sprints created", numSprints);

        // 7. Seed Tasks
        TaskPriority[] taskPriorities = {TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH, TaskPriority.CRITICAL};
        // Weight distribution: 20% TODO, 25% IN_PROGRESS, 15% IN_REVIEW, 30% DONE, 10% BLOCKED
        TaskStatus[] weightedStatuses = {
                TaskStatus.TODO, TaskStatus.TODO,
                TaskStatus.IN_PROGRESS, TaskStatus.IN_PROGRESS, TaskStatus.IN_PROGRESS,
                TaskStatus.IN_REVIEW, TaskStatus.IN_REVIEW,
                TaskStatus.DONE, TaskStatus.DONE, TaskStatus.DONE,
                TaskStatus.BLOCKED
        };

        String[] taskPrefixes = {"Implement", "Fix", "Refactor", "Test", "Design", "Review", "Optimize", "Deploy", "Configure", "Document"};
        String[] taskSuffixes = {"login flow", "API endpoint", "database query", "caching layer", "UI component",
                "auth middleware", "error handling", "notification service", "search feature", "dashboard widget",
                "export module", "file upload", "user profile", "payment integration", "email template"};

        Map<String, Integer> taskCounts = new HashMap<>();
        
        for (int i = 1; i <= numTasks; i++) {
            Sprint sprint = sprints.get(random.nextInt(sprints.size()));
            Project project = projects.stream().filter(p -> p.getId().equals(sprint.getProjectId())).findFirst().orElse(projects.get(0));
            int taskSeq = taskCounts.getOrDefault(project.getId(), 0) + 1;
            taskCounts.put(project.getId(), taskSeq);

            Task t = new Task();
            t.setProjectId(sprint.getProjectId());
            t.setSprintId(sprint.getId());
            t.setTaskKey(project.getProjectCode() + "-" + taskSeq);
            t.setTitle(taskPrefixes[random.nextInt(taskPrefixes.length)] + " " + taskSuffixes[random.nextInt(taskSuffixes.length)]);
            t.setDescription("Task description for item #" + taskSeq);
            t.setStatus(weightedStatuses[random.nextInt(weightedStatuses.length)]);
            t.setPriority(taskPriorities[random.nextInt(taskPriorities.length)]);
            t.setStoryPoints(new int[]{1, 2, 3, 5, 8, 13}[random.nextInt(6)]);
            t.setDueDate(LocalDate.now().plusDays(random.nextInt(30) - 10)); // Some overdue

            // 70% of tasks have an assignee, 30% have a reporter
            if (random.nextInt(10) < 7) {
                t.setAssigneeId(users.get(random.nextInt(users.size())).getId());
            }
            if (random.nextInt(10) < 3) {
                t.setReporterId(users.get(random.nextInt(users.size())).getId());
            }

            taskRepository.save(t);
        }
        
        // Update project task sequences
        for (Project p : projects) {
            p.setTaskSequence(taskCounts.getOrDefault(p.getId(), 0));
            projectRepository.save(p);
        }
        log.info("  ✓ {} tasks created", numTasks);

        log.info("=== Seeding Complete ===");
    }
}
