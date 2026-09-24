export interface ParticipantResponse {
	id: string;
	username: string;
	avatar_url?: string;
}

export interface MessageResponse {
	id: string;
	conversation_id: string;
	sender_id: string;
	content: string;
	created_at: string;
}

export interface ConversationResponse {
	id: string;
	is_group: boolean;
	title?: string;
	created_at: string;
}

export interface ConversationSummaryResponse {
	id: string;
	is_group: boolean;
	title?: string;
	last_message?: MessageResponse;
	has_unread: boolean;
	participant?: ParticipantResponse;
}

export interface MessagePageResponse {
	messages: MessageResponse[];
	next_cursor?: string;
	read_receipts: Record<string, string>;
}

export interface ConversationPageResponse {
	conversations: ConversationSummaryResponse[];
	next_cursor?: string;
}

export interface SendMessageRequest {
	content: string;
}

export interface CreateConversationRequest {
	participant_id: string;
}

// --- WebSocket (/ws/messaging) ---

export interface WSOutgoingPayload {
	conversation_id: string;
	content: string;
}

// 'read' ajouté : événement poussé quand l'autre participant marque la
// conversation comme lue, nécessaire pour mettre à jour les coches en direct.
export type WSEventType = 'ack' | 'error' | 'message' | 'read';

export interface WSEvent {
	type: WSEventType;
	id?: string;
	conversation_id?: string;
	sender_id?: string;
	content?: string;
	created_at?: string;
	// spécifique à "read"
	user_id?: string;
	read_at?: string;
}

export type ConnectionStatus = 'connecting' | 'open' | 'closed';
