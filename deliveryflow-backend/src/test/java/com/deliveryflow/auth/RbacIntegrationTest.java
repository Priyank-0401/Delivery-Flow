package com.deliveryflow.auth;

import com.deliveryflow.auth.service.JwtService;
import com.deliveryflow.common.enums.UserRole;
import com.deliveryflow.project.dto.CreateProjectRequest;
import com.deliveryflow.user.dto.CreateUserRequest;
import com.deliveryflow.user.entity.User;
import com.deliveryflow.user.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class RbacIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private String memberToken;
    private String managerToken;
    private String pmoToken;
    private String adminToken;

    @BeforeEach
    public void setUp() {
        User member = createAndSaveTestUser("MEMBER", UserRole.MEMBER);
        User manager = createAndSaveTestUser("MANAGER", UserRole.MANAGER);
        User pmo = createAndSaveTestUser("PMO", UserRole.PMO);
        User admin = createAndSaveTestUser("ADMIN", UserRole.ADMIN);

        memberToken = jwtService.generateAccessToken(member);
        managerToken = jwtService.generateAccessToken(manager);
        pmoToken = jwtService.generateAccessToken(pmo);
        adminToken = jwtService.generateAccessToken(admin);
    }

    private User createAndSaveTestUser(String suffix, UserRole role) {
        String email = suffix.toLowerCase() + "-" + UUID.randomUUID() + "@rbac.test";
        User user = new User();
        user.setName(suffix + " User");
        user.setEmail(email);
        user.setPasswordHash("hashed_password");
        user.setRole(role);
        user.setActive(true);
        return userRepository.save(user);
    }

    @Test
    public void whenMemberTriesToCreateProject_thenForbidden() throws Exception {
        CreateProjectRequest req = new CreateProjectRequest();
        req.setName("Test Project");

        mockMvc.perform(post("/api/v1/projects")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + memberToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    public void whenManagerCreatesProject_thenAllowed() throws Exception {
        CreateProjectRequest req = new CreateProjectRequest();
        req.setName("Test Project");

        mockMvc.perform(post("/api/v1/projects")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + managerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());
    }

    @Test
    public void whenMemberTriesToListUsers_thenForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/users")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + memberToken))
                .andExpect(status().isForbidden());
    }

    @Test
    public void whenPmoListsUsers_thenAllowed() throws Exception {
        mockMvc.perform(get("/api/v1/users")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + pmoToken))
                .andExpect(status().isOk());
    }

    @Test
    public void whenPmoTriesToCreateUser_thenForbidden() throws Exception {
        CreateUserRequest req = new CreateUserRequest();
        req.setName("New User");
        req.setEmail("new-user@test.com");
        req.setRole("MEMBER");

        mockMvc.perform(post("/api/v1/users")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + pmoToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    public void whenAdminCreatesUser_thenAllowed() throws Exception {
        CreateUserRequest req = new CreateUserRequest();
        req.setName("New User");
        req.setEmail("new-user-allowed@test.com");
        req.setRole("MEMBER");

        mockMvc.perform(post("/api/v1/users")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated());
    }
}
