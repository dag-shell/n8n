import { computed } from 'vue';

import { EVALUATIONS_WIZARD_SIDEPANEL_EXPERIMENT } from '@/app/constants/experiments';
import { usePostHog } from '@/app/stores/posthog.store';
import { useSettingsStore } from '@n8n/stores/settings.store';
import { hasPermission } from '@/app/utils/rbac/permissions';

export function useEvaluationsWizardSidepanelExperiment() {
	const posthogStore = usePostHog();
	const settingsStore = useSettingsStore();

	// Operator override (`N8N_CONFIG_EVALS_ENABLED`) wins; otherwise the
	// `088_config_evaluations` PostHog flag remains the source of truth.
	const isFeatureEnabled = computed(
		() =>
			hasPermission(['instanceOwner']) &&
			(settingsStore.settings.evaluation?.configEvalsEnabled === true ||
				posthogStore.getVariant(EVALUATIONS_WIZARD_SIDEPANEL_EXPERIMENT.name) ===
					EVALUATIONS_WIZARD_SIDEPANEL_EXPERIMENT.variant),
	);

	return { isFeatureEnabled };
}
