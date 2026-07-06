<script lang="ts">
import { setUser } from '$lib/features/auth/store';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();

	$effect(() => {
		setUser(data.user);
	});
</script>

{@render children()}