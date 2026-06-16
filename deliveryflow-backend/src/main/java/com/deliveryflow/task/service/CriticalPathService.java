package com.deliveryflow.task.service;

import com.deliveryflow.task.graph.entity.DependencyRelationship;
import com.deliveryflow.task.graph.entity.TaskNode;
import com.deliveryflow.task.graph.repository.TaskNodeRepository;
import com.deliveryflow.task.dto.CriticalPathResponse;
import com.deliveryflow.task.dto.TaskCpmDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CriticalPathService {

    private final TaskNodeRepository taskNodeRepository;

    @Autowired
    public CriticalPathService(TaskNodeRepository taskNodeRepository) {
        this.taskNodeRepository = taskNodeRepository;
    }

    public CriticalPathResponse calculateCriticalPath(String projectId) {
        List<TaskNode> nodes = taskNodeRepository.findByProjectId(projectId);
        if (nodes.isEmpty()) {
            return CriticalPathResponse.builder()
                    .criticalPathTaskIds(Collections.emptyList())
                    .projectDuration(0.0)
                    .tasks(Collections.emptyList())
                    .build();
        }

        // 1. Build graphs
        Map<String, TaskNode> nodeMap = new HashMap<>();
        Map<String, List<String>> adj = new HashMap<>();
        Map<String, List<String>> incoming = new HashMap<>();
        Map<String, Integer> inDegree = new HashMap<>();

        for (TaskNode node : nodes) {
            nodeMap.put(node.getId(), node);
            adj.put(node.getId(), new ArrayList<>());
            incoming.put(node.getId(), new ArrayList<>());
            inDegree.put(node.getId(), 0);
        }

        for (TaskNode node : nodes) {
            if (node.getBlockedTasks() != null) {
                for (DependencyRelationship rel : node.getBlockedTasks()) {
                    String targetId = rel.getTargetTask().getId();
                    if (nodeMap.containsKey(targetId)) {
                        adj.get(node.getId()).add(targetId);
                        incoming.get(targetId).add(node.getId());
                        inDegree.put(targetId, inDegree.get(targetId) + 1);
                    }
                }
            }
        }

        // 2. Topological Sort (Kahn's)
        Queue<String> queue = new LinkedList<>();
        for (String id : inDegree.keySet()) {
            if (inDegree.get(id) == 0) {
                queue.add(id);
            }
        }

        List<String> topoOrder = new ArrayList<>();
        while (!queue.isEmpty()) {
            String u = queue.poll();
            topoOrder.add(u);

            for (String v : adj.get(u)) {
                inDegree.put(v, inDegree.get(v) - 1);
                if (inDegree.get(v) == 0) {
                    queue.add(v);
                }
            }
        }

        // Fallback: If there is a cycle, append remaining nodes
        if (topoOrder.size() < nodes.size()) {
            for (String id : nodeMap.keySet()) {
                if (!topoOrder.contains(id)) {
                    topoOrder.add(id);
                }
            }
        }

        // Setup durations
        Map<String, Double> durations = new HashMap<>();
        for (TaskNode node : nodes) {
            double duration = node.getEstimatedHours() != null ? node.getEstimatedHours().doubleValue() : 1.0;
            if (duration <= 0.0) {
                duration = 1.0; // Fallback
            }
            durations.put(node.getId(), duration);
        }

        // 3. Forward Pass (ES & EF)
        Map<String, Double> esMap = new HashMap<>();
        Map<String, Double> efMap = new HashMap<>();
        for (String id : topoOrder) {
            double es = 0.0;
            for (String pred : incoming.get(id)) {
                es = Math.max(es, efMap.getOrDefault(pred, 0.0));
            }
            esMap.put(id, es);
            efMap.put(id, es + durations.get(id));
        }

        // Project Duration
        double projectDuration = 0.0;
        for (double ef : efMap.values()) {
            projectDuration = Math.max(projectDuration, ef);
        }

        // 4. Backward Pass (LS & LF)
        Map<String, Double> lfMap = new HashMap<>();
        Map<String, Double> lsMap = new HashMap<>();
        for (String id : topoOrder) {
            lfMap.put(id, projectDuration);
        }

        for (int i = topoOrder.size() - 1; i >= 0; i--) {
            String id = topoOrder.get(i);
            double lf = projectDuration;
            List<String> successors = adj.get(id);
            if (successors != null && !successors.isEmpty()) {
                lf = Double.MAX_VALUE;
                for (String succ : successors) {
                    lf = Math.min(lf, lsMap.getOrDefault(succ, projectDuration));
                }
            }
            lfMap.put(id, lf);
            lsMap.put(id, lf - durations.get(id));
        }

        // 5. Slack & Critical Path Construction
        List<String> criticalPathTaskIds = new ArrayList<>();
        List<TaskCpmDetails> detailsList = new ArrayList<>();

        for (String id : topoOrder) {
            TaskNode node = nodeMap.get(id);
            double es = esMap.get(id);
            double ef = efMap.get(id);
            double ls = lsMap.get(id);
            double lf = lfMap.get(id);
            double slack = ls - es;
            boolean isCritical = Math.abs(slack) < 0.001;

            if (isCritical) {
                criticalPathTaskIds.add(id);
            }

            detailsList.add(TaskCpmDetails.builder()
                    .taskId(id)
                    .taskKey(node.getTaskKey())
                    .title(node.getTitle())
                    .earliestStart(es)
                    .earliestFinish(ef)
                    .latestStart(ls)
                    .latestFinish(lf)
                    .slack(slack)
                    .isCritical(isCritical)
                    .build());
        }

        return CriticalPathResponse.builder()
                .criticalPathTaskIds(criticalPathTaskIds)
                .projectDuration(projectDuration)
                .tasks(detailsList)
                .build();
    }
}
