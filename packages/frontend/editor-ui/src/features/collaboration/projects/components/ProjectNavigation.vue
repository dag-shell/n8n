<script lang="ts" setup>
import { useGlobalEntityCreation } from '@/app/composables/useGlobalEntityCreation';
import { VIEWS } from '@/app/constants';
import { sourceControlEventBus } from '@/features/integrations/sourceControl.ee/sourceControl.eventBus';
import { useUsersStore } from '@n8n/stores/users.store';
import { useSettingsStore } from '@n8n/stores/settings.store';
import { N8nIcon, N8nMenuItem, N8nText } from '@n8n/design-system';
import type { IMenuItem } from '@n8n/design-system';
import { useI18n } from '@n8n/i18n';
import { computed, onBeforeMount, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useProjectsStore } from '../projects.store';
import { DEFAULT_PROJECT_ICON } from '../projects.constants';
import type { ProjectListItem } from '../projects.types';
import { CHAT_VIEW } from '@/features/ai/chatHub/constants';
import { DATA_TABLE_VIEW } from '@/features/core/dataTable/constants';
import { useFavoritesStore } from '@/app/stores/favorites.store';
import { useFavoriteNavItems } from '../composables/useFavoriteNavItems';
import { INSTANCE_AI_VIEW } from '@/features/ai/instanceAi/constants';
import { useInstanceAiAvailable } from '@/features/ai/instanceAi/composables/useInstanceAiAvailability';
import { WORKFLOW_REVIEW_REQUESTS_VIEW } from '@/features/workflow-reviews/constants';
import { useWorkflowReviewsFeature } from '@/features/workflow-reviews/composables/useWorkflowReviewsFeature';

import { hasPermission } from '@/app/utils/rbac/permissions';

const PROJECTS_COLLAPSED_KEY = 'n8n:sidebar:projects-collapsed';

type Props = {
	collapsed: boolean;
	planName?: string;
};

const props = defineProps<Props>();

const locale = useI18n();
const route = useRoute();
const globalEntityCreation = useGlobalEntityCreation();

const projectsStore = useProjectsStore();
const settingsStore = useSettingsStore();
const usersStore = useUsersStore();
const favoritesStore = useFavoritesStore();

const isOwner = computed(() => hasPermission(['instanceOwner']));

const {
	favoriteGroups,
	activeTabId,
	onFavoriteProjectClick,
	onFavoriteWorkflowClick,
	onUnpinFavorite,
} = useFavoriteNavItems();

const displayProjects = computed(() => globalEntityCreation.displayProjects.value);
const isFoldersFeatureEnabled = computed(() => settingsStore.isFoldersFeatureEnabled);
const isChatLinkAvailable = computed(
	() =>
		settingsStore.isChatFeatureEnabled &&
		hasPermission(['rbac'], { rbac: { scope: 'chatHub:message' } }),
);
const isInstanceAiNavVisible = useInstanceAiAvailable();
const hasMultipleVerifiedUsers = computed(
	() => usersStore.allUsers.filter((user) => !user.isPendingUser).length > 1,
);

const FAVORITES_COLLAPSED_KEY = computed(
	() => `n8n:sidebar:${usersStore.currentUser?.id ?? 'anonymous'}:favorites-collapsed`,
);

const favoritesCollapsed = ref(localStorage.getItem(FAVORITES_COLLAPSED_KEY.value) === 'true');
const projectsCollapsed = ref(localStorage.getItem(PROJECTS_COLLAPSED_KEY) === 'true');

watch(favoritesCollapsed, (val) =>
	localStorage.setItem(FAVORITES_COLLAPSED_KEY.value, String(val)),
);
watch(projectsCollapsed, (val) => localStorage.setItem(PROJECTS_COLLAPSED_KEY, String(val)));

const home = computed<IMenuItem>(() => ({
	id: 'home',
	label: locale.baseText('projects.menu.overview'),
	icon: 'house',
	route: {
		to: { name: VIEWS.HOMEPAGE },
	},
}));

