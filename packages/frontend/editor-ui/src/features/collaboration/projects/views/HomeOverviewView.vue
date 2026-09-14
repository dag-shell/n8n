<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '@n8n/i18n';
import { useDocumentTitle } from '@/app/composables/useDocumentTitle';
import PageViewLayout from '@/app/components/layouts/PageViewLayout.vue';
import ProjectHeader from '@/features/collaboration/projects/components/ProjectHeader.vue';
import { useInsightsStore } from '@/features/execution/insights';
import { useWorkflowsListStore } from '@/app/stores/workflowsList.store';
import { useCredentialsStore } from '@/features/credentials/credentials.store';
import { useDataTableStore } from '@/features/core/dataTable/dataTable.store';
import { useEnvironmentsStore } from '@/features/settings/environments.ee/environments.store';
import { useProjectsStore } from '@/features/collaboration/projects/projects.store';
import { useUIStore } from '@/app/stores/ui.store';
import { useRootStore } from '@n8n/stores/useRootStore';
import { makeRestApiRequest } from '@n8n/rest-api-client';
import { VIEWS } from '@/app/constants';
import { DATA_TABLE_VIEW, ADD_DATA_TABLE_MODAL_KEY } from '@/features/core/dataTable/constants';
import type { IWorkflowDb } from '@/Interface';
import { formatTimeAgo } from '@/app/utils/formatters/dateFormatter';
import { N8nButton, N8nHeading, N8nIcon, N8nLoading, N8nTag, N8nText } from '@n8n/design-system';

interface HostMetrics {
	cpu: {
		cores: number;
		model: string;
		loadAverage: number[];
		usagePercent: number;
	};
	memory: {
		total: number;
		used: number;
		free: number;
		usagePercent: number;
		totalFormatted: string;
		usedFormatted: string;
		freeFormatted: string;
	};
	storage: {
		total: number;
		used: number;
		available: number;
		usagePercent: number;
		totalFormatted: string;
		usedFormatted: string;
		availableFormatted: string;
	};
	network: {
		rxBytes: number;
		txBytes: number;
		rxFormatted: string;
		txFormatted: string;
		rxSecFormatted?: string;
		txSecFormatted?: string;
	};
	system: {
		hostname: string;
		platform: string;
		arch: string;
		release: string;
		uptime: number;
		nodeVersion: string;
	};
	timestamp: number;
}

const router = useRouter();
const i18n = useI18n();
const documentTitle = useDocumentTitle();
const rootStore = useRootStore();

const insightsStore = useInsightsStore();
const workflowsListStore = useWorkflowsListStore();
const credentialsStore = useCredentialsStore();
const dataTableStore = useDataTableStore();
const environmentsStore = useEnvironmentsStore();
const projectsStore = useProjectsStore();
const uiStore = useUIStore();

const loading = ref(true);

// Host metrics state
const hostMetrics = ref<HostMetrics | null>(null);
const hostMetricsLoading = ref(true);
const hostMetricsError = ref<string | null>(null);
let prevRxBytes = 0;
let prevTxBytes = 0;
const networkRxRate = ref('0 B/s');
const networkTxRate = ref('0 B/s');
const POLL_INTERVAL = 5000;
let pollTimer: ReturnType<typeof setInterval> | null = null;

