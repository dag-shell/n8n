<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '@n8n/i18n';
import { N8nButton, N8nTooltip } from '@n8n/design-system';
import type { TableOptions } from '@n8n/design-system';

import { useDocumentTitle } from '@/app/composables/useDocumentTitle';
import { useTelemetry } from '@n8n/composables/useTelemetry';
import { useToast } from '@n8n/composables/useToast';
import { useUIStore } from '@/app/stores/ui.store';
import { VIEWS, WORKFLOW_DESCRIPTION_MODAL_KEY } from '@/app/constants';
import type { WorkflowListItem } from '@/Interface';
import { useMCPStore } from '@/features/ai/mcpAccess/mcp.store';
import {
	LOADING_INDICATOR_TIMEOUT,
	MCP_CONNECT_WORKFLOWS_MODAL_KEY,
} from '@/features/ai/mcpAccess/mcp.constants';
import PageViewLayout from '@/app/components/layouts/PageViewLayout.vue';
import ProjectHeader from '@/features/collaboration/projects/components/ProjectHeader.vue';
import WorkflowsTable from '@/features/ai/mcpAccess/components/tabs/WorkflowsTable.vue';

const i18n = useI18n();
const toast = useToast();
const telemetry = useTelemetry();
const router = useRouter();
const documentTitle = useDocumentTitle();
const mcpStore = useMCPStore();
const uiStore = useUIStore();

const workflowsLoading = ref(false);
const availableWorkflows = ref<WorkflowListItem[]>([]);
const availableWorkflowsTotal = ref(0);
const workflowsTableState = ref<TableOptions>({
	page: 0,
	itemsPerPage: 10,
	sortBy: [],
});
const workflowsTableItemsPerPage = ref(workflowsTableState.value.itemsPerPage);

const showConnectWorkflowsButton = computed(() => availableWorkflowsTotal.value > 0);

const showMcpAccessUpdatedToast = (count: number, enabled: boolean) => {
	toast.showMessage({
		type: 'success',
		title: i18n.baseText(
			enabled
				? 'settings.mcp.workflows.enableAccess.success.title'
				: 'settings.mcp.workflows.removeAccess.success.title',
			{
				adjustToNumber: count,
				interpolate: { count: String(count) },
			},
		),
	});
};

const fetchAvailableWorkflows = async () => {
	workflowsLoading.value = true;
	try {
		const response = await mcpStore.fetchWorkflowsAvailableForMCPPage(
			workflowsTableState.value.page + 1,
			workflowsTableState.value.itemsPerPage,
		);
		if (response.page !== workflowsTableState.value.page + 1) {
			workflowsTableState.value = { ...workflowsTableState.value, page: response.page - 1 };
		}
		availableWorkflows.value = response.data;
		availableWorkflowsTotal.value = response.count;
	} catch (error) {
		toast.showError(error, i18n.baseText('workflows.list.error.fetching'));
	} finally {
		setTimeout(() => {
			workflowsLoading.value = false;
		}, LOADING_INDICATOR_TIMEOUT);
	}
};

const refreshWorkflowsFromFirstPage = async () => {
	workflowsTableState.value = { ...workflowsTableState.value, page: 0 };
	await fetchAvailableWorkflows();
};

const onWorkflowsTableUpdate = async (options: TableOptions) => {
	const pageSizeChanged = options.itemsPerPage !== workflowsTableItemsPerPage.value;
	workflowsTableState.value = { ...options, page: pageSizeChanged ? 0 : options.page };
	workflowsTableItemsPerPage.value = options.itemsPerPage;
	await fetchAvailableWorkflows();
};

const onToggleWorkflowMCPAccess = async (workflowId: string, isEnabled: boolean) => {
	try {
		await mcpStore.toggleWorkflowMcpAccess(workflowId, isEnabled);
		if (isEnabled) {
			await refreshWorkflowsFromFirstPage();
		} else {
			showMcpAccessUpdatedToast(1, false);
			await fetchAvailableWorkflows();
		}
	} catch (error) {
		toast.showError(error, i18n.baseText('workflowSettings.toggleMCP.error.title'));
		throw error;
	}
};

