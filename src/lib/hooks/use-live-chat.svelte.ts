// src/lib/hooks/use-live-chat.svelte.ts
type ChatMessage = { id: string; username: string; content: string };
type RawChatMessage = { viewerId: string; content: string };

const WS_BASE = 'ws://localhost:8081';

function labelFor(viewerId: string) {
	return viewerId;
}

export function useLiveChat(streamId: string, viewerId: string) {
	let messages = $state<ChatMessage[]>([]);
	let connected = $state(false);
	let ws: WebSocket | null = null;
	let reconnectTimeout: ReturnType<typeof setTimeout>;
	let heartbeatInterval: ReturnType<typeof setInterval>;

	// async function loadHistory() {
	// 	const res = await fetch(`${API_BASE}/telemetry/${streamId}/chat`);
	// 	if (!res.ok) return;
	// 	const data = await res.json();
	// 	messages = (data.messages as RawChatMessage[]).map((m, i) => ({
	// 		id: `history-${i}`,
	// 		username: labelFor(m.viewerId),
	// 		content: m.content
	// 	}));
	// }

	function connect() {
		ws = new WebSocket(`${WS_BASE}/ws/telemetry`);

		ws.onopen = () => {
			connected = true;
			sendRaw({ type: 'heartbeat', streamId, viewerId });
			heartbeatInterval = setInterval(() => sendRaw({ type: 'heartbeat', streamId, viewerId }), 10000);
		};

		ws.onmessage = (event) => {
			const msg = JSON.parse(event.data);
			if (msg.type !== 'chat') return;
			messages.push({
				id: crypto.randomUUID(),
				username: labelFor(msg.viewerId),
				content: msg.content
			});
		};

		ws.onclose = () => {
			connected = false;
			clearInterval(heartbeatInterval);
			reconnectTimeout = setTimeout(connect, 2000);
		};

		ws.onerror = () => ws?.close();
	}

	function sendRaw(payload: unknown) {
		if (ws?.readyState !== WebSocket.OPEN) return;
		ws.send(JSON.stringify(payload));
	}

	function send(content: string) {
		sendRaw({ type: 'chat', streamId, viewerId, content });
	}

	function disconnect() {
		clearTimeout(reconnectTimeout);
		clearInterval(heartbeatInterval);
		ws?.close();
		ws = null;
	}

    	function setHistory(history: RawChatMessage[]) {
		messages = history.map((m, i) => ({
			id: `history-${i}`,
			username: labelFor(m.viewerId),
			content: m.content
		}));
	}

	return {
		get messages() {
			return messages;
		},
		get connected() {
			return connected;
		},
		// loadHistory,
		connect,
		disconnect,
		send,
        setHistory,
	};
}