function formatBytes(bytes: number): string {
	if (!bytes || isNaN(bytes) || bytes <= 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	const idx = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
	return `${parseFloat((bytes / Math.pow(k, idx)).toFixed(1))} ${sizes[idx]}`;
}

function getProgressColor(percent: number): string {
	if (percent >= 90) return 'var(--color--danger)';
	if (percent >= 70) return 'var(--color--warning)';
	return 'var(--color--success)';
}

async function fetchHostMetrics() {
	try {
		const raw = await makeRestApiRequest<{ data?: HostMetrics } & HostMetrics>(
			rootStore.restApiContext,
			'GET',
			'/host-metrics',
		);
		const payload = raw.data ?? raw;
		hostMetrics.value = payload;
		hostMetricsError.value = null;

		if (
			payload.network?.rxSecFormatted &&
			payload.network?.txSecFormatted &&
			(payload.network.rxSecFormatted !== '0 B/s' || payload.network.txSecFormatted !== '0 B/s')
		) {
			networkRxRate.value = payload.network.rxSecFormatted;
			networkTxRate.value = payload.network.txSecFormatted;
		} else if (prevRxBytes > 0 && payload.network) {
			const rxDelta = payload.network.rxBytes - prevRxBytes;
			const txDelta = payload.network.txBytes - prevTxBytes;
			const rateDivisor = POLL_INTERVAL / 1000;
			networkRxRate.value = `${formatBytes(Math.max(0, rxDelta) / rateDivisor)}/s`;
			networkTxRate.value = `${formatBytes(Math.max(0, txDelta) / rateDivisor)}/s`;
		} else if (payload.network?.rxSecFormatted && payload.network?.txSecFormatted) {
			networkRxRate.value = payload.network.rxSecFormatted;
			networkTxRate.value = payload.network.txSecFormatted;
		}
		if (payload.network) {
			prevRxBytes = payload.network.rxBytes;
			prevTxBytes = payload.network.txBytes;
		}
	} catch (e) {
		hostMetricsError.value = e instanceof Error ? e.message : 'Failed to fetch host metrics';
	} finally {
		hostMetricsLoading.value = false;
	}
}

const totalWorkflows = computed(() => workflowsListStore.totalWorkflowCount);
const activeWorkflows = computed(
	() => workflowsListStore.allWorkflows.filter((w) => w.active).length,
);
const inactiveWorkflows = computed(() => Math.max(0, totalWorkflows.value - activeWorkflows.value));

const recentWorkflows = computed<IWorkflowDb[]>(() => {
	return [...workflowsListStore.allWorkflows]
		.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
		.slice(0, 5);
});

const totalCredentials = computed(() => {
	return Object.keys(credentialsStore.allCredentials).length;
});

const totalDataTables = computed(() => {
	return dataTableStore.dataTables.length;
});

const totalVariables = computed(() => {
	return environmentsStore.variables.length;
});

const insightsData = computed(() => insightsStore.weeklySummary.state);
const insightsLoading = computed(() => insightsStore.weeklySummary.isLoading);

const totalExecutionsCount = computed(() => {
	const totalItem = insightsData.value?.find((item) => item.id === 'total');
	return totalItem ? totalItem.value : 0;
});

const failedExecutionsCount = computed(() => {
	const failedItem = insightsData.value?.find((item) => item.id === 'failed');
	return failedItem ? failedItem.value : 0;
});

const failureRateValue = computed(() => {
	const failureRateItem = insightsData.value?.find((item) => item.id === 'failureRate');
	return failureRateItem ? failureRateItem.value : 0;
});

function navigateTo(routeName: string, params?: Record<string, string>) {
	void router.push({ name: routeName, params });
}

function createNewWorkflow() {
	void router.push({
		name: VIEWS.NEW_WORKFLOW,
		query: {
			projectId: projectsStore.currentProject?.id ?? projectsStore.personalProject?.id,
		},
	});
}

function createNewCredential() {
	void router.push({
		name: VIEWS.CREDENTIALS,
		params: { credentialId: 'create' },
	});
}

function createNewDataTable() {
	uiStore.openModal(ADD_DATA_TABLE_MODAL_KEY);
}

onMounted(async () => {
	documentTitle.set(i18n.baseText('projects.menu.overview'));

	void fetchHostMetrics();
	pollTimer = setInterval(() => {
		void fetchHostMetrics();
	}, POLL_INTERVAL);

	loading.value = true;
	try {
		await Promise.allSettled([
			workflowsListStore.fetchWorkflowsPageWithCount(undefined, 1, 20),
			credentialsStore.fetchAllCredentials(),
			dataTableStore.fetchDataTables('', 1, 10),
			environmentsStore.fetchAllVariables(),
			insightsStore.weeklySummary.execute(),
		]);
	} finally {
		loading.value = false;
	}
});

onUnmounted(() => {
	if (pollTimer) {
		clearInterval(pollTimer);
		pollTimer = null;
	}
});
</script>

<template>
	<PageViewLayout>
		<template #header>
			<ProjectHeader />
		</template>

		<div :class="$style.overviewContainer">
			<!-- Host System Metrics Section -->
			<section :class="$style.section">
				<div :class="$style.metricsGrid">
					<!-- CPU Card -->
					<div :class="$style.metricCard">
						<div :class="$style.metricHeader">
							<div :class="[$style.metricIconWrap, $style.iconCpu]">
								<N8nIcon icon="microchip" size="medium" />
							</div>
							<div :class="$style.metricTitle">
								<N8nText bold size="small">CPU</N8nText>
							</div>
						</div>
						<div :class="$style.metricBody">
							<N8nLoading
								v-if="hostMetricsLoading"
								:loading="hostMetricsLoading"
								:rows="1"
								variant="p"
							/>
							<template v-else-if="hostMetrics">
								<div :class="$style.metricValue">{{ hostMetrics.cpu.usagePercent }}%</div>
								<div :class="$style.progressBar">
									<div
										:class="$style.progressFill"
										:style="{
											width: `${hostMetrics.cpu.usagePercent}%`,
											backgroundColor: getProgressColor(hostMetrics.cpu.usagePercent),
										}"
									/>
								</div>
								<div :class="$style.metricDetails">
									<N8nText size="xsmall" color="text-light">
										{{ hostMetrics.cpu.cores }} cores
									</N8nText>
									<N8nText size="xsmall" color="text-light">
										Load: {{ hostMetrics.cpu.loadAverage[0].toFixed(2) }}
									</N8nText>
								</div>
							</template>
						</div>
					</div>

					<!-- Memory Card -->
					<div :class="$style.metricCard">
						<div :class="$style.metricHeader">
							<div :class="[$style.metricIconWrap, $style.iconMemory]">
								<N8nIcon icon="memory-stick" size="medium" />
							</div>
							<div :class="$style.metricTitle">
								<N8nText bold size="small">Memory</N8nText>
							</div>
						</div>
						<div :class="$style.metricBody">
							<N8nLoading
								v-if="hostMetricsLoading"
								:loading="hostMetricsLoading"
								:rows="1"
								variant="p"
							/>
							<template v-else-if="hostMetrics">
								<div :class="$style.metricValue">{{ hostMetrics.memory.usagePercent }}%</div>
								<div :class="$style.progressBar">
									<div
										:class="$style.progressFill"
										:style="{
											width: `${hostMetrics.memory.usagePercent}%`,
											backgroundColor: getProgressColor(hostMetrics.memory.usagePercent),
										}"
									/>
								</div>
								<div :class="$style.metricDetails">
									<N8nText size="xsmall" color="text-light">
										{{ hostMetrics.memory.usedFormatted }} / {{ hostMetrics.memory.totalFormatted }}
									</N8nText>
									<N8nText size="xsmall" color="text-light">
										{{ hostMetrics.memory.freeFormatted }} free
									</N8nText>
								</div>
							</template>
						</div>
					</div>

					<!-- Storage Card -->
					<div :class="$style.metricCard">
						<div :class="$style.metricHeader">
							<div :class="[$style.metricIconWrap, $style.iconStorage]">
								<N8nIcon icon="hard-drive" size="medium" />
							</div>
							<div :class="$style.metricTitle">
								<N8nText bold size="small">Storage</N8nText>
							</div>
						</div>
						<div :class="$style.metricBody">
							<N8nLoading
								v-if="hostMetricsLoading"
								:loading="hostMetricsLoading"
								:rows="1"
								variant="p"
							/>
							<template v-else-if="hostMetrics">
								<div :class="$style.metricValue">{{ hostMetrics.storage.usagePercent }}%</div>
								<div :class="$style.progressBar">
									<div
										:class="$style.progressFill"
										:style="{
											width: `${hostMetrics.storage.usagePercent}%`,
											backgroundColor: getProgressColor(hostMetrics.storage.usagePercent),
										}"
									/>
								</div>
								<div :class="$style.metricDetails">
									<N8nText size="xsmall" color="text-light">
										{{ hostMetrics.storage.usedFormatted }} /
										{{ hostMetrics.storage.totalFormatted }}
									</N8nText>
									<N8nText size="xsmall" color="text-light">
										{{ hostMetrics.storage.availableFormatted }} free
									</N8nText>
								</div>
							</template>
						</div>
					</div>

					<!-- Network Card -->
					<div :class="$style.metricCard">
						<div :class="$style.metricHeader">
							<div :class="[$style.metricIconWrap, $style.iconNetwork]">
								<N8nIcon icon="wifi" size="medium" />
							</div>
							<div :class="$style.metricTitle">
								<N8nText bold size="small">Network</N8nText>
							</div>
						</div>
						<div :class="$style.metricBody">
							<N8nLoading
								v-if="hostMetricsLoading"
								:loading="hostMetricsLoading"
								:rows="1"
								variant="p"
							/>
							<template v-else-if="hostMetrics">
								<div :class="$style.networkStats">
									<div :class="$style.networkRow">
										<div :class="$style.networkDirection">
											<N8nIcon icon="arrow-down" size="small" :class="$style.downloadIcon" />
											<N8nText size="xsmall" color="text-light">Download</N8nText>
										</div>
										<div :class="$style.networkValue">
											<N8nText bold size="small">{{ networkRxRate }}</N8nText>
											<N8nText size="xsmall" color="text-light">
												Total: {{ hostMetrics.network.rxFormatted }}
											</N8nText>
										</div>
									</div>
									<div :class="$style.networkDivider" />
									<div :class="$style.networkRow">
										<div :class="$style.networkDirection">
											<N8nIcon icon="arrow-up" size="small" :class="$style.uploadIcon" />
											<N8nText size="xsmall" color="text-light">Upload</N8nText>
										</div>
										<div :class="$style.networkValue">
											<N8nText bold size="small">{{ networkTxRate }}</N8nText>
											<N8nText size="xsmall" color="text-light">
												Total: {{ hostMetrics.network.txFormatted }}
											</N8nText>
										</div>
									</div>
								</div>
							</template>
						</div>
					</div>
				</div>
			</section>

			<!-- Quick KPI Status Cards -->
			<section :class="$style.section">
				<div :class="$style.kpiGrid">
					<!-- Workflows Card -->
					<div
						:class="$style.kpiCard"
						role="button"
						tabindex="0"
						@click="navigateTo(VIEWS.WORKFLOWS)"
					>
						<div :class="$style.kpiCardTop">
							<div :class="[$style.kpiIconWrapper, $style.iconWorkflows]">
								<N8nIcon icon="git-branch" size="medium" />
							</div>
							<N8nText size="small" color="text-light" bold>
								{{ i18n.baseText('mainSidebar.workflows') }}
							</N8nText>
						</div>
						<div :class="$style.kpiValue">
							<N8nLoading v-if="loading" :loading="loading" :rows="1" variant="p" />
							<span v-else>{{ totalWorkflows }}</span>
						</div>
						<div :class="$style.kpiFooter">
							<N8nText size="xsmall" color="text-light">
								<span :class="$style.statusActive">{{ activeWorkflows }} active</span>
								• {{ inactiveWorkflows }} inactive
							</N8nText>
							<N8nIcon icon="arrow-right" size="small" :class="$style.arrowIcon" />
						</div>
					</div>

					<!-- Executions Card -->
					<div
						:class="$style.kpiCard"
						role="button"
						tabindex="0"
						@click="navigateTo(VIEWS.EXECUTIONS)"
					>
						<div :class="$style.kpiCardTop">
							<div :class="[$style.kpiIconWrapper, $style.iconExecutions]">
								<N8nIcon icon="history" size="medium" />
							</div>
							<N8nText size="small" color="text-light" bold>
								{{ i18n.baseText('mainSidebar.executions') }}
							</N8nText>
						</div>
						<div :class="$style.kpiValue">
							<N8nLoading v-if="insightsLoading" :loading="insightsLoading" :rows="1" variant="p" />
							<span v-else>{{ totalExecutionsCount.toLocaleString() }}</span>
						</div>
						<div :class="$style.kpiFooter">
							<N8nText size="xsmall" color="text-light">
								<span v-if="failedExecutionsCount > 0" :class="$style.statusFailed">
									{{ failedExecutionsCount }} failed ({{ failureRateValue }}%)
								</span>
								<span v-else :class="$style.statusActive">100% success rate</span>
							</N8nText>
							<N8nIcon icon="arrow-right" size="small" :class="$style.arrowIcon" />
						</div>
					</div>

					<!-- Credentials Card -->
					<div
						:class="$style.kpiCard"
						role="button"
						tabindex="0"
						@click="navigateTo(VIEWS.CREDENTIALS)"
					>
						<div :class="$style.kpiCardTop">
							<div :class="[$style.kpiIconWrapper, $style.iconCredentials]">
								<N8nIcon icon="key" size="medium" />
							</div>
							<N8nText size="small" color="text-light" bold>
								{{ i18n.baseText('mainSidebar.credentials') }}
							</N8nText>
						</div>
						<div :class="$style.kpiValue">
							<N8nLoading v-if="loading" :loading="loading" :rows="1" variant="p" />
							<span v-else>{{ totalCredentials }}</span>
						</div>
						<div :class="$style.kpiFooter">
							<N8nText size="xsmall" color="text-light"> Connected services </N8nText>
							<N8nIcon icon="arrow-right" size="small" :class="$style.arrowIcon" />
						</div>
					</div>

					<!-- Data Tables & Config Card -->
					<div
						:class="$style.kpiCard"
						role="button"
						tabindex="0"
						@click="navigateTo(DATA_TABLE_VIEW)"
					>
						<div :class="$style.kpiCardTop">
							<div :class="[$style.kpiIconWrapper, $style.iconData]">
								<N8nIcon icon="table" size="medium" />
							</div>
							<N8nText size="small" color="text-light" bold>
								{{ i18n.baseText('dataTable.dataTables') }}
							</N8nText>
						</div>
						<div :class="$style.kpiValue">
							<N8nLoading v-if="loading" :loading="loading" :rows="1" variant="p" />
							<span v-else>{{ totalDataTables }}</span>
						</div>
						<div :class="$style.kpiFooter">
							<N8nText size="xsmall" color="text-light">
								{{ totalVariables }} variables • MCP enabled
							</N8nText>
							<N8nIcon icon="arrow-right" size="small" :class="$style.arrowIcon" />
						</div>
					</div>
				</div>
			</section>

			<!-- 2-Column: Recent Workflows & Quick Actions -->
			<div :class="$style.twoColumnLayout">
				<!-- Recent Workflows -->
				<section :class="[$style.section, $style.recentSection]">
					<div :class="$style.sectionHeader">
						<N8nHeading bold tag="h3" size="medium"> Recent Workflows </N8nHeading>
						<N8nButton
							variant="subtle"
							size="small"
							data-test-id="view-all-workflows-btn"
							@click="navigateTo(VIEWS.WORKFLOWS)"
						>
							View all
							<N8nIcon icon="arrow-right" size="small" class="ml-3xs" />
						</N8nButton>
					</div>

					<div v-if="loading" :class="$style.workflowList">
						<N8nLoading :loading="loading" :rows="3" variant="p" />
					</div>

					<div v-else-if="recentWorkflows.length === 0" :class="$style.emptyWorkflows">
						<N8nIcon icon="git-branch" size="xlarge" color="text-light" class="mb-xs" />
						<N8nText bold size="medium" class="mb-2xs"> No workflows created yet </N8nText>
						<N8nText color="text-light" size="small" class="mb-s">
							Get started by creating your first automated workflow.
						</N8nText>
						<N8nButton size="small" icon="plus" @click="createNewWorkflow">
							{{ i18n.baseText('generic.create.workflow') }}
						</N8nButton>
					</div>

					<div v-else :class="$style.workflowList">
						<div
							v-for="workflow in recentWorkflows"
							:key="workflow.id"
							:class="$style.workflowRow"
							role="button"
							tabindex="0"
							@click="navigateTo(VIEWS.WORKFLOW, { workflowId: workflow.id })"
						>
							<div :class="$style.workflowMain">
								<div :class="$style.workflowTitleRow">
									<N8nText bold size="small" :class="$style.workflowName">
										{{ workflow.name }}
									</N8nText>
									<N8nTag
										:text="workflow.active ? 'Active' : 'Inactive'"
										size="sm"
										:class="$style.statusTag"
									/>
								</div>
								<N8nText color="text-light" size="xsmall">
									Updated {{ formatTimeAgo(String(workflow.updatedAt)) }}
								</N8nText>
							</div>
							<div :class="$style.workflowAction">
								<N8nButton variant="subtle" size="mini" icon="chevron-right" iconOnly />
							</div>
						</div>
					</div>
				</section>

				<!-- Quick Shortcuts -->
				<section :class="[$style.section, $style.shortcutsSection]">
					<div :class="$style.sectionHeader">
						<N8nHeading bold tag="h3" size="medium"> Quick Actions </N8nHeading>
					</div>

					<div :class="$style.shortcutsGrid">
						<!-- New Workflow -->
						<div :class="$style.shortcutCard" role="button" tabindex="0" @click="createNewWorkflow">
							<div :class="[$style.shortcutIcon, $style.iconWorkflows]">
								<N8nIcon icon="plus" size="medium" />
							</div>
							<div :class="$style.shortcutText">
								<N8nText bold size="small">Create Workflow</N8nText>
								<N8nText color="text-light" size="xsmall">
									Build an automation flow from scratch
								</N8nText>
							</div>
						</div>

						<!-- Connect Credential -->
						<div
							:class="$style.shortcutCard"
							role="button"
							tabindex="0"
							@click="createNewCredential"
						>
							<div :class="[$style.shortcutIcon, $style.iconCredentials]">
								<N8nIcon icon="key" size="medium" />
							</div>
							<div :class="$style.shortcutText">
								<N8nText bold size="small">Add Credential</N8nText>
								<N8nText color="text-light" size="xsmall"> Connect API accounts & auth </N8nText>
							</div>
						</div>

						<!-- Create Data Table -->
						<div
							:class="$style.shortcutCard"
							role="button"
							tabindex="0"
							@click="createNewDataTable"
						>
							<div :class="[$style.shortcutIcon, $style.iconData]">
								<N8nIcon icon="table" size="medium" />
							</div>
							<div :class="$style.shortcutText">
								<N8nText bold size="small">New Data Table</N8nText>
								<N8nText color="text-light" size="xsmall"> Store structured workflow data </N8nText>
							</div>
						</div>

						<!-- Community Packages -->
						<div
							:class="$style.shortcutCard"
							role="button"
							tabindex="0"
							@click="navigateTo(VIEWS.HOME_COMMUNITY_PACKAGES)"
						>
							<div :class="[$style.shortcutIcon, $style.iconPackages]">
								<N8nIcon icon="box" size="medium" />
							</div>
							<div :class="$style.shortcutText">
								<N8nText bold size="small">Community Packages</N8nText>
								<N8nText color="text-light" size="xsmall">
									Install nodes contributed by community
								</N8nText>
							</div>
						</div>

						<!-- MCP Config -->
						<div
							:class="$style.shortcutCard"
							role="button"
							tabindex="0"
							@click="navigateTo(VIEWS.HOME_MCP)"
						>
							<div :class="[$style.shortcutIcon, $style.iconMcp]">
								<N8nIcon icon="mcp" size="medium" />
							</div>
							<div :class="$style.shortcutText">
								<N8nText bold size="small">MCP Integration</N8nText>
								<N8nText color="text-light" size="xsmall">
									Connect AI assistants & IDE tools
								</N8nText>
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	</PageViewLayout>
</template>