const workflowsItem = computed<IMenuItem>(() => ({
	id: 'workflows',
	label: locale.baseText('mainSidebar.workflows'),
	icon: 'git-branch',
	route: {
		to: { name: VIEWS.WORKFLOWS },
	},
}));

const credentialsItem = computed<IMenuItem>(() => ({
	id: 'credentials',
	label: locale.baseText('mainSidebar.credentials'),
	icon: 'key',
	route: {
		to: { name: VIEWS.CREDENTIALS },
	},
}));

const executionsItem = computed<IMenuItem>(() => ({
	id: 'executions',
	label: locale.baseText('mainSidebar.executions'),
	icon: 'history',
	route: {
		to: { name: VIEWS.EXECUTIONS },
	},
}));

const variablesItem = computed<IMenuItem>(() => ({
	id: 'variables',
	label: locale.baseText('mainSidebar.variables'),
	icon: 'braces',
	route: {
		to: { name: VIEWS.HOME_VARIABLES },
	},
}));

const dataTablesItem = computed<IMenuItem>(() => ({
	id: 'datatables',
	label: locale.baseText('dataTable.dataTables'),
	icon: 'table',
	route: {
		to: { name: DATA_TABLE_VIEW },
	},
}));

const communityPackagesItem = computed<IMenuItem>(() => ({
	id: 'community-packages',
	label: locale.baseText('settings.communityNodes'),
	icon: 'box',
	route: {
		to: { name: VIEWS.HOME_COMMUNITY_PACKAGES },
	},
}));

const isWorkflowsActive = computed(() => {
	const currentName = route.name as string;
	return [
		VIEWS.WORKFLOWS,
		VIEWS.WORKFLOW,
		VIEWS.NEW_WORKFLOW,
		VIEWS.FOLDERS,
		VIEWS.HOMEPAGE,
	].includes(currentName as VIEWS);
});

const isCredentialsActive = computed(() => {
	const currentName = route.name as string;
	return [VIEWS.CREDENTIALS, VIEWS.CREDENTIAL_EDIT, VIEWS.CREDENTIAL_NEW].includes(
		currentName as VIEWS,
	);
});

const isExecutionsActive = computed(() => {
	const currentName = route.name as string;
	return [VIEWS.EXECUTIONS, VIEWS.EXECUTION_PREVIEW, VIEWS.EXECUTION_DEBUG].includes(
		currentName as VIEWS,
	);
});

const isVariablesActive = computed(() => {
	const currentName = route.name as string;
	return [VIEWS.HOME_VARIABLES, VIEWS.PROJECTS_VARIABLES].includes(currentName as VIEWS);
});

const isDataTablesActive = computed(() => {
	const currentName = route.name as string;
	return [DATA_TABLE_VIEW, 'data-table-details', 'project-data-tables'].includes(currentName);
});

const isCommunityPackagesActive = computed(() => {
	const currentName = route.name as string;
	return [
		VIEWS.COMMUNITY_NODES,
		VIEWS.HOME_COMMUNITY_PACKAGES,
		'community-packages',
		'community-nodes',
		'ProjectsCommunityPackages',
	].includes(currentName);
});

const shared = computed<IMenuItem>(() => ({
	id: 'shared',
	label: locale.baseText('projects.menu.shared'),
	icon: 'share',
	route: {
		to: { name: VIEWS.SHARED_WITH_ME },
	},
}));

const getProjectMenuItem = (project: ProjectListItem): IMenuItem => ({
	id: project.id,
	label: project.name ?? '',
	icon: (project.icon ?? DEFAULT_PROJECT_ICON) as IMenuItem['icon'],
	route: {
		to: {
			name: VIEWS.PROJECTS_WORKFLOWS,
			params: { projectId: project.id },
		},
	},
});

