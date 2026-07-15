<script lang="ts">
	import Calendar from "$lib/components/ui/calendar/calendar.svelte";
	import * as Popover from "$lib/components/ui/popover/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { Label } from "$lib/components/ui/label/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
	import {
		getLocalTimeZone,
		CalendarDate,
        today,
		type DateValue
	} from "@internationalized/date";

	let {
		value = $bindable(),
		id: idProp
	}: { value?: Date; id?: string } = $props();

	const autoId = $props.id();
	const id = idProp ?? autoId;

	let open = $state(false);

	// Dérive la date du calendrier depuis `value`
	let calendarValue = $state<DateValue | undefined>(
		value
			? new CalendarDate(value.getFullYear(), value.getMonth() + 1, value.getDate())
			: undefined
	);

	// Dérive l'heure au format "HH:mm:ss" depuis `value`
	let timeValue = $state(
		value
			? value.toTimeString().slice(0, 8)
			: "10:30:00"
	);

    const minDate = today(getLocalTimeZone());

	function syncValue() {
		if (!calendarValue) {
			value = undefined;
			return;
		}
		const [hours, minutes, seconds] = timeValue.split(":").map(Number);
		const date = calendarValue.toDate(getLocalTimeZone());
		date.setHours(hours, minutes, seconds ?? 0);
		value = date;
	}
</script>

<div class="flex gap-4">
	<div class="flex flex-col gap-3">
		<Label for="{id}-date" class="px-1">Date</Label>
		<Popover.Root bind:open>
			<Popover.Trigger id="{id}-date">
				{#snippet child({ props })}
					<Button {...props} variant="outline" class="w-32 justify-between font-normal">
						{calendarValue
							? calendarValue.toDate(getLocalTimeZone()).toLocaleDateString()
							: "Choisir"}
						<ChevronDownIcon />
					</Button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content class="w-auto overflow-hidden p-0" align="start">
				<Calendar
                    minValue={minDate}
					type="single"
					bind:value={calendarValue}
					onValueChange={() => {
						open = false;
						syncValue();
					}}
					captionLayout="dropdown"
				/>
			</Popover.Content>
		</Popover.Root>
	</div>
	<div class="flex flex-col gap-3">
		<Label for="{id}-time" class="px-1">Heure</Label>
		<Input
			type="time"
			id="{id}-time"
			step="1"
			bind:value={timeValue}
			oninput={syncValue}
			class="bg-transparent appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
		/>
	</div>
</div>