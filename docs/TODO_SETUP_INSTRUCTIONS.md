# Todo List Database Setup Instructions

Panduan lengkap untuk setup database Todo List di Supabase.

## Prerequisites

- Akun Supabase yang sudah dibuat
- Akses ke Supabase SQL Editor
- Project Supabase sudah dikonfigurasi

## Setup Steps

### 1. Jalankan SQL Script

1. Buka Supabase Dashboard
2. Pilih project Anda
3. Buka **SQL Editor** dari menu sidebar
4. Copy seluruh isi file `TODO_DATABASE_SETUP.sql`
5. Paste ke SQL Editor
6. Klik **Run** untuk menjalankan script

### 2. Verifikasi Tables

Setelah script berhasil dijalankan, pastikan tables berikut sudah dibuat:

- `todos` - Table untuk menyimpan todo items
- `checklist_items` - Table untuk menyimpan checklist items

### 3. Verifikasi RLS Policies

Pastikan Row Level Security (RLS) sudah diaktifkan dan policies sudah dibuat:

**Todos Table:**
- Users can view their own todos
- Users can insert their own todos
- Users can update their own todos
- Users can delete their own todos

**Checklist Items Table:**
- Users can view checklist items from their todos
- Users can insert checklist items to their todos
- Users can update checklist items from their todos
- Users can delete checklist items from their todos

### 4. Verifikasi Indexes

Pastikan indexes berikut sudah dibuat untuk performa yang optimal:

**Todos Table:**
- `idx_todos_user_id` - Index untuk user_id
- `idx_todos_parent_id` - Index untuk parent_id (nested subtasks)
- `idx_todos_completed` - Index untuk completed status
- `idx_todos_priority` - Index untuk priority
- `idx_todos_due_date` - Index untuk due_date
- `idx_todos_created_at` - Index untuk created_at
- `idx_todos_order_index` - Index untuk order_index

**Checklist Items Table:**
- `idx_checklist_items_todo_id` - Index untuk todo_id
- `idx_checklist_items_completed` - Index untuk completed status
- `idx_checklist_items_order_index` - Index untuk order_index

### 5. Verifikasi Functions

Pastikan functions berikut sudah dibuat:

- `update_updated_at_column()` - Function untuk auto-update updated_at timestamp
- `get_todo_with_subtasks(UUID)` - Function untuk mendapatkan todo dengan semua nested subtasks
- `delete_todo_cascade(UUID)` - Function untuk delete todo dan semua nested subtasks

### 6. Verifikasi Triggers

Pastikan triggers berikut sudah dibuat:

- `trigger_update_todos_updated_at` - Trigger untuk auto-update updated_at pada todos
- `trigger_update_checklist_items_updated_at` - Trigger untuk auto-update updated_at pada checklist_items

### 7. Verifikasi Views

Pastikan views berikut sudah dibuat:

- `todos_with_checklist_count` - View untuk todos dengan count checklist items
- `todos_with_subtask_count` - View untuk todos dengan count subtasks

## Database Schema

### Todos Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, auto-generated |
| user_id | UUID | Foreign key ke auth.users |
| title | VARCHAR(255) | Judul todo (required) |
| description | TEXT | Deskripsi todo (optional) |
| completed | BOOLEAN | Status completion (default: false) |
| due_date | TIMESTAMP WITH TIME ZONE | Tanggal deadline (optional) |
| priority | VARCHAR(10) | Priority: 'low', 'medium', 'high' (default: 'medium') |
| tags | TEXT[] | Array of tags (optional) |
| parent_id | UUID | Foreign key ke todos.id untuk nested subtasks (optional) |
| order_index | INTEGER | Index untuk drag and drop ordering (default: 0) |
| color | VARCHAR(7) | Hex color code (optional) |
| created_at | TIMESTAMP WITH TIME ZONE | Timestamp creation (auto) |
| updated_at | TIMESTAMP WITH TIME ZONE | Timestamp update (auto) |

