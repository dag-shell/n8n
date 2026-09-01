import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router';
import { VIEWS } from '@/app/constants';
import { useProjectsStore } from './projects.store';
import { getResourcePermissions } from '@n8n/permissions';
import { CHAT_VIEW } from '@/features/ai/chatHub/constants';
import { hasRole } from '@/app/utils/rbac/checks';
import { useSettingsStore } from '@n8n/stores/settings.store';

const WorkflowsView = async () => await import('@/app/views/WorkflowsView.vue');
const CredentialsView = async () =>
	await import('@/features/credentials/views/CredentialsView.vue');
const ProjectSettings = async () => await import('./views/ProjectSettings.vue');
const ExecutionsView = async () =>
	await import('@/features/execution/executions/views/ExecutionsView.vue');
const ProjectVariables = async () => await import('./views/ProjectVariables.vue');
const SettingsCommunityNodesView = async () =>
	await import('@/features/settings/communityNodes/views/SettingsCommunityNodesView.vue');
const SettingsMCPView = async () => await import('@/features/ai/mcpAccess/SettingsMCPView.vue');
const SettingsMCPWorkflowsView = async () =>
	await import('@/features/ai/mcpAccess/SettingsMCPWorkflowsView.vue');
const SettingsMCPAgentsView = async () =>
	await import('@/features/ai/mcpAccess/SettingsMCPAgentsView.vue');
const SettingsMCPClientsView = async () =>
	await import('@/features/ai/mcpAccess/SettingsMCPClientsView.vue');

function refreshInsightsSummary() {
	void import('@/features/execution/insights')
		.then(({ useInsightsStore }) => {
			const insightsStore = useInsightsStore();
			if (insightsStore.isSummaryEnabled) {
				void insightsStore.weeklySummary.execute();
			}
		})
		.catch(() => {});
}

const checkProjectAvailability = (to?: RouteLocationNormalized): boolean => {
	if (!to?.params.projectId) {
		return true;
	}
	const project = useProjectsStore().myProjects.find((p) => to?.params.projectId === p.id);
	return !!project;
};

const commonChildRoutes: RouteRecordRaw[] = [
	{
		path: 'workflows',
		component: WorkflowsView,
		meta: {
			middleware: ['authenticated', 'custom'],
			middlewareOptions: {
				custom: (options) => checkProjectAvailability(options?.to),
			},
		},
	},
	{
		path: 'credentials/:credentialId?',
		props: true,
		component: CredentialsView,
		meta: {
			middleware: ['authenticated', 'custom'],
			middlewareOptions: {
				custom: (options) => checkProjectAvailability(options?.to),
			},
		},
	},
	{
		path: 'executions',
		component: ExecutionsView,
		meta: {
			middleware: ['authenticated', 'custom'],
			middlewareOptions: {
				custom: (options) => checkProjectAvailability(options?.to),
			},
		},
	},
	{
		path: 'folders/:folderId?/workflows',
		component: WorkflowsView,
		meta: {
			middleware: ['authenticated', 'custom'],
			middlewareOptions: {
				custom: (options) => checkProjectAvailability(options?.to),
			},
		},
	},
	{
		path: 'variables',
		component: ProjectVariables,
		meta: {
			middleware: ['authenticated', 'custom'],
			middlewareOptions: {
				custom: (options) => checkProjectAvailability(options?.to),
			},
		},
	},
	{
		path: 'community-packages',
		component: SettingsCommunityNodesView,
		meta: {
			middleware: ['authenticated', 'custom'],
			middlewareOptions: {
				custom: () => {
					const settingsStore = useSettingsStore();
					return settingsStore.isCommunityNodesFeatureEnabled;
				},
			},
		},
	},
	{
		path: 'mcp',
		component: SettingsMCPView,
		meta: {
			middleware: ['authenticated'],
		},
	},
	{
		path: 'mcp/workflows',
		component: SettingsMCPWorkflowsView,
		meta: {
			middleware: ['authenticated'],
		},
	},
	{
		path: 'mcp/agents',
		component: SettingsMCPAgentsView,
		meta: {
			middleware: ['authenticated'],
		},
	},
	{
		path: 'mcp/clients',
		component: SettingsMCPClientsView,
		meta: {
			middleware: ['authenticated'],
		},
	},
];

