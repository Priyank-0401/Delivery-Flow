# DeliveryFlow - User Stories

**Document ID:** DF-SRS-10  
**Target Audience:** QA Teams, Developers, Product Managers

The following 100 User Stories define the granular execution requirements for the DeliveryFlow platform.

---

### Module 1: Auth & Administration (1-10)
**US-01:** As a PMO Admin, I want to configure SAML SSO so that employees can log in using Okta.
*(AC: 1. SSO config page exists. 2. Metadata XML can be uploaded. 3. Login redirects to IdP.)*
**US-02:** As an Admin, I want to enforce MFA for all local users so that accounts are secure.
**US-03:** As a User, I want to request a password reset via email so that I can recover my account.
**US-04:** As an Admin, I want to create custom Roles with granular permissions so that I can control access.
**US-05:** As an Admin, I want to view a system Audit Log so that I can track who changed configuration settings.
**US-06:** As a Delivery Manager, I want to invite a new user via email so that they can access my project.
**US-07:** As a System, I want to automatically deactivate users who are disabled in Okta so that access is revoked instantly.
**US-08:** As a User, I want my session to timeout after 60 minutes of inactivity so that unattended terminals are secure.
**US-09:** As an Admin, I want to impersonate a user (read-only) so that I can debug their dashboard issues.
**US-10:** As a User, I want to upload a profile picture so that my avatar appears on the dependency graph.

### Module 2: Project Management (11-20)
**US-11:** As a PM, I want to create a new Project and link it to a Jira Project Key so that data begins syncing.
**US-12:** As a PMO, I want to group multiple Projects into a Portfolio so that I can track aggregate financial health.
**US-13:** As a Delivery Manager, I want to assign specific Teams to a Project so that I know who is doing the work.
**US-14:** As a PM, I want to define hard-deadline Milestones so that the Critical Path has a target date.
**US-15:** As a PM, I want to archive completed Projects so that they no longer affect active Portfolio metrics.
**US-16:** As a User, I want to favorite a Project so that it appears pinned at the top of my dashboard.
**US-17:** As a PMO, I want to view a list of all active Projects sortable by Health Score.
**US-18:** As a Scrum Master, I want to view the Sprint history of a project so that I can analyze past performance.
**US-19:** As a Delivery Manager, I want to add custom tags (e.g., "Compliance", "Urgent") to Projects.
**US-20:** As an Exec, I want to search for any Project globally by name using the top search bar.

### Module 3: Dependency Intelligence Engine (21-35)
**US-21:** As a PM, I want to view an interactive graph of all tasks so that I can visualize connections.
**US-22:** As a Dev, I want to click a node to see who is assigned to it so that I can Slack them.
**US-23:** As a Scrum Master, I want the system to highlight the Critical Path in red so that I know what cannot slip.
**US-24:** As a System, I want to automatically calculate the Bottleneck Score for each node based on edge counts.
**US-25:** As a PM, I want to manually draw an edge between two nodes in the UI to create a dependency.
**US-26:** As a Delivery Manager, I want cross-team edges to be visually distinct (e.g., dashed lines).
**US-27:** As a System, I want to block the creation of an edge if it results in a circular dependency.
**US-28:** As a Scrum Master, I want an alert if a circular dependency is accidentally created in Jira.
**US-29:** As a PM, I want to filter the graph to only show "Blocked" status nodes.
**US-30:** As a PM, I want to zoom and pan the graph canvas freely.
**US-31:** As an Exec, I want the system to calculate the financial impact of a delayed milestone on the graph.
**US-32:** As a Dev, I want to right-click a node to open the corresponding Jira ticket in a new tab.
**US-33:** As a Delivery Manager, I want to see the calculated 'Slack' time (in days) on every node.
**US-34:** As a PM, I want to expand an Epic node to reveal the individual Task nodes inside it.
**US-35:** As a PMO, I want to export the dependency graph as a high-res PNG for presentations.

### Module 4: Project Health Engine (36-45)
**US-36:** As an Exec, I want to see a 0-100 Health Score on every Project overview page.
**US-37:** As a PM, I want to see a spider chart breaking down the 8 health dimensions.
**US-38:** As a System, I want to automatically degrade the Health Score if no webhook activity occurs for 72 hours.
**US-39:** As a PMO Admin, I want to globally adjust the weight percentages of the 8 health dimensions.
**US-40:** As a Scrum Master, I want to see a 30-day historical trendline of the Health Score.
**US-41:** As a PM, I want the UI score to turn Red if it drops below 50.
**US-42:** As a User, I want to hover over the score to see the exact formula calculation.
**US-43:** As a Delivery Manager, I want an automated email alert if a Priority 1 project drops below 70.
**US-44:** As a QA Lead, I want open Sev-1 bugs to disproportionately lower the Defect health dimension.
**US-45:** As a Dev, I want my merged PRs to immediately positively impact the Velocity dimension.

