<script lang="ts" setup>
import { nextTick, computed } from 'vue';
import { useI18n } from '@n8n/i18n';
import { useRouter } from 'vue-router';
import { VIEWS } from '@/app/constants';
import { type IMenuItem, N8nResizeWrapper, N8nIcon, N8nText, N8nTooltip } from '@n8n/design-system';
import { useSettingsItems } from '@/app/composables/useSettingsItems';
import { useKeybindings } from '@/app/composables/useKeybindings';
import {
	MAX_SIDEBAR_WIDTH,
	MIN_SIDEBAR_WIDTH,
	useSidebarLayout,
} from '@/app/composables/useSidebarLayout';
import { N8nScrollArea } from '@n8n/design-system';
import BottomMenu from '@/app/components/BottomMenu.vue';
import MainSidebarHeader from '@/app/components/MainSidebarHeader.vue';
import ChatSidebarContent from '@/features/ai/chatHub/components/ChatSidebarContent.vue';
import { hasPermission } from '@/app/utils/rbac/permissions';

const i18n = useI18n();
const router = useRouter();

const {
	isCollapsed,
	isResizing,
	sidebarWidth,
	onResizeStart,
	onResize,
	onResizeEnd,
	toggleCollapse,
} = useSidebarLayout();

function openCommandBar(event: MouseEvent) {
	event.stopPropagation();

	void nextTick(() => {
		const keyboardEvent = new KeyboardEvent('keydown', {
			key: 'k',
			code: 'KeyK',
			metaKey: true,
			bubbles: true,
			cancelable: true,
		});
		document.dispatchEvent(keyboardEvent);
	});
}

function onReturn() {
	void router.push({ name: VIEWS.HOME_OVERVIEW });
}

const { settingsItems, handleSettingsItemSelect } = useSettingsItems();

const mainMenuItems = computed<IMenuItem[]>(() => [
	{
		id: 'settings',
		label: i18n.baseText('mainSidebar.settings'),
		icon: 'settings',
		available: hasPermission(['instanceOwner']),
		children: settingsItems.value,
	},
]);

const visibleMenuItems = computed<IMenuItem[]>(() =>
	mainMenuItems.value.filter((item) => item.available !== false),
);

useKeybindings({
	['bracketleft']: () => toggleCollapse(),
});

const onLogout = () => {
	void router.push({ name: VIEWS.SIGNOUT });
};
</script>

<template>
	<N8nResizeWrapper
		id="side-menu"
		:class="{
			[$style.sideMenu]: true,
			[$style.sideMenuCollapsed]: isCollapsed,
			[$style.sideMenuResizing]: isResizing,
		}"
		:width="sidebarWidth"
		:style="isCollapsed ? {} : { width: `${sidebarWidth}px` }"
		:supported-directions="['right']"
		:min-width="MIN_SIDEBAR_WIDTH"
		:max-width="MAX_SIDEBAR_WIDTH"
		:grid-size="8"
		@resizestart="onResizeStart"
		@resize="onResize"
		@resizeend="onResizeEnd"
	>
		<MainSidebarHeader
			hide-create
			:is-collapsed="isCollapsed"
			@collapse="toggleCollapse"
			@open-command-bar="openCommandBar"
		/>
		<div
			:class="[$style.returnButton, { [$style.returnButtonCollapsed]: isCollapsed }]"
			data-test-id="chat-sidebar-back"
			@click="onReturn"
		>
			<N8nTooltip
				:disabled="!isCollapsed"
				placement="right"
				:content="i18n.baseText('generic.back') || 'Back'"
			>
				<div :class="$style.returnContent">
					<N8nIcon icon="arrow-left" size="medium" />
					<N8nText v-if="!isCollapsed" bold size="small">
						{{ i18n.baseText('generic.back') || 'Back' }}
					</N8nText>
				</div>
			</N8nTooltip>
		</div>
		<N8nScrollArea as-child>
			<div :class="$style.scrollArea">
				<ChatSidebarContent :is-collapsed="isCollapsed" />
				<BottomMenu
					v-if="visibleMenuItems.length > 0"
					:items="visibleMenuItems"
					:is-collapsed="isCollapsed"
					@select="handleSettingsItemSelect"
					@logout="onLogout"
				/>
			</div>
		</N8nScrollArea>
	</N8nResizeWrapper>
</template>

<style lang="scss" module>
.sideMenu {
	position: relative;
	height: 100%;
	display: flex;
	flex-direction: column;
	border-right: var(--border);
	background-color: var(--menu--color--background, var(--color--background--light-2));
	transition: width var(--duration--snappy) var(--easing--ease-out);
	will-change: width;

	&.sideMenuCollapsed {
		width: $sidebar-width;
		min-width: auto;
	}

	&.sideMenuResizing {
		transition: none;
	}
}

.returnButton {
	padding: var(--spacing--2xs) var(--spacing--xs);
	cursor: pointer;
	display: flex;
	align-items: center;
	border-bottom: var(--border);
	color: var(--color--text--base);
	transition:
		color 0.15s ease,
		background-color 0.15s ease;

	&:hover {
		color: var(--color--primary);
		background-color: var(--color--background--light-1);
	}

	&.returnButtonCollapsed {
		padding: var(--spacing--xs);
		justify-content: center;
	}
}

.returnContent {
	display: flex;
	align-items: center;
	gap: var(--spacing--3xs);
}

.scrollArea {
	height: 100%;
	display: flex;
	flex-direction: column;
}
</style>