const commonChildRouteExtensions = {
	home: [
		{
			name: VIEWS.WORKFLOWS,
		},
		{
			name: VIEWS.CREDENTIALS,
		},
		{
			name: VIEWS.EXECUTIONS,
		},
		{
			name: VIEWS.FOLDERS,
		},
		{
			name: VIEWS.HOME_VARIABLES,
		},
		{
			name: VIEWS.HOME_COMMUNITY_PACKAGES,
		},
		{
			name: VIEWS.HOME_MCP,
		},
		{
			name: VIEWS.HOME_MCP_WORKFLOWS,
		},
		{
			name: VIEWS.HOME_MCP_AGENTS,
		},
		{
			name: VIEWS.HOME_MCP_CLIENTS,
		},
	],
	projects: [
		{
			name: VIEWS.PROJECTS_WORKFLOWS,
		},
		{
			name: VIEWS.PROJECTS_CREDENTIALS,
		},
		{
			name: VIEWS.PROJECTS_EXECUTIONS,
		},
		{
			name: VIEWS.PROJECTS_FOLDERS,
		},
		{
			name: VIEWS.PROJECTS_VARIABLES,
		},
		{
			name: 'ProjectsCommunityPackages',
		},
		{
			name: 'ProjectsMcp',
		},
		{
			name: 'ProjectsMcpWorkflows',
		},
		{
			name: 'ProjectsMcpAgents',
		},
		{
			name: 'ProjectsMcpClients',
		},
	],
};

export const projectsRoutes: RouteRecordRaw[] = [
	{
		path: '/projects',
		name: VIEWS.PROJECTS,
		meta: {
			middleware: ['authenticated', 'instanceOwner'],
		},
		redirect: '/home/workflows',
		children: [
			{
				name: VIEWS.PROJECT_DETAILS,
				path: ':projectId',
				meta: {
					middleware: ['authenticated', 'instanceOwner'],
				},
				redirect: { name: VIEWS.PROJECTS_WORKFLOWS },
				children: commonChildRoutes
					.map((route, idx) => ({
						...route,
						name: commonChildRouteExtensions.projects[idx]?.name,
					}))
					.concat([
						{
							path: 'settings',
							name: VIEWS.PROJECT_SETTINGS,
							component: ProjectSettings,
							meta: {
								middleware: ['authenticated', 'custom'],
								middlewareOptions: {
									custom: (options) => {
										const project = useProjectsStore().myProjects.find(
											(p) => p.id === options?.to.params.projectId,
										);
										const permissions = getResourcePermissions(project?.scopes);
										// Mirrors ProjectHeader's showSettings: any one section's
										// scope is enough to enter the settings page.
										return (
											!!permissions.project.update ||
											!!permissions.project.manageMembers ||
											!!permissions.externalSecretsProvider.read
										);
									},
								},
							},
						},
					]),
			},
		],
	},
	{
		path: '/home',
		name: VIEWS.HOMEPAGE,
		meta: {
			middleware: ['authenticated'],
		},
		redirect: '/home/workflows',
		beforeEnter: (_to, _from, next) => {
			const settingsStore = useSettingsStore();
			if (settingsStore.isChatFeatureEnabled && hasRole(['global:chatUser'])) {
				// Prevent Chat users from accessing the home view
				return next({ name: CHAT_VIEW });
			}

			// Refresh the weekly summary when entering the home route. The import is lazy and
			// unawaited: this module is in the boot graph through the router, and a chunk that
			// fails to load must not hold up navigation — the summary only stays stale.
			refreshInsightsSummary();

			next();
		},
		children: commonChildRoutes.map((route, idx) => ({
			...route,
			name: commonChildRouteExtensions.home[idx]?.name,
			middleware: ['authenticated'],
		})),
	},
	{
		path: '/shared',
		name: VIEWS.SHARED_WITH_ME,
		meta: {
			middleware: ['authenticated'],
		},
		redirect: '/shared/workflows',
		children: [
			{
				path: 'workflows',
				name: VIEWS.SHARED_WORKFLOWS,
				component: WorkflowsView,
				meta: {
					middleware: ['authenticated', 'custom'],
					middlewareOptions: {
						custom: (options) => checkProjectAvailability(options?.to),
					},
				},
			},
			{
				path: 'credentials/:credentialId?',
				props: true,
				name: VIEWS.SHARED_CREDENTIALS,
				component: CredentialsView,
				meta: {
					middleware: ['authenticated', 'custom'],
					middlewareOptions: {
						custom: (options) => checkProjectAvailability(options?.to),
					},
				},
			},
		],
	},
	{
		path: '/workflows',
		redirect: '/home/workflows',
	},
	{
		path: '/credentials',
		redirect: '/home/credentials',
	},
	{
		path: '/executions',
		redirect: '/home/executions',
	},
	{
		path: '/variables',
		redirect: '/home/variables',
	},
	{
		path: '/community-packages',
		redirect: '/home/community-packages',
	},
	{
		path: '/community-nodes',
		redirect: '/home/community-packages',
	},
	{
		path: '/mcp',
		redirect: '/home/mcp',
	},
	{
		path: '/mcp/workflows',
		redirect: '/home/mcp/workflows',
	},
	{
		path: '/mcp/agents',
		redirect: '/home/mcp/agents',
	},
	{
		path: '/mcp/clients',
		redirect: '/home/mcp/clients',
	},
];