### Module 5: Risk Prediction & AI (46-60)
**US-46:** As a PM, I want the ML engine to predict the percentage probability of hitting my release date.
**US-47:** As a Scrum Master, I want the AI to generate a 2-sentence explanation of why the health score dropped.
**US-48:** As a Delivery Manager, I want the AI to recommend specific task reassignments to balance workload.
**US-49:** As an Exec, I want a "Generate Exec Summary" button that creates a plain-text status update.
**US-50:** As a PM, I want the AI to highlight which specific Jira ticket is the root cause of a delay.
**US-51:** As a System, I want to attach a Confidence Score (0-100%) to every AI prediction.
**US-52:** As a Dev, I want to ask the AI Chatbot "Who is blocking me?" and get an instant answer.
**US-53:** As a Scrum Master, I want the AI to suggest splitting an Epic if it detects the scope is too large.
**US-54:** As a User, I want to click an AI citation link to jump directly to the data that proves the AI's claim.
**US-55:** As a PM, I want to click "Mitigate" on a predicted risk to document my action plan.
**US-56:** As a System, I want to ensure the AI never hallucinates by restricting its context strictly to project JSON data.
**US-57:** As an Exec, I want a dashboard of the "Top 5 Global Risks" generated by the ML engine.
**US-58:** As a Scrum Master, I want the AI to flag if a developer has been assigned a task outside their historical skillset.
**US-59:** As a QA Lead, I want the AI to predict which module will have the most bugs based on code churn.
**US-60:** As a Delivery Manager, I want the AI to draft an apology email to stakeholders if a release slips.

### Module 6: Team Workload Analytics (61-70)
**US-61:** As a Scrum Master, I want to set a Team's total capacity in hours for the upcoming sprint.
**US-62:** As a Dev, I want to log my planned PTO so it is subtracted from the team capacity.
**US-63:** As a Delivery Manager, I want to view a heatmap of developer utilization (Red = Over 100%).
**US-64:** As a Scrum Master, I want to see assigned Story Points converted to estimated hours based on historical velocity.
**US-65:** As a PM, I want a warning if I assign a critical path item to a developer at 110% capacity.
**US-66:** As a Scrum Master, I want to drag and drop a task from Dev A to Dev B to rebalance workload.
**US-67:** As a QA Lead, I want to view QA-specific capacity separately from Developer capacity.
**US-68:** As a PMO, I want to compare the average utilization of Backend teams vs Frontend teams globally.
**US-69:** As a Delivery Manager, I want to identify "underutilized" developers to reassign them to blocked projects.
**US-70:** As a System, I want to automatically recalculate team capacity every night based on updated PTO calendars.

### Module 7: Sprint Intelligence (71-80)
**US-71:** As a Scrum Master, I want an auto-updating burndown chart that requires zero manual data entry.
**US-72:** As a PM, I want an alert banner to appear if >5% scope is added after the sprint started.
**US-73:** As an Engineering Manager, I want to track the average time a PR sits waiting for review per sprint.
**US-74:** As a Scrum Master, I want to see a burn-up chart comparing completed work against total scope.
**US-75:** As a QA Lead, I want to see the ratio of bugs found vs bugs fixed within the active sprint.
**US-76:** As a Delivery Manager, I want to export sprint metrics to a CSV file.
**US-77:** As a Dev, I want my GitHub commits to automatically move my Jira ticket to "In Progress".
**US-78:** As a Scrum Master, I want to see the historical median velocity for the team over the last 5 sprints.
**US-79:** As a PM, I want the UI to visually flag tasks that have rolled over from the previous sprint.
**US-80:** As a Delivery Manager, I want to view all active sprints across my entire program on one screen.

### Module 8: Executive Reporting & Integrations (81-100)
**US-81:** As an Exec, I want to download a PDF report containing the Health Scores of my entire portfolio.
**US-82:** As a PMO, I want to schedule the PDF report to be emailed to stakeholders every Friday at 8 AM.
**US-83:** As an Admin, I want to upload a company logo to brand the exported PDF reports.
**US-84:** As an Exec, I want an Excel export option so I can run my own pivot tables on the raw data.
**US-85:** As a PMO, I want to create custom report templates selecting only specific projects to include.
**US-86:** As an Admin, I want to generate a webhook URL to paste into Jira.
**US-87:** As a System, I want to reject Jira webhooks that do not have a valid HMAC signature.
**US-88:** As an Admin, I want to map Jira Issue Types (e.g., "Story", "Bug") to DeliveryFlow's internal types.
**US-89:** As a Dev, I want GitHub PR merge events to automatically resolve associated tasks in DeliveryFlow.
**US-90:** As a Scrum Master, I want critical AI risk alerts to be pushed to a specific Slack channel.
**US-91:** As an Admin, I want a dashboard showing the status and latency of all external integrations.
**US-92:** As a System, I want to queue webhooks in Kafka to ensure zero data loss during traffic spikes.
**US-93:** As a System, I want to retry failed webhook processing up to 3 times before moving to a Dead Letter Queue.
**US-94:** As an Admin, I want to manually trigger a "Full Sync" to pull all historical data from a Jira project.
**US-95:** As a QA Lead, I want Jenkins build failures to automatically decrease the Release Confidence score.
**US-96:** As a Delivery Manager, I want to link a MS Teams channel to a Project for automated daily summaries.
**US-97:** As a PMO, I want the system to alert me if the Jira integration token expires.
**US-98:** As a Dev, I want to see my assigned GitHub Review Requests directly in my DeliveryFlow workload view.
**US-99:** As a PM, I want a "Data Freshness" indicator showing when the last webhook was successfully processed.
**US-100:** As an Admin, I want to disconnect an integration and permanently wipe its associated data from the tenant.
