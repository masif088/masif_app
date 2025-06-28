export interface Activity {
    id?: number;
    title: string;
    description: string;
    status: string;
    user_id: string;
    created_at?: string;
    updated_at?: string;
    due_date: string;
    priority: string;
    type: string;
    tags: string;
    note: string;
    link: string;
    activity_start: string;
    activity_end: string;
    column_index?: number;
}

export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    avatar?: string;
}

export interface ActivityPriority {
    title: string;
    color: string;
    description?: string;
}
export interface ActivityStatus {
    title: string;
    sub_title: string;
    description?: string;
    level?: number;
    is_active?: boolean;
}

export interface ActivityType {
    id: number;
    title: string;
    description?: string;
}

export interface CreateActivityFormData {
    title: string;
    description: string;
    status: string;
    user_id: string;
    due_date: string;
    priority: string;
    type: string;
    tags: string;
    note: string;
    link: string;
    activity_start: string;
    activity_end: string;
}

export interface ActivityFilters {
    status?: string;
    priority?: string;
    user_id?: string;
    tags?: string[];
    date_from?: string;
    date_to?: string;
}

export interface ActivityStats {
    total: number;
    open: number;
    inProgress: number;
    testing: number;
    done: number;
    others: number;
} 