<script setup lang="ts"></script>

<template>
	<div :class="$style.wrapper" data-test-id="node-view-loader">
		<div :class="$style.spinner">
			<svg :class="$style.spinnerSvg" viewBox="0 0 50 50">
				<circle cx="25" cy="25" r="20" fill="none" class="track" stroke-width="4" />
				<circle
					cx="25"
					cy="25"
					r="20"
					fill="none"
					class="arc"
					stroke-width="4"
					stroke-linecap="round"
				/>
			</svg>
		</div>
	</div>
</template>

<style lang="scss" module>
.wrapper {
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	position: absolute;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: var(--color--background--light-2);
}

.spinner {
	margin: 0 auto;
	display: flex;
	align-items: center;
	justify-content: center;
}

.spinnerSvg {
	width: 72px;
	height: 72px;
	animation: spin 1s linear infinite;

	:global(.track) {
		stroke: var(--color--foreground--tint-2, rgba(255, 255, 255, 0.15));
	}

	:global(.arc) {
		stroke: var(--color--primary, #ff6d5a);
		stroke-dasharray: 80;
		stroke-dashoffset: 60;
	}
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}
</style>
