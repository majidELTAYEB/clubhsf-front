// import { env } from '$env/dynamic/public';

// type ChatMessage = { id: string; viewerId: string; content: string };
// type RawChatMessage = { viewerId: string; content: string };

// function getWsUrl(token: string): string {
// 	const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
// 	const apiHost = new URL(env.PUBLIC_API_BASE_URL).host;
// 	return `${protocol}://${apiHost}/ws/telemetry?token=${encodeURIComponent(token)}`;
// }


// export function useLiveChat(streamId: string, token: string) {
// 	let messages = $state<ChatMessage[]>([]);
// 	let connected = $state(false);
// 	let ws: WebSocket | null = null;
// 	let reconnectTimeout: ReturnType<typeof setTimeout>;
// 	let heartbeatInterval: ReturnType<typeof setInterval>;
// 	let shouldReconnect = true;

// 	function connect() {
// 		// évite d'ouvrir une deuxième socket si déjà connecté/en cours de connexion
// 		if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
// 			return;
// 		}

// 		shouldReconnect = true;
// 		ws = new WebSocket(getWsUrl(token));

// 		ws.onopen = () => {
// 			connected = true;
// 			sendRaw({ type: 'heartbeat', streamId });
// 			heartbeatInterval = setInterval(() => sendRaw({ type: 'heartbeat', streamId }), 10000);
// 		};

// 		ws.onmessage = (event) => {
// 			try {
// 				const msg = JSON.parse(event.data);
// 				if (msg.type !== 'chat') return;
// 				messages.push({
// 					id: crypto.randomUUID(),
// 					viewerId: msg.viewerId,
// 					content: msg.content
// 				});
// 			} catch (err) {
// 				console.error('Erreur de parsing WebSocket :', err);
// 			}
// 		};

// 		ws.onclose = () => {
// 			connected = false;
// 			clearInterval(heartbeatInterval);
// 			if (shouldReconnect) {
// 				reconnectTimeout = setTimeout(connect, 2000);
// 			}
// 		};

// 		ws.onerror = () => {
// 			ws?.close();
// 		};
// 	}

// 	function sendRaw(payload: unknown) {
// 		if (ws?.readyState !== WebSocket.OPEN) return;
// 		ws.send(JSON.stringify(payload));
// 	}

// 	function send(content: string) {
// 		sendRaw({ type: 'chat', streamId, content });
// 	}

// 	function disconnect() {
// 		shouldReconnect = false;
// 		clearTimeout(reconnectTimeout);
// 		clearInterval(heartbeatInterval);
// 		ws?.close();
// 		ws = null;
// 		connected = false;
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


import { env } from '$env/dynamic/public';

type ChatMessage = { id: string; viewerId: string; content: string };
type RawChatMessage = { viewerId: string; content: string };
type TokenProvider = () => Promise<string>;

function getWsUrl(token: string): string {
	const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
	const apiHost = new URL(env.PUBLIC_API_BASE_URL).host;
	return `${protocol}://${apiHost}/ws/telemetry?token=${encodeURIComponent(token)}`;
}

// tokenProvider doit retourner un token FRAIS à chaque appel (ex: via
// GET /api/ws-token, à usage unique et courte durée) — jamais un token
// capturé une seule fois, sinon la reconnexion automatique échoue
// systématiquement après la première coupure réseau.
export function useLiveChat(streamId: string, tokenProvider: TokenProvider) {
	let messages = $state<ChatMessage[]>([]);
	let connected = $state(false);
	let ws: WebSocket | null = null;
	let reconnectTimeout: ReturnType<typeof setTimeout>;
	let heartbeatInterval: ReturnType<typeof setInterval>;
	let shouldReconnect = true;
	let connecting = false;

	async function connect() {
		// évite d'ouvrir une deuxième socket si déjà connecté/en cours de connexion
		if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
			return;
		}
		if (connecting) return;

		shouldReconnect = true;
		connecting = true;

		let token: string;
		try {
			token = await tokenProvider();
		} catch (err) {
			console.error('Impossible de récupérer un token WS :', err);
			connecting = false;
			if (shouldReconnect) {
				reconnectTimeout = setTimeout(connect, 2000);
			}
			return;
		}

		// shouldReconnect a pu passer à false pendant l'attente réseau du token
		if (!shouldReconnect) {
			connecting = false;
			return;
		}

		ws = new WebSocket(getWsUrl(token));

		ws.onopen = () => {
			connecting = false;
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
			connecting = false;
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
		connecting = false;
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