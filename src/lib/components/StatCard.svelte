<script lang="ts">
	import type { ClassValue } from 'svelte/elements';

	interface Props {
		title: string;
		icon?: string;
		accent?: string;
		class?: ClassValue;
		children?: import('svelte').Snippet;
	}

	let { title, icon = '', accent = '#22d3ee', class: className, children }: Props = $props();
</script>

<section
	class={['rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm', className]}
>
	<header class="mb-4 flex items-center gap-2">
		{#if icon}
			<span
				class="flex h-7 w-7 items-center justify-center rounded-lg text-base"
				style="background: {accent}1a; color: {accent}; box-shadow: 0 0 12px {accent}33 inset;"
			>
				{icon}
			</span>
		{/if}
		<h2 class="text-sm font-semibold tracking-widest text-white/70 uppercase">{title}</h2>
	</header>
	{@render children?.()}
</section>
