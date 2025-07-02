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
    color?: string;
}

export interface ActivityNote {
    id?: number;
    activity_id: number;
    user_id: string;
    content: string;
    is_internal: boolean;
    created_at?: string;
    updated_at?: string;
    users?: User;
}

export interface EmailData {
    to: string[];
    cc?: string[];
    bcc?: string[];
    subject: string;
    body: string;
    activity_id: number;
    user_id?: string;
}

export interface ContactEmail {
    id?: number;
    user_id: string;
    name: string;
    email: string;
    category: string;
    notes?: string;
    is_favorite: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CreateContactEmailData {
    name: string;
    email: string;
    category: string;
    notes?: string;
    is_favorite?: boolean;
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