const personalProject = computed<IMenuItem>(() => ({
	id: projectsStore.personalProject?.id ?? '',
	label: locale.baseText('projects.menu.personal'),
	icon: 'user',
	route: {
		to: {
			name: VIEWS.PROJECTS_WORKFLOWS,
			params: { projectId: projectsStore.personalProject?.id },
		},
	},
}));

const hasFavorites = computed(() => favoritesStore.favorites.length > 0);

const instanceAi = computed<IMenuItem>(() => ({
	id: 'instance-ai',
	icon: 'sparkles',
	label: locale.baseText('projects.menu.instanceAi'),
	route: { to: { name: INSTANCE_AI_VIEW } },
	preview: true,
}));

const { isWorkflowReviewsEnabled: isWorkflowReviewsNavVisible } = useWorkflowReviewsFeature();

const workflowReviews = computed<IMenuItem>(() => ({
	id: 'workflow-reviews',
	icon: 'message-square-text',
	label: locale.baseText('workflowReviews.menu.title'),
	route: { to: { name: WORKFLOW_REVIEW_REQUESTS_VIEW } },
	preview: true,
}));
const chat = computed<IMenuItem>(() => ({
	id: 'chat',
	icon: 'message-circle',
	label: locale.baseText('projects.menu.chat'),
	position: 'bottom',
	route: { to: { name: CHAT_VIEW } },
	preview: true,
}));

async function onSourceControlPull() {
	// Update myProjects for the sidebar display
	await projectsStore.getMyProjects();
}

onBeforeMount(async () => {
	await usersStore.fetchUsers({ filter: { isPending: false }, take: 2 });
	sourceControlEventBus.on('pull', onSourceControlPull);
});

onBeforeUnmount(() => {
	sourceControlEventBus.off('pull', onSourceControlPull);
});
</script>