const onBulkEnableWorkflowsMCPAccess = async (workflowIds: string[]) => {
	try {
		const response = await mcpStore.toggleWorkflowsMcpAccess({ workflowIds }, true);
		showMcpAccessUpdatedToast(response.updatedCount, true);
		await refreshWorkflowsFromFirstPage();
	} catch (error) {
		toast.showError(error, i18n.baseText('workflowSettings.toggleMCP.error.title'));
		throw error;
	}
};

const onBulkRemoveWorkflowsMCPAccess = async (workflowIds: string[]) => {
	try {
		const response = await mcpStore.toggleWorkflowsMcpAccess({ workflowIds }, false);
		showMcpAccessUpdatedToast(response.updatedCount, false);
		await fetchAvailableWorkflows();
	} catch (error) {
		toast.showError(error, i18n.baseText('workflowSettings.toggleMCP.error.title'));
	}
};

const onUpdateDescription = (workflow: WorkflowListItem) => {
	uiStore.openModalWithData({
		name: WORKFLOW_DESCRIPTION_MODAL_KEY,
		data: {
			workflowId: workflow.id,
			workflowName: workflow.name,
			workflowDescription: workflow.description ?? '',
			onSave: (updatedDescription: string | null) => {
				const index = availableWorkflows.value.findIndex((w) => w.id === workflow.id);
				if (index !== -1) {
					availableWorkflows.value[index] = {
						...availableWorkflows.value[index],
						description: updatedDescription ?? undefined,
					};
				}
			},
		},
	});
};

const openConnectWorkflowsModal = () => {
	uiStore.openModalWithData({
		name: MCP_CONNECT_WORKFLOWS_MODAL_KEY,
		data: {
			onEnableMcpAccess: onBulkEnableWorkflowsMCPAccess,
		},
	});
	telemetry.track('User clicked connect workflows from mcp settings');
};

const onBack = () => {
	void router.push({ name: VIEWS.HOME_MCP });
};

onMounted(async () => {
	documentTitle.set(i18n.baseText('settings.mcp.workflowsExposed.page.title'));
	if (!mcpStore.mcpAccessEnabled) {
		await router.replace({ name: VIEWS.HOME_MCP });
		return;
	}
	await fetchAvailableWorkflows();
});
</script>

<template>
	<PageViewLayout>
		<template #header>
			<ProjectHeader>
				<template #actions>
					<div :class="$style.headerActions">
						<N8nButton
							v-if="showConnectWorkflowsButton"
							variant="solid"
							:label="i18n.baseText('settings.mcp.connectWorkflows')"
							data-test-id="mcp-connect-workflows-header-button"
							size="medium"
							@click="openConnectWorkflowsModal"
						/>
						<N8nTooltip :content="i18n.baseText('settings.mcp.refresh.tooltip')">
							<N8nButton
								variant="subtle"
								iconOnly
								data-test-id="mcp-workflows-refresh-button"
								size="medium"
								icon="refresh-cw"
								@click="fetchAvailableWorkflows"
							/>
						</N8nTooltip>
					</div>
				</template>
			</ProjectHeader>
		</template>

		<div :class="$style.contentWrapper" data-test-id="mcp-workflows-view">
			<div :class="$style.topBar">
				<N8nButton
					variant="subtle"
					icon="arrow-left"
					size="small"
					:label="i18n.baseText('settings.mcp.back')"
					@click="onBack"
				/>
			</div>
			<WorkflowsTable
				v-model:table-options="workflowsTableState"
				:workflows="availableWorkflows"
				:total-count="availableWorkflowsTotal"
				:loading="workflowsLoading"
				@remove-mcp-access="(workflow) => onToggleWorkflowMCPAccess(workflow.id, false)"
				@bulk-remove-mcp-access="onBulkRemoveWorkflowsMCPAccess"
				@connect-workflows="openConnectWorkflowsModal"
				@update-description="onUpdateDescription"
				@update:options="onWorkflowsTableUpdate"
				@refresh="fetchAvailableWorkflows"
			/>
		</div>
	</PageViewLayout>
</template>

<style lang="scss" module>
.contentWrapper {
	display: flex;
	flex-direction: column;
	gap: var(--spacing--md);
	padding-top: var(--spacing--md);
	width: 100%;
}

.topBar {
	display: flex;
	align-items: center;
}

.headerActions {
	display: flex;
	align-items: center;
	gap: var(--spacing--2xs);
}
</style>
