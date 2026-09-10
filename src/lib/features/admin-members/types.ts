export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing";

export type Subscription = {
    stripe_customer_id: string;
    status: SubscriptionStatus;
    current_period_start: string; // ISO 8601
    current_period_end: string;   // ISO 8601
    cancel_at_period_end: boolean;
    canceled_at: string | null;   // ISO 8601
    ended_at: string | null;      // ISO 8601
};

export type MemberRole = "user" | "admin";

export type Member = {
    id: string;
    email: string;
    full_name: string;
    role: MemberRole;
    created_at: string; // ISO 8601
    subscription: Subscription | null;
};

export type MembersResponse = {
    members: Member[];
    total: number;
    limit: number;
    offset: number;
};