<template>
	<div :class="$style.projects">
		<div :class="[$style.home, props.collapsed ? $style.collapsed : '']">
			<N8nMenuItem
				v-if="isInstanceAiNavVisible"
				:item="instanceAi"
				:compact="props.collapsed"
				:active="activeTabId === 'instance-ai'"
				data-test-id="project-instance-ai-menu-item"
			/>
			<!-- Owner Navigation -->
			<template v-if="isOwner">
				<N8nMenuItem
					:item="home"
					:compact="props.collapsed"
					:active="activeTabId === 'home'"
					data-test-id="project-home-menu-item"
				/>
				<N8nMenuItem
					v-if="
						(projectsStore.isTeamProjectFeatureEnabled || isFoldersFeatureEnabled) &&
						hasPermission(['instanceOwner'])
					"
					:item="personalProject"
					:compact="props.collapsed"
					:active="activeTabId === personalProject.id"
					data-test-id="project-personal-menu-item"
				/>
				<N8nMenuItem
					v-if="
						(projectsStore.isTeamProjectFeatureEnabled || isFoldersFeatureEnabled) &&
						hasMultipleVerifiedUsers
					"
					:item="shared"
					:compact="props.collapsed"
					:active="activeTabId === 'shared'"
					data-test-id="project-shared-menu-item"
				/>
			</template>

			<!-- Non-Owner Direct Resource Navigation (Grouped) -->
			<template v-else>
				<!-- Group 1: Workflows & Executions -->
				<div :class="$style.navGroup">
					<N8nMenuItem
						:item="workflowsItem"
						:compact="props.collapsed"
						:active="isWorkflowsActive"
						data-test-id="project-workflows-menu-item"
					/>
					<N8nMenuItem
						:item="executionsItem"
						:compact="props.collapsed"
						:active="isExecutionsActive"
						data-test-id="project-executions-menu-item"
					/>
				</div>

				<div :class="$style.groupDivider" />

				<!-- Group 2: Data tables -->
				<div :class="$style.navGroup">
					<N8nMenuItem
						:item="dataTablesItem"
						:compact="props.collapsed"
						:active="isDataTablesActive"
						data-test-id="project-datatables-menu-item"
					/>
				</div>

				<div :class="$style.groupDivider" />

				<!-- Group 3: Credentials & Variables -->
				<div :class="$style.navGroup">
					<N8nMenuItem
						:item="credentialsItem"
						:compact="props.collapsed"
						:active="isCredentialsActive"
						data-test-id="project-credentials-menu-item"
					/>
					<N8nMenuItem
						:item="variablesItem"
						:compact="props.collapsed"
						:active="isVariablesActive"
						data-test-id="project-variables-menu-item"
					/>
				</div>

				<div :class="$style.groupDivider" />

				<!-- Group 4: Community Packages -->
				<div :class="$style.navGroup">
					<N8nMenuItem
						:item="communityPackagesItem"
						:compact="props.collapsed"
						:active="isCommunityPackagesActive"
						data-test-id="project-community-packages-menu-item"
					/>
				</div>
			</template>

			<N8nMenuItem
				v-if="isWorkflowReviewsNavVisible && isOwner"
				:item="workflowReviews"
				:compact="props.collapsed"
				:active="activeTabId === 'workflow-reviews'"
				data-test-id="project-workflow-reviews-menu-item"
			/>
			<N8nMenuItem
				v-if="isChatLinkAvailable"
				:item="chat"
				:compact="props.collapsed"
				:active="activeTabId === 'chat'"
				data-test-id="project-chat-menu-item"
			/>
		</div>
		<template v-if="hasFavorites && isOwner">
			<button
				v-if="!props.collapsed"
				:class="$style.sectionHeader"
				@click="favoritesCollapsed = !favoritesCollapsed"
			>
				<N8nText size="small" bold color="text-light">
					{{ locale.baseText('favorites.menu.title') }}
				</N8nText>
				<N8nIcon
					icon="chevron-down"
					size="medium"
					:class="[$style.chevron, favoritesCollapsed ? $style.chevronCollapsed : '']"
				/>
			</button>
			<div v-if="props.collapsed || !favoritesCollapsed" :class="$style.projectItems">
				<template v-for="(group, groupIndex) in favoriteGroups" :key="group.type">
					<div v-if="!props.collapsed && groupIndex > 0" :class="$style.groupSpacer" />
					<template v-for="entry in group.items" :key="entry.menuItem.id">
						<div
							:class="[$style.favoriteItem, props.collapsed && $style.collapsed]"
							@click="
								group.type === 'project'
									? onFavoriteProjectClick(entry.resourceId)
									: group.type === 'workflow'
										? onFavoriteWorkflowClick()
										: undefined
							"
						>
							<N8nMenuItem
								:item="entry.menuItem"
								:compact="props.collapsed"
								:active="activeTabId === entry.menuItem.id"
							/>
							<button
								v-if="!props.collapsed"
								:class="$style.unpinButton"
								:aria-label="locale.baseText('favorites.remove')"
								data-test-id="favorite-unpin-button"
								@click.stop.prevent="onUnpinFavorite(entry.resourceId, entry.resourceType)"
							>
								<N8nIcon icon="x" size="small" />
							</button>
						</div>
					</template>
				</template>
			</div>
		</template>
		<template
			v-if="isOwner && projectsStore.isTeamProjectFeatureEnabled && displayProjects.length > 0"
		>
			<button
				v-if="!props.collapsed"
				:class="$style.sectionHeader"
				@click="projectsCollapsed = !projectsCollapsed"
			>
				<N8nText size="small" bold color="text-light">
					{{ locale.baseText('projects.menu.title') }}
				</N8nText>
				<N8nIcon
					icon="chevron-down"
					size="medium"
					:class="[$style.chevron, projectsCollapsed ? $style.chevronCollapsed : '']"
				/>
			</button>
		</template>
		<div
			v-if="
				isOwner &&
				(projectsStore.isTeamProjectFeatureEnabled || isFoldersFeatureEnabled) &&
				(!projectsStore.isTeamProjectFeatureEnabled || !projectsCollapsed || props.collapsed)
			"
			:class="$style.projectItems"
		>
			<N8nMenuItem
				v-for="project in displayProjects"
				:key="project.id"
				:class="{
					[$style.collapsed]: props.collapsed,
				}"
				:item="getProjectMenuItem(project)"
				:compact="props.collapsed"
				:active="activeTabId === project.id"
				data-test-id="project-menu-item"
			/>
		</div>
	</div>
