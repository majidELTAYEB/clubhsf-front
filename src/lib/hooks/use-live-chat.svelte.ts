// type ChatMessage = { id: string; viewerId: string; content: string };
// type RawChatMessage = { viewerId: string; content: string };

// const WS_BASE = 'ws://localhost:8080';

// export function useLiveChat(streamId: string, token: string) {
// 	let messages = $state<ChatMessage[]>([]);
// 	let connected = $state(false);
// 	let ws: WebSocket | null = null;
// 	let reconnectTimeout: ReturnType<typeof setTimeout>;
// 	let heartbeatInterval: ReturnType<typeof setInterval>;

// 	function connect() {
// 		ws = new WebSocket(`${WS_BASE}/ws/telemetry?token=${encodeURIComponent(token)}`);

// 		ws.onopen = () => {
// 			connected = true;
// 			sendRaw({ type: 'heartbeat', streamId });
// 			heartbeatInterval = setInterval(() => sendRaw({ type: 'heartbeat', streamId }), 10000);
// 		};

// 		ws.onmessage = (event) => {
// 			const msg = JSON.parse(event.data);
// 			console.log(msg)
// 			if (msg.type !== 'chat') return;
// 			messages.push({
// 				id: crypto.randomUUID(),
// 				viewerId: msg.viewerId,
// 				content: msg.content
// 			});
// 		};

// 		ws.onclose = () => {
// 			connected = false;
// 			clearInterval(heartbeatInterval);
// 			reconnectTimeout = setTimeout(connect, 2000);
// 		};

// 		ws.onerror = () => ws?.close();
// 	}

// 	function sendRaw(payload: unknown) {
// 		if (ws?.readyState !== WebSocket.OPEN) return;
// 		ws.send(JSON.stringify(payload));
// 	}

// 	function send(content: string) {
// 		sendRaw({ type: 'chat', streamId, content });
// 	}

// 	function disconnect() {
// 		clearTimeout(reconnectTimeout);
// 		clearInterval(heartbeatInterval);
// 		ws?.close();
// 		ws = null;
// 	}

// 	function setHistory(history: RawChatMessage[]) {
// 		messages = history.map((m, i) => ({
// 			id: `history-${i}`,
// 			viewerId: m.viewerId,
// 			content: m.content
// 		}));
// 	}

// 	return {
// 		get messages() {
// 			return messages;
// 		},
// 		get connected() {
// 			return connected;
// 		},
// 		connect,
// 		disconnect,
// 		send,
// 		setHistory
// 	};
// }

type ChatMessage = { id: string; viewerId: string; content: string };
type RawChatMessage = { viewerId: string; content: string };

const WS_HOST = import.meta.env.VITE_WS_HOST as string; // ex: 'api.tondomaine.com'

function getWsUrl(token: string): string {
	const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
	return `${protocol}://${WS_HOST}/ws/telemetry?token=${encodeURIComponent(token)}`;
}

export function useLiveChat(streamId: string, token: string) {
	let messages = $state<ChatMessage[]>([]);
	let connected = $state(false);
	let ws: WebSocket | null = null;
	let reconnectTimeout: ReturnType<typeof setTimeout>;
	let heartbeatInterval: ReturnType<typeof setInterval>;
	let shouldReconnect = true;

	function connect() {
		// évite d'ouvrir une deuxième socket si déjà connecté/en cours de connexion
		if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
			return;
		}

		shouldReconnect = true;
		ws = new WebSocket(getWsUrl(token));

		ws.onopen = () => {
			connected = true;
			sendRaw({ type: 'heartbeat', streamId });
			heartbeatInterval = setInterval(() => sendRaw({ type: 'heartbeat', streamId }), 10000);
		};

		ws.onmessage = (event) => {
			try {
				const msg = JSON.parse(event.data);
				if (msg.type !== 'chat') return;
				messages.push({
					id: crypto.randomUUID(),
					viewerId: msg.viewerId,
					content: msg.content
				});
			} catch (err) {
				console.error('Erreur de parsing WebSocket :', err);
			}
		};

		ws.onclose = () => {
			connected = false;
			clearInterval(heartbeatInterval);
			if (shouldReconnect) {
				reconnectTimeout = setTimeout(connect, 2000);
			}
		};

		ws.onerror = () => {
			ws?.close();
		};
	}

	function sendRaw(payload: unknown) {
		if (ws?.readyState !== WebSocket.OPEN) return;
		ws.send(JSON.stringify(payload));
	}

	function send(content: string) {
		sendRaw({ type: 'chat', streamId, content });
	}

	function disconnect() {
		shouldReconnect = false;
		clearTimeout(reconnectTimeout);
		clearInterval(heartbeatInterval);
		ws?.close();
		ws = null;
		connected = false;
	}

	function setHistory(history: RawChatMessage[]) {
		messages = history.map((m, i) => ({
			id: `history-${i}`,
			viewerId: m.viewerId,
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
		connect,
		disconnect,
		send,
		setHistory
	};
}