<style lang="scss" module>
.overviewContainer {
	display: flex;
	flex-direction: column;
	gap: var(--spacing--xl);
	padding-bottom: var(--spacing--2xl);
	width: 100%;
}

.section {
	display: flex;
	flex-direction: column;
	gap: var(--spacing--xs);
}

.sectionHeader {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

/* Host Metrics Section */
.metricsGrid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: var(--spacing--md);

	@include mixins.breakpoint('md-and-down') {
		grid-template-columns: repeat(2, 1fr);
	}

	@include mixins.breakpoint('xs-only') {
		grid-template-columns: 1fr;
	}
}

.metricCard {
	display: flex;
	flex-direction: column;
	padding: var(--spacing--md);
	background-color: var(--color--background--light-2);
	border: var(--border);
	border-radius: var(--border-radius--base);
	transition:
		border-color 0.15s ease,
		box-shadow 0.15s ease;

	&:hover {
		border-color: var(--color--primary);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}
}

.metricHeader {
	display: flex;
	align-items: center;
	gap: var(--spacing--xs);
	margin-bottom: var(--spacing--sm);
}

.metricIconWrap {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 36px;
	height: 36px;
	border-radius: var(--border-radius--base);
	flex-shrink: 0;
}

.iconCpu {
	background-color: rgba(255, 110, 74, 0.12);
	color: var(--color--primary);
}