</template>

<style lang="scss" module>
.projects {
	width: 100%;
	align-items: start;
	gap: var(--spacing--3xs);
	&:hover {
		.plusBtn {
			display: block;
		}
	}
}

.projectItems {
	padding: var(--spacing--2xs) var(--spacing--3xs);
}

.upgradeLink {
	color: var(--color--primary);
	cursor: pointer;
}

.sectionHeader {
	display: flex;
	align-items: center;
	gap: var(--spacing--4xs);
	width: calc(100% - var(--spacing--3xs) * 2);
	box-sizing: border-box;
	padding: var(--spacing--4xs) var(--spacing--3xs);
	margin: var(--spacing--4xs) var(--spacing--3xs) 0;
	background: none;
	border: none;
	border-radius: var(--spacing--4xs);
	cursor: pointer;
	color: inherit;

	&:hover {
		background-color: var(--color--background--light-1);
		color: var(--color--text--shade-1);

		.chevron {
			color: var(--color--text--shade-1);
		}
	}

	&:focus-visible {
		outline: 1px solid var(--color--secondary);
		outline-offset: -1px;
	}
}

.chevron {
	color: var(--color--text--tint-1);
	transition: transform 0.15s ease;
	flex-shrink: 0;
}

.chevronCollapsed {
	transform: rotate(-90deg);
}

/* Keep old .projectsLabel for any remaining usages */
.projectsLabel {
	display: flex;
	justify-content: space-between;
	text-overflow: ellipsis;
	overflow: hidden;
	box-sizing: border-box;
	padding: 0 var(--spacing--xs);
	margin-top: var(--spacing--2xs);

	&.collapsed {
		padding: 0;
		margin-left: 0;
		justify-content: center;
	}
}

.plusBtn {
	margin: 0;
	padding: 0;
	color: var(--color--text--tint-1);
	display: none;
}

.addFirstProjectBtn {
	font-size: var(--font-size--xs);
	margin: 0 var(--spacing--xs);
	width: calc(100% - var(--spacing--xs) * 2);

	&.collapsed {
		display: none;
	}
}

.home {
	padding: 0 var(--spacing--3xs) var(--spacing--2xs);

	&.collapsed {
		border-bottom: var(--border);
	}
}

.groupSpacer {
	height: var(--spacing--5xs);
}

.favoriteItem {
	position: relative;

	&:hover .unpinButton,
	.unpinButton:focus-visible {
		opacity: 1;
		pointer-events: auto;
	}

	&:not(.collapsed):hover a[role='menuitem'] {
		background-color: var(--color--background--light-1);
		color: var(--color--text--shade-1);
		padding-right: var(--spacing--lg);
	}
}

.unpinButton {
	position: absolute;
	right: var(--spacing--4xs);
	top: 50%;
	transform: translateY(-50%);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: var(--spacing--5xs);
	background: none;
	border: none;
	color: var(--color--text--tint-2);
	cursor: pointer;
	opacity: 0;
	pointer-events: none;
	transition: opacity 0.15s ease;

	&:hover,
	&:focus-visible {
		color: var(--color--text);
	}
}

.navGroup {
	display: flex;
	flex-direction: column;
	gap: var(--spacing--5xs);
}

.groupDivider {
	display: block;
	width: 100%;
	border-bottom: var(--border);
	margin: var(--spacing--xs) 0;
}
</style>
