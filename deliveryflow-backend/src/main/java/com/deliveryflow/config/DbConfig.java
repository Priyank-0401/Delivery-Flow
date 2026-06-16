package com.deliveryflow.config;

import jakarta.persistence.EntityManagerFactory;
import org.neo4j.driver.Driver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.neo4j.core.DatabaseSelectionProvider;
import org.springframework.data.neo4j.repository.config.EnableNeo4jRepositories;
import org.springframework.data.neo4j.core.transaction.Neo4jTransactionManager;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration
@EnableJpaRepositories(
    basePackages = {
        "com.deliveryflow.user.repository",
        "com.deliveryflow.team.repository",
        "com.deliveryflow.task.repository",
        "com.deliveryflow.sprint.repository",
        "com.deliveryflow.project.repository",
        "com.deliveryflow.auth.repository",
        "com.deliveryflow.common.audit.repository",
        "com.deliveryflow.analytics.repository"
    },
    transactionManagerRef = "transactionManager"
)
@EnableNeo4jRepositories(
    basePackages = {
        "com.deliveryflow.task.graph.repository"
    },
    transactionManagerRef = "neo4jTransactionManager"
)
public class DbConfig {

    @Bean(name = "transactionManager")
    @Primary
    public PlatformTransactionManager transactionManager(EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }

    @Bean(name = "neo4jTransactionManager")
    public PlatformTransactionManager neo4jTransactionManager(Driver driver, DatabaseSelectionProvider databaseSelectionProvider) {
        return new Neo4jTransactionManager(driver, databaseSelectionProvider);
    }
}
