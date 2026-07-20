<script lang="ts" module>
	import LifeBuoyIcon from "@lucide/svelte/icons/life-buoy";
	import SendIcon from "@lucide/svelte/icons/send";
	import Settings2Icon from "@lucide/svelte/icons/settings-2";
	import Tv from "@lucide/svelte/icons/tv";
	import Clapperboard from "@lucide/svelte/icons/clapperboard";
	import Videotape from "@lucide/svelte/icons/videotape";

	const data = {
		user: {
			name: "shadcn",
			email: "m@example.com",
			avatar: "/avatars/shadcn.jpg",
		},
		navMain: [
			{
				title: "Masterclass",
				url: "#",
				icon: Clapperboard,
				isActive: true,
				// items: [
				// 	{
				// 		title: "History",
				// 		url: "#",
				// 	},
				// 	{
				// 		title: "Starred",
				// 		url: "#",
				// 	},
				// 	{
				// 		title: "Settings",
				// 		url: "#",
				// 	},
				// ],
			},
			{
				title: "Live",
				url: "/lives",
				icon: Tv,
				isActive: true,
			},
			{
				title: "Replay Live",
				url: "#",
				icon: Videotape,
				isActive: true,
			},
			{
				title: "Settings",
				url: "#",
				icon: Settings2Icon,
				// items: [
				// 	{
				// 		title: "General",
				// 		url: "#",
				// 	},
				// 	{
				// 		title: "Team",
				// 		url: "#",
				// 	},
				// 	{
				// 		title: "Billing",
				// 		url: "#",
				// 	},
				// 	{
				// 		title: "Limits",
				// 		url: "#",
				// 	},
				// ],
			},
		],
		navSecondary: [
			{
				title: "Support",
				url: "#",
				icon: LifeBuoyIcon,
			},
			{
				title: "Feedback",
				url: "#",
				icon: SendIcon,
			},
		],
		admin: [
			{
				name: "Configuration Live",
				url: "/admin/lives",
				icon: Tv,
			},
			{
				name: "Configuration Collections",
				url: "/admin/collections",
				icon: Tv,
			},
		],
	};
</script>

<script lang="ts">
	import NavMain from "./nav-main.svelte";
	import NavProjects from "./nav-projects.svelte";
	import NavSecondary from "./nav-secondary.svelte";
	import NavUser from "./nav-user.svelte";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import CommandIcon from "@lucide/svelte/icons/command";
	import type { ComponentProps } from "svelte";

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root bind:ref variant="floating" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="##" {...props}>
							<div
								class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"
							>
								<CommandIcon class="size-4" />
							</div>
							<div class="grid flex-1 text-start text-sm leading-tight">
								<span class="truncate font-medium">Hacker son futur</span>
								<span class="truncate text-xs">Franck Lahoui</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={data.navMain} />
		<NavProjects projects={data.admin} />
		<NavSecondary items={data.navSecondary} class="mt-auto" />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser user={data.user} />
	</Sidebar.Footer>
</Sidebar.Root>
