export interface Activity {
    id?: number;
    title: string;
    description: string;
    status: string;
    user_id: string;
    company_id?: number;
    created_at?: string;
    updated_at?: string;
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
    title: string; // Primary key
    sub_title: string;
    description?: string;
    color: string; // Bootstrap color name (primary, secondary, success, info, warning, danger)
    level: number;
    created_at?: string;
    updated_at?: string;
}

export interface CreateActivityPriorityData {
    title: string;
    sub_title: string;
    description?: string;
    color: string; // Bootstrap color name (primary, secondary, success, info, warning, danger)
    level: number;
}
export interface ActivityStatus {
    title: string; // Primary key
    sub_title: string;
    description?: string;
    level: number;
    is_active: boolean;
    color: string; // Bootstrap color name (primary, secondary, success, info, warning, danger)
    created_at?: string;
    updated_at?: string;
}

export interface CreateActivityStatusData {
    title: string;
    sub_title: string;
    description?: string;
    level: number;
    is_active: boolean;
    color: string; // Bootstrap color name (primary, secondary, success, info, warning, danger)
}

export interface ActivityNote {
    id?: number;
    activity_id: number;
    user_id: string | null;
    content: string;
    email: string | null;
    email_uid: string | null;
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
    company_id?: number;
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