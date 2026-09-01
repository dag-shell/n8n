<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from '@n8n/i18n';
import { N8nButton, N8nTooltip } from '@n8n/design-system';
import type { TableOptions } from '@n8n/design-system';

import { useDocumentTitle } from '@/app/composables/useDocumentTitle';
import { useTelemetry } from '@n8n/composables/useTelemetry';
import { TELEMETRY_EVENT } from '@n8n/telemetry';
import { useToast } from '@n8n/composables/useToast';
import { useSettingsStore } from '@n8n/stores/settings.store';
import { useUIStore } from '@/app/stores/ui.store';
import { VIEWS } from '@/app/constants';
import type { Agent } from '@/features/agents/agent.types';
import { useMCPStore } from '@/features/ai/mcpAccess/mcp.store';
import {
	LOADING_INDICATOR_TIMEOUT,
	MCP_CONNECT_AGENTS_MODAL_KEY,
} from '@/features/ai/mcpAccess/mcp.constants';
import PageViewLayout from '@/app/components/layouts/PageViewLayout.vue';
import ProjectHeader from '@/features/collaboration/projects/components/ProjectHeader.vue';
import AgentsTable from '@/features/ai/mcpAccess/components/tabs/AgentsTable.vue';

const i18n = useI18n();
const toast = useToast();
const telemetry = useTelemetry();
const router = useRouter();
const documentTitle = useDocumentTitle();
const mcpStore = useMCPStore();
const settingsStore = useSettingsStore();
const uiStore = useUIStore();

const agentsLoading = ref(false);
const availableAgents = ref<Agent[]>([]);
const availableAgentsTotal = ref(0);
const agentsTableState = ref<TableOptions>({
	page: 0,
	itemsPerPage: 10,
	sortBy: [],
});
const agentsTableItemsPerPage = ref(agentsTableState.value.itemsPerPage);

const showConnectAgentsButton = computed(() => availableAgentsTotal.value > 0);

const showMcpAccessUpdatedToast = (count: number, enabled: boolean) => {
	toast.showMessage({
		type: 'success',
		title: i18n.baseText(
			enabled
				? 'settings.mcp.agents.enableAccess.success.title'
				: 'settings.mcp.agents.removeAccess.success.title',
			{
				adjustToNumber: count,
				interpolate: { count: String(count) },
			},
		),
	});
};

const fetchAvailableAgents = async () => {
	agentsLoading.value = true;
	try {
		const response = await mcpStore.fetchAgentsAvailableForMCPPage(
			agentsTableState.value.page + 1,
			agentsTableState.value.itemsPerPage,
		);
		if (response.page !== agentsTableState.value.page + 1) {
			agentsTableState.value = { ...agentsTableState.value, page: response.page - 1 };
		}
		availableAgents.value = response.data;
		availableAgentsTotal.value = response.count;
	} catch (error) {
		toast.showError(error, i18n.baseText('settings.mcp.agents.list.error.fetching'));
	} finally {
		setTimeout(() => {
			agentsLoading.value = false;
		}, LOADING_INDICATOR_TIMEOUT);
	}
};

const refreshAgentsFromFirstPage = async () => {
	agentsTableState.value = { ...agentsTableState.value, page: 0 };
	await fetchAvailableAgents();
};

const onAgentsTableUpdate = async (options: TableOptions) => {
	const pageSizeChanged = options.itemsPerPage !== agentsTableItemsPerPage.value;
	agentsTableState.value = { ...options, page: pageSizeChanged ? 0 : options.page };
	agentsTableItemsPerPage.value = options.itemsPerPage;
	await fetchAvailableAgents();
};

const onToggleAgentMCPAccess = async (agentId: string, isEnabled: boolean) => {
	try {
		await mcpStore.toggleAgentMcpAccess(agentId, isEnabled);
		if (isEnabled) {
			await refreshAgentsFromFirstPage();
		} else {
			showMcpAccessUpdatedToast(1, false);
			await fetchAvailableAgents();
		}
	} catch (error) {
		toast.showError(error, i18n.baseText('agents.toggleMCP.error.title'));
		throw error;
	}
};

const onBulkEnableAgentsMCPAccess = async (agentIds: string[]) => {
	try {
		const response = await mcpStore.toggleAgentsMcpAccess({ agentIds }, true);
		showMcpAccessUpdatedToast(response.updatedCount, true);
		await refreshAgentsFromFirstPage();
	} catch (error) {
		toast.showError(error, i18n.baseText('agents.toggleMCP.error.title'));
		throw error;
	}
};

const onBulkRemoveAgentsMCPAccess = async (agentIds: string[]) => {
	try {
		const response = await mcpStore.toggleAgentsMcpAccess({ agentIds }, false);
		showMcpAccessUpdatedToast(response.updatedCount, false);
		await fetchAvailableAgents();
	} catch (error) {
		toast.showError(error, i18n.baseText('agents.toggleMCP.error.title'));
	}
};

const openConnectAgentsModal = () => {
	uiStore.openModalWithData({
		name: MCP_CONNECT_AGENTS_MODAL_KEY,
		data: {
			onEnableMcpAccess: onBulkEnableAgentsMCPAccess,
		},
	});
	telemetry.track(TELEMETRY_EVENT.AGENTS.USER_CLICKED_CONNECT_AGENTS_FROM_MCP_SETTINGS, {});
};

const onBack = () => {
	void router.push({ name: VIEWS.HOME_MCP });
};

onMounted(async () => {
	documentTitle.set(i18n.baseText('settings.mcp.agentsExposed.page.title'));
	if (!mcpStore.mcpAccessEnabled || !settingsStore.isModuleActive('agents')) {
		await router.replace({ name: VIEWS.HOME_MCP });
		return;
	}
	await fetchAvailableAgents();
});
</script>

<template>
	<PageViewLayout>
		<template #header>
			<ProjectHeader>
				<template #actions>
					<div :class="$style.headerActions">
						<N8nButton
							v-if="showConnectAgentsButton"
							variant="solid"
							:label="i18n.baseText('settings.mcp.connectAgents')"
							data-test-id="mcp-connect-agents-header-button"
							size="medium"
							@click="openConnectAgentsModal"
						/>
						<N8nTooltip :content="i18n.baseText('settings.mcp.refresh.tooltip')">
							<N8nButton
								variant="subtle"
								icon-only
								data-test-id="mcp-agents-refresh-button"
								size="medium"
								icon="refresh-cw"
								@click="fetchAvailableAgents"
							/>
						</N8nTooltip>
					</div>
				</template>
			</ProjectHeader>
		</template>

		<div :class="$style.contentWrapper" data-test-id="mcp-agents-view">
			<div :class="$style.topBar">
				<N8nButton
					variant="subtle"
					icon="arrow-left"
					size="small"
					:label="i18n.baseText('settings.mcp.back')"
					@click="onBack"
				/>
			</div>
			<AgentsTable
				v-model:table-options="agentsTableState"
				:agents="availableAgents"
				:total-count="availableAgentsTotal"
				:loading="agentsLoading"
				@remove-mcp-access="(agent) => onToggleAgentMCPAccess(agent.id, false)"
				@bulk-remove-mcp-access="onBulkRemoveAgentsMCPAccess"
				@connect-agents="openConnectAgentsModal"
				@update:options="onAgentsTableUpdate"
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
