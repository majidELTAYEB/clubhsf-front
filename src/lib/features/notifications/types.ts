export type NotificationType =
	| 'new_post'
	| 'new_article'
	| 'new_video'
	| 'live_scheduled'
	| 'live_starting_soon'
	| 'post_liked'
	| 'post_commented'
	| 'collection_published'
	| 'item_added_to_collection';

export type AppNotification = {
	id: string;
	type: NotificationType;
	title: string;
	body?: string;
	link?: string;
	read: boolean;
	created_at: string;
};

export type ListNotificationsResponse = {
	notifications: AppNotification[];
	next_cursor?: string;
	unread_count: number;
};