.iconMemory {
	background-color: rgba(0, 163, 136, 0.12);
	color: var(--color--success);
}

.iconStorage {
	background-color: rgba(142, 68, 173, 0.12);
	color: #8e44ad;
}

.iconNetwork {
	background-color: rgba(41, 128, 185, 0.12);
	color: #2980b9;
}

.metricTitle {
	display: flex;
	align-items: center;
	gap: var(--spacing--3xs);
}

.metricBody {
	display: flex;
	flex-direction: column;
	gap: var(--spacing--xs);
	flex: 1;
}

.metricValue {
	font-size: 28px;
	font-weight: var(--font-weight--bold);
	color: var(--color--text--shade-1);
	line-height: 1.1;
}

.progressBar {
	width: 100%;
	height: 6px;
	background-color: var(--color--background--light-3);
	border-radius: 3px;
	overflow: hidden;
}

.progressFill {
	height: 100%;
	border-radius: 3px;
	transition: width 0.5s ease;
}

.metricDetails {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.networkStats {
	display: flex;
	flex-direction: column;
	gap: var(--spacing--xs);
}

.networkRow {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.networkDirection {
	display: flex;
	align-items: center;
	gap: var(--spacing--4xs);
}

.networkValue {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
}

.downloadIcon {
	color: var(--color--success);
}

.uploadIcon {
	color: var(--color--primary);
}

.networkDivider {
	border-bottom: 1px dashed var(--color--background--light-3);
}

/* KPI Grid */
.kpiGrid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: var(--spacing--md);

	@include mixins.breakpoint('md-and-down') {
		grid-template-columns: repeat(2, 1fr);
	}

	@include mixins.breakpoint('xs-only') {
		grid-template-columns: 1fr;
	}
}

.kpiCard {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	padding: var(--spacing--md);
	background-color: var(--color--background--light-2);
	border: var(--border);
	border-radius: var(--border-radius--base);
	cursor: pointer;
	transition:
		border-color 0.15s ease,
		box-shadow 0.15s ease,
		transform 0.15s ease;
	min-height: 120px;

	&:hover {
		border-color: var(--color--primary);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		transform: translateY(-2px);

		.arrowIcon {
			color: var(--color--primary);
			transform: translateX(3px);
		}
	}
}

.kpiCardTop {
	display: flex;
	align-items: center;
	gap: var(--spacing--xs);
}

.kpiIconWrapper {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border-radius: var(--border-radius--base);
}

.iconWorkflows {
	background-color: rgba(255, 110, 74, 0.12);
	color: var(--color--primary);
}

.iconExecutions {
	background-color: rgba(0, 163, 136, 0.12);
	color: var(--color--success);
}

.iconCredentials {
	background-color: rgba(245, 166, 35, 0.12);
	color: #e08b00;
}

.iconData {
	background-color: rgba(142, 68, 173, 0.12);
	color: #8e44ad;
}

.iconPackages {
	background-color: rgba(41, 128, 185, 0.12);
	color: #2980b9;
}

.iconMcp {
	background-color: rgba(39, 174, 96, 0.12);
	color: #27ae60;
}

.kpiValue {
	font-size: 28px;
	font-weight: var(--font-weight--bold);
	color: var(--color--text--shade-1);
	margin: var(--spacing--3xs) 0;
	line-height: 1.2;
}

.kpiFooter {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.statusActive {
	color: var(--color--success);
	font-weight: var(--font-weight--bold);
}

.statusFailed {
	color: var(--color--danger);
	font-weight: var(--font-weight--bold);
}

.arrowIcon {
	color: var(--color--text--tint-2);
	transition:
		transform 0.15s ease,
		color 0.15s ease;
}

/* Two Column Layout */
.twoColumnLayout {
	display: grid;
	grid-template-columns: 3fr 2fr;
	gap: var(--spacing--xl);

	@include mixins.breakpoint('md-and-down') {
		grid-template-columns: 1fr;
	}
}

/* Recent Workflows */
.recentSection {
	background-color: var(--color--background--light-2);
	border: var(--border);
	border-radius: var(--border-radius--base);
	padding: var(--spacing--md);
}

.workflowList {
	display: flex;
	flex-direction: column;
	gap: var(--spacing--2xs);
}

.workflowRow {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: var(--spacing--xs) var(--spacing--sm);
	background-color: var(--color--background--light-1);
	border: var(--border);
	border-radius: var(--border-radius--base);
	cursor: pointer;
	transition:
		background-color 0.15s ease,
		border-color 0.15s ease;

	&:hover {
		background-color: var(--color--background--light-3);
		border-color: var(--color--primary);
	}
}

.workflowMain {
	display: flex;
	flex-direction: column;
	gap: var(--spacing--5xs);
	overflow: hidden;
}

.workflowTitleRow {
	display: flex;
	align-items: center;
	gap: var(--spacing--xs);
}

.workflowName {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	max-width: 320px;
}

.statusTag {
	padding: 0 var(--spacing--3xs);
}

.emptyWorkflows {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: var(--spacing--xl) var(--spacing--md);
	text-align: center;
}

/* Shortcuts */
.shortcutsSection {
	background-color: var(--color--background--light-2);
	border: var(--border);
	border-radius: var(--border-radius--base);
	padding: var(--spacing--md);
}

.shortcutsGrid {
	display: flex;
	flex-direction: column;
	gap: var(--spacing--2xs);
}

.shortcutCard {
	display: flex;
	align-items: center;
	gap: var(--spacing--sm);
	padding: var(--spacing--xs) var(--spacing--sm);
	background-color: var(--color--background--light-1);
	border: var(--border);
	border-radius: var(--border-radius--base);
	cursor: pointer;
	transition:
		background-color 0.15s ease,
		border-color 0.15s ease,
		transform 0.15s ease;

	&:hover {
		background-color: var(--color--background--light-3);
		border-color: var(--color--primary);
		transform: translateX(2px);
	}
}

.shortcutIcon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 32px;
	height: 32px;
	border-radius: var(--border-radius--base);
	flex-shrink: 0;
}

.shortcutText {
	display: flex;
	flex-direction: column;
	overflow: hidden;
}
</style>
