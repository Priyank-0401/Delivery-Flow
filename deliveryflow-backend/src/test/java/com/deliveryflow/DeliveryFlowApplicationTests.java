package com.deliveryflow;

import com.deliveryflow.analytics.service.AnalyticsService;
import com.deliveryflow.analytics.service.ActivityService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class DeliveryFlowApplicationTests {

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private ActivityService activityService;

    @Test
    void testDashboard() {
        System.out.println("=== RUNNING DASHBOARD TEST ===");
        try {
            Object result = analyticsService.getDashboardOverview();
            System.out.println("Result: " + result);
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @Test
    void testActivity() {
        System.out.println("=== RUNNING ACTIVITY TEST ===");
        try {
            Object result = activityService.getRecentActivity();
            System.out.println("Result: " + result);
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }
}