### Checklist Items Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, auto-generated |
| todo_id | UUID | Foreign key ke todos.id |
| text | VARCHAR(500) | Text checklist item (required) |
| completed | BOOLEAN | Status completion (default: false) |
| note | TEXT | Optional note untuk checklist item |
| order_index | INTEGER | Index untuk ordering (default: 0) |
| created_at | TIMESTAMP WITH TIME ZONE | Timestamp creation (auto) |
| updated_at | TIMESTAMP WITH TIME ZONE | Timestamp update (auto) |

## Features

### 1. Nested Subtasks

Todo items dapat memiliki subtasks yang tidak terbatas levelnya menggunakan `parent_id`:

```sql
-- Get todo dengan semua nested subtasks
SELECT * FROM get_todo_with_subtasks('todo-uuid-here');
```

### 2. Checklist Items

Setiap todo dapat memiliki multiple checklist items:

```sql
-- Get checklist items untuk todo tertentu
SELECT * FROM checklist_items WHERE todo_id = 'todo-uuid-here' ORDER BY order_index;
```

### 3. Drag and Drop Ordering

Ordering menggunakan `order_index` untuk drag and drop:

```sql
-- Update order_index untuk reordering
UPDATE todos SET order_index = 1 WHERE id = 'todo-uuid-here';
```

### 4. Auto-update Timestamps

`updated_at` secara otomatis di-update setiap kali record di-update melalui trigger.

### 5. Cascade Delete

Ketika todo dihapus, semua checklist items dan nested subtasks akan otomatis terhapus karena CASCADE.

## Usage Examples

### Create Todo

```sql
INSERT INTO todos (user_id, title, description, priority, due_date, tags)
VALUES (
    auth.uid(),
    'Complete project documentation',
    'Write comprehensive documentation',
    'high',
    NOW() + INTERVAL '7 days',
    ARRAY['work', 'documentation']
) RETURNING *;
```

### Create Subtask

```sql
INSERT INTO todos (user_id, title, parent_id, priority, order_index)
VALUES (
    auth.uid(),
    'Write introduction section',
    'parent-todo-uuid-here',
    'medium',
    0
) RETURNING *;
```

### Create Checklist Item

```sql
INSERT INTO checklist_items (todo_id, text, order_index)
VALUES (
    'todo-uuid-here',
    'Review code changes',
    0
) RETURNING *;
```

### Update Checklist Item with Note

```sql
UPDATE checklist_items
SET completed = true, note = 'Completed with some notes'
WHERE id = 'checklist-item-uuid-here';
```

### Get Todos with Checklist Count

```sql
SELECT * FROM todos_with_checklist_count
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
```

### Get Todos with Subtask Count

```sql
SELECT * FROM todos_with_subtask_count
WHERE user_id = auth.uid()
ORDER BY created_at DESC;
```

### Delete Todo and All Nested Subtasks

```sql
SELECT delete_todo_cascade('todo-uuid-here');
```

## Integration with Frontend

Setelah database setup selesai, Anda perlu membuat service functions untuk berinteraksi dengan Supabase:

1. **Create Todo Service** - `utils/supabase/todoService.ts`
   - Functions untuk CRUD operations
   - Functions untuk nested subtasks
   - Functions untuk checklist items

2. **Update Components** - Update todo components untuk menggunakan Supabase service instead of localStorage

3. **Migration from localStorage** - Buat migration script untuk memindahkan data dari localStorage ke Supabase

## Troubleshooting

### Error: "permission denied for table todos"

**Solution:** Pastikan RLS policies sudah dibuat dengan benar dan user sudah authenticated.

### Error: "foreign key constraint violation"

**Solution:** Pastikan `user_id` mengacu ke user yang valid di `auth.users` table.

### Error: "function does not exist"

**Solution:** Pastikan semua functions sudah dibuat dengan benar. Jalankan ulang SQL script.

### Performance Issues

**Solution:** Pastikan semua indexes sudah dibuat. Gunakan `EXPLAIN ANALYZE` untuk melihat query plan.

## Next Steps

1. Buat service functions untuk berinteraksi dengan Supabase
2. Update frontend components untuk menggunakan Supabase
3. Buat migration script dari localStorage ke Supabase
4. Test semua CRUD operations
5. Test nested subtasks functionality
6. Test checklist items functionality
7. Test drag and drop ordering

## Support

Jika ada masalah atau pertanyaan, silakan buat issue di repository atau hubungi tim development.

