# Finova Fitness - Complete Database Schema Documentation

This document contains the complete database schema extracted from the actual connected PostgreSQL database.

## Database Overview
- **Database Type**: PostgreSQL (Neon)
- **Total Tables**: 90
- **Extraction Date**: 2025-08-23T22:07:56.629Z

## Table Structure

### booking_reviews

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('booking_reviews_id_seq'::regclass) |  |
| booking_id | INTEGER | YES | NULL |  |
| user_id | INTEGER | YES | NULL |  |
| rating | INTEGER | YES | NULL |  |
| review_text | TEXT | YES | NULL |  |
| is_reviewed | BOOLEAN | YES | false |  |
| reviewed_at | TIMESTAMP WITHOUT TIME ZONE | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **booking_reviews_rating_check**: CHECK on rating
- **booking_reviews_booking_id_fkey**: FOREIGN KEY on id
- **booking_reviews_user_id_fkey**: FOREIGN KEY on id
- **booking_reviews_pkey**: PRIMARY KEY on id
- **booking_reviews_booking_id_key**: UNIQUE on booking_id

#### Foreign Keys

- **booking_id** → **bookings.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **user_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **booking_reviews_booking_id_key**: CREATE UNIQUE INDEX booking_reviews_booking_id_key ON public.booking_reviews USING btree (booking_id)
- **booking_reviews_pkey**: CREATE UNIQUE INDEX booking_reviews_pkey ON public.booking_reviews USING btree (id)
- **idx_booking_reviews_booking_id**: CREATE INDEX idx_booking_reviews_booking_id ON public.booking_reviews USING btree (booking_id)
- **idx_booking_reviews_user_id**: CREATE INDEX idx_booking_reviews_user_id ON public.booking_reviews USING btree (user_id)

---

### bookings

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('bookings_id_seq'::regclass) |  |
| user_id | INTEGER | YES | NULL |  |
| class_id | INTEGER | YES | NULL |  |
| trainer_id | INTEGER | YES | NULL |  |
| booking_date | DATE | NO | NULL |  |
| start_time | TIME WITHOUT TIME ZONE | NO | NULL |  |
| end_time | TIME WITHOUT TIME ZONE | NO | NULL |  |
| status | VARCHAR(20) | YES | 'confirmed'::character varying |  |
| booking_type | VARCHAR(20) | YES | NULL |  |
| notes | TEXT | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **bookings_booking_type_check**: CHECK on booking_type
- **bookings_status_check**: CHECK on status
- **bookings_class_id_fkey**: FOREIGN KEY on id
- **bookings_trainer_id_fkey**: FOREIGN KEY on id
- **bookings_user_id_fkey**: FOREIGN KEY on id
- **bookings_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **class_id** → **classes.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **trainer_id** → **trainers.id** (ON DELETE: NO ACTION, ON UPDATE: NO ACTION)
- **user_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **bookings_pkey**: CREATE UNIQUE INDEX bookings_pkey ON public.bookings USING btree (id)
- **idx_bookings_class_id**: CREATE INDEX idx_bookings_class_id ON public.bookings USING btree (class_id)
- **idx_bookings_date**: CREATE INDEX idx_bookings_date ON public.bookings USING btree (booking_date)
- **idx_bookings_user_id**: CREATE INDEX idx_bookings_user_id ON public.bookings USING btree (user_id)

---

### cancellation_policies

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('cancellation_policies_id_seq'::regclass) |  |
| facility_id | INTEGER | YES | NULL |  |
| cancellation_hours | INTEGER | YES | 24 |  |
| refund_percentage | DECIMAL(5, 2) | YES | 100.00 |  |
| is_active | BOOLEAN | YES | true |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **cancellation_policies_facility_id_fkey**: FOREIGN KEY on id
- **cancellation_policies_pkey**: PRIMARY KEY on id
- **cancellation_policies_facility_id_key**: UNIQUE on facility_id

#### Foreign Keys

- **facility_id** → **facilities.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **cancellation_policies_facility_id_key**: CREATE UNIQUE INDEX cancellation_policies_facility_id_key ON public.cancellation_policies USING btree (facility_id)
- **cancellation_policies_pkey**: CREATE UNIQUE INDEX cancellation_policies_pkey ON public.cancellation_policies USING btree (id)

---

### chat_messages

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('chat_messages_id_seq'::regclass) |  |
| diet_plan_request_id | INTEGER | YES | NULL | Reference to the diet plan request this chat belongs to |
| sender_id | INTEGER | YES | NULL | ID of the user who sent the message |
| sender_type | VARCHAR(20) | NO | NULL | Type of sender (member or nutritionist) |
| message | TEXT | NO | NULL | Text content of the message |
| message_type | VARCHAR(20) | YES | 'text'::character varying | Type of message (text, diet_plan, diet_plan_pdf, file) |
| file_url | VARCHAR(500) | YES | NULL | URL to the attached file (if any) |
| is_read | BOOLEAN | YES | false | Whether the message has been read by the recipient |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP | Timestamp when the message was created |

#### Constraints

- **chat_messages_message_type_check**: CHECK on message_type
- **chat_messages_sender_type_check**: CHECK on sender_type
- **chat_messages_diet_plan_request_id_fkey**: FOREIGN KEY on id
- **chat_messages_sender_id_fkey**: FOREIGN KEY on id
- **chat_messages_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **diet_plan_request_id** → **diet_plan_requests.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **sender_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **chat_messages_pkey**: CREATE UNIQUE INDEX chat_messages_pkey ON public.chat_messages USING btree (id)
- **idx_chat_messages_created_at**: CREATE INDEX idx_chat_messages_created_at ON public.chat_messages USING btree (created_at)
- **idx_chat_messages_request_id**: CREATE INDEX idx_chat_messages_request_id ON public.chat_messages USING btree (diet_plan_request_id)
- **idx_chat_messages_sender_id**: CREATE INDEX idx_chat_messages_sender_id ON public.chat_messages USING btree (sender_id)
- **idx_chat_messages_unread**: CREATE INDEX idx_chat_messages_unread ON public.chat_messages USING btree (diet_plan_request_id, is_read) WHERE (is_read = false)

---

### class_revenue

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('class_revenue_id_seq'::regclass) |  |
| revenue_id | INTEGER | YES | NULL |  |
| class_id | INTEGER | YES | NULL |  |
| class_name | VARCHAR(255) | YES | NULL |  |
| class_category | VARCHAR(100) | YES | NULL |  |
| attendees_count | INTEGER | YES | NULL |  |
| price_per_person | DECIMAL(10, 2) | YES | NULL |  |
| total_capacity | INTEGER | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **class_revenue_pkey**: PRIMARY KEY on id

#### Indexes

- **class_revenue_pkey**: CREATE UNIQUE INDEX class_revenue_pkey ON public.class_revenue USING btree (id)
- **idx_class_revenue_revenue_id**: CREATE INDEX idx_class_revenue_revenue_id ON public.class_revenue USING btree (revenue_id)

---

### class_schedules

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('class_schedules_id_seq'::regclass) |  |
| class_id | INTEGER | YES | NULL |  |
| day_of_week | INTEGER | NO | NULL |  |
| start_time | TIME WITHOUT TIME ZONE | NO | NULL |  |
| end_time | TIME WITHOUT TIME ZONE | NO | NULL |  |
| is_recurring | BOOLEAN | YES | true |  |
| start_date | DATE | YES | NULL |  |
| end_date | DATE | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **class_schedules_day_of_week_check**: CHECK on day_of_week
- **class_schedules_class_id_fkey**: FOREIGN KEY on id
- **class_schedules_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **class_id** → **classes.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **class_schedules_pkey**: CREATE UNIQUE INDEX class_schedules_pkey ON public.class_schedules USING btree (id)

---

### classes

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('classes_id_seq'::regclass) |  |
| name | VARCHAR(255) | NO | NULL |  |
| description | TEXT | YES | NULL |  |
| category | VARCHAR(100) | NO | NULL |  |
| duration_minutes | INTEGER | NO | NULL |  |
| max_capacity | INTEGER | YES | NULL |  |
| current_capacity | INTEGER | YES | 0 |  |
| trainer_id | INTEGER | YES | NULL |  |
| room | VARCHAR(100) | YES | NULL |  |
| equipment_needed | ARRAY | YES | NULL |  |
| difficulty_level | VARCHAR(20) | YES | NULL |  |
| is_active | BOOLEAN | YES | true |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **classes_difficulty_level_check**: CHECK on difficulty_level
- **classes_trainer_id_fkey**: FOREIGN KEY on id
- **classes_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **trainer_id** → **trainers.id** (ON DELETE: NO ACTION, ON UPDATE: NO ACTION)

#### Indexes

- **classes_pkey**: CREATE UNIQUE INDEX classes_pkey ON public.classes USING btree (id)
- **idx_classes_category**: CREATE INDEX idx_classes_category ON public.classes USING btree (category)

---

### client_progress

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('client_progress_id_seq'::regclass) |  |
| client_id | INTEGER | YES | NULL |  |
| trainer_id | INTEGER | YES | NULL |  |
| progress_date | DATE | NO | NULL |  |
| weight | DECIMAL(5, 2) | YES | NULL |  |
| body_fat_percentage | DECIMAL(4, 2) | YES | NULL |  |
| muscle_mass | DECIMAL(5, 2) | YES | NULL |  |
| measurements | JSONB | YES | NULL |  |
| fitness_level | VARCHAR(20) | YES | NULL |  |
| strength_metrics | JSONB | YES | NULL |  |
| cardio_metrics | JSONB | YES | NULL |  |
| flexibility_score | INTEGER | YES | NULL |  |
| progress_photos | ARRAY | YES | NULL |  |
| goals_achieved | ARRAY | YES | NULL |  |
| current_goals | ARRAY | YES | NULL |  |
| trainer_assessment | TEXT | YES | NULL |  |
| next_milestones | TEXT | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **client_progress_fitness_level_check**: CHECK on fitness_level
- **client_progress_flexibility_score_check**: CHECK on flexibility_score
- **client_progress_client_id_fkey**: FOREIGN KEY on id
- **client_progress_trainer_id_fkey**: FOREIGN KEY on id
- **client_progress_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **client_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **trainer_id** → **trainers.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **client_progress_pkey**: CREATE UNIQUE INDEX client_progress_pkey ON public.client_progress USING btree (id)
- **idx_client_progress_client_id**: CREATE INDEX idx_client_progress_client_id ON public.client_progress USING btree (client_id)
- **idx_client_progress_date**: CREATE INDEX idx_client_progress_date ON public.client_progress USING btree (progress_date)
- **idx_client_progress_trainer_id**: CREATE INDEX idx_client_progress_trainer_id ON public.client_progress USING btree (trainer_id)

---

### client_trainer_subscriptions

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('client_trainer_subscriptions_id_seq'::regclass) |  |
| client_id | INTEGER | YES | NULL |  |
| trainer_id | INTEGER | YES | NULL |  |
| subscription_type | VARCHAR(50) | NO | NULL |  |
| plan_name | VARCHAR(255) | NO | NULL |  |
| sessions_per_week | INTEGER | YES | NULL |  |
| sessions_per_month | INTEGER | YES | NULL |  |
| price_per_session | DECIMAL(10, 2) | YES | NULL |  |
| monthly_fee | DECIMAL(10, 2) | YES | NULL |  |
| start_date | DATE | NO | NULL |  |
| end_date | DATE | YES | NULL |  |
| auto_renew | BOOLEAN | YES | false |  |
| status | VARCHAR(20) | YES | 'active'::character varying |  |
| remaining_sessions | INTEGER | YES | 0 |  |
| total_sessions_included | INTEGER | YES | 0 |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **client_trainer_subscriptions_status_check**: CHECK on status
- **client_trainer_subscriptions_client_id_fkey**: FOREIGN KEY on id
- **client_trainer_subscriptions_trainer_id_fkey**: FOREIGN KEY on id
- **client_trainer_subscriptions_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **client_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **trainer_id** → **trainers.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **client_trainer_subscriptions_pkey**: CREATE UNIQUE INDEX client_trainer_subscriptions_pkey ON public.client_trainer_subscriptions USING btree (id)
- **idx_client_trainer_subs_client_id**: CREATE INDEX idx_client_trainer_subs_client_id ON public.client_trainer_subscriptions USING btree (client_id)
- **idx_client_trainer_subs_status**: CREATE INDEX idx_client_trainer_subs_status ON public.client_trainer_subscriptions USING btree (status)
- **idx_client_trainer_subs_trainer_id**: CREATE INDEX idx_client_trainer_subs_trainer_id ON public.client_trainer_subscriptions USING btree (trainer_id)

---

### comprehensive_diet_plans

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('comprehensive_diet_plans_id_seq'::regclass) |  |
| nutritionist_id | INTEGER | NO | NULL |  |
| diet_plan_request_id | INTEGER | NO | NULL |  |
| client_id | INTEGER | NO | NULL |  |
| plan_name | VARCHAR(255) | NO | NULL |  |
| description | TEXT | YES | NULL |  |
| total_weeks | INTEGER | YES | 4 |  |
| overall_goals | JSONB | YES | NULL | JSON object containing target calories, protein, carbs, fats, fiber, sodium, sugar |
| dietary_guidelines | JSONB | YES | NULL | JSON array of dietary guidelines and restrictions |
| shopping_list | JSONB | YES | NULL | JSON array of shopping list items |
| preparation_tips | JSONB | YES | NULL | JSON array of meal preparation tips |
| weekly_plans | JSONB | YES | NULL | JSON object containing weekly meal plans with detailed food items |
| status | VARCHAR(50) | YES | 'active'::character varying |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **comprehensive_diet_plans_client_id_fkey**: FOREIGN KEY on id
- **comprehensive_diet_plans_diet_plan_request_id_fkey**: FOREIGN KEY on id
- **comprehensive_diet_plans_nutritionist_id_fkey**: FOREIGN KEY on id
- **comprehensive_diet_plans_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **client_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **diet_plan_request_id** → **diet_plan_requests.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **nutritionist_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **comprehensive_diet_plans_pkey**: CREATE UNIQUE INDEX comprehensive_diet_plans_pkey ON public.comprehensive_diet_plans USING btree (id)
- **idx_comprehensive_diet_plans_client_id**: CREATE INDEX idx_comprehensive_diet_plans_client_id ON public.comprehensive_diet_plans USING btree (client_id)
- **idx_comprehensive_diet_plans_created_at**: CREATE INDEX idx_comprehensive_diet_plans_created_at ON public.comprehensive_diet_plans USING btree (created_at)
- **idx_comprehensive_diet_plans_nutritionist_id**: CREATE INDEX idx_comprehensive_diet_plans_nutritionist_id ON public.comprehensive_diet_plans USING btree (nutritionist_id)
- **idx_comprehensive_diet_plans_request_id**: CREATE INDEX idx_comprehensive_diet_plans_request_id ON public.comprehensive_diet_plans USING btree (diet_plan_request_id)
- **idx_comprehensive_diet_plans_status**: CREATE INDEX idx_comprehensive_diet_plans_status ON public.comprehensive_diet_plans USING btree (status)

---

### daily_revenue_summary

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('daily_revenue_summary_id_seq'::regclass) |  |
| summary_date | DATE | NO | NULL |  |
| total_revenue | DECIMAL(12, 2) | YES | 0.00 |  |
| total_transactions | INTEGER | YES | 0 |  |
| membership_revenue | DECIMAL(12, 2) | YES | 0.00 |  |
| training_revenue | DECIMAL(12, 2) | YES | 0.00 |  |
| class_revenue | DECIMAL(12, 2) | YES | 0.00 |  |
| other_revenue | DECIMAL(12, 2) | YES | 0.00 |  |
| total_tax | DECIMAL(12, 2) | YES | 0.00 |  |
| net_revenue | DECIMAL(12, 2) | YES | 0.00 |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **daily_revenue_summary_pkey**: PRIMARY KEY on id
- **daily_revenue_summary_summary_date_key**: UNIQUE on summary_date

#### Indexes

- **daily_revenue_summary_pkey**: CREATE UNIQUE INDEX daily_revenue_summary_pkey ON public.daily_revenue_summary USING btree (id)
- **daily_revenue_summary_summary_date_key**: CREATE UNIQUE INDEX daily_revenue_summary_summary_date_key ON public.daily_revenue_summary USING btree (summary_date)
- **idx_daily_revenue_summary_date**: CREATE INDEX idx_daily_revenue_summary_date ON public.daily_revenue_summary USING btree (summary_date)

---

### deleted_users

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('deleted_users_id_seq'::regclass) |  |
| original_id | INTEGER | NO | NULL |  |
| email | VARCHAR(255) | NO | NULL |  |
| first_name | VARCHAR(100) | NO | NULL |  |
| last_name | VARCHAR(100) | NO | NULL |  |
| role | VARCHAR(50) | NO | NULL |  |
| phone | VARCHAR(20) | YES | NULL |  |
| date_of_birth | DATE | YES | NULL |  |
| gender | VARCHAR(10) | YES | NULL |  |
| address | TEXT | YES | NULL |  |
| emergency_contact | TEXT | YES | NULL |  |
| membership_type | VARCHAR(50) | YES | NULL |  |
| membership_start_date | DATE | YES | NULL |  |
| deleted_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| deleted_by_admin_id | INTEGER | YES | NULL |  |

#### Constraints

- **fk_deleted_by_admin**: FOREIGN KEY on id
- **deleted_users_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **deleted_by_admin_id** → **users.id** (ON DELETE: NO ACTION, ON UPDATE: NO ACTION)

#### Indexes

- **deleted_users_pkey**: CREATE UNIQUE INDEX deleted_users_pkey ON public.deleted_users USING btree (id)
- **idx_deleted_users_deleted_at**: CREATE INDEX idx_deleted_users_deleted_at ON public.deleted_users USING btree (deleted_at)
- **idx_deleted_users_original_id**: CREATE INDEX idx_deleted_users_original_id ON public.deleted_users USING btree (original_id)
- **idx_deleted_users_role**: CREATE INDEX idx_deleted_users_role ON public.deleted_users USING btree (role)

---

### diet_plan_requests

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('diet_plan_requests_id_seq'::regclass) |  |
| user_id | INTEGER | YES | NULL |  |
| nutritionist_id | INTEGER | YES | NULL |  |
| fitness_goal | VARCHAR(100) | NO | NULL |  |
| current_weight | DECIMAL(5, 2) | NO | NULL |  |
| target_weight | DECIMAL(5, 2) | NO | NULL |  |
| monthly_budget | DECIMAL(10, 2) | NO | NULL |  |
| dietary_restrictions | TEXT | YES | NULL |  |
| additional_notes | TEXT | YES | NULL |  |
| status | VARCHAR(20) | YES | 'pending'::character varying |  |
| nutritionist_notes | TEXT | YES | NULL |  |
| meal_plan | TEXT | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| height | DECIMAL(5, 2) | NO | NULL |  |
| activity_level | VARCHAR(50) | NO | NULL |  |
| preparation_time | VARCHAR(100) | YES | NULL |  |
| diet_plan_completed | BOOLEAN | YES | false | Indicates if comprehensive diet plan has been completed |
| comprehensive_plan_data | JSONB | YES | NULL | Stores comprehensive diet plan data including weekly meal plans, goals, and guidelines |
| plan_created_at | TIMESTAMP WITHOUT TIME ZONE | YES | NULL | Timestamp when comprehensive diet plan was first created |
| plan_updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | NULL | Timestamp when comprehensive diet plan was last updated |
| has_review | BOOLEAN | YES | false |  |

#### Constraints

- **diet_plan_requests_status_check**: CHECK on status
- **diet_plan_requests_nutritionist_id_fkey**: FOREIGN KEY on id
- **diet_plan_requests_user_id_fkey**: FOREIGN KEY on id
- **diet_plan_requests_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **nutritionist_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **user_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **diet_plan_requests_pkey**: CREATE UNIQUE INDEX diet_plan_requests_pkey ON public.diet_plan_requests USING btree (id)
- **idx_diet_plan_requests_completed**: CREATE INDEX idx_diet_plan_requests_completed ON public.diet_plan_requests USING btree (diet_plan_completed)
- **idx_diet_plan_requests_comprehensive_data**: CREATE INDEX idx_diet_plan_requests_comprehensive_data ON public.diet_plan_requests USING gin (comprehensive_plan_data)
- **idx_diet_plan_requests_nutritionist_id**: CREATE INDEX idx_diet_plan_requests_nutritionist_id ON public.diet_plan_requests USING btree (nutritionist_id)
- **idx_diet_plan_requests_status**: CREATE INDEX idx_diet_plan_requests_status ON public.diet_plan_requests USING btree (status)
- **idx_diet_plan_requests_user_id**: CREATE INDEX idx_diet_plan_requests_user_id ON public.diet_plan_requests USING btree (user_id)

---

### equipment

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('equipment_id_seq'::regclass) |  |
| name | VARCHAR(255) | NO | NULL |  |
| description | TEXT | YES | NULL |  |
| category | VARCHAR(100) | YES | NULL |  |
| condition | VARCHAR(20) | YES | 'good'::character varying |  |
| location | VARCHAR(100) | YES | NULL |  |
| purchase_date | DATE | YES | NULL |  |
| last_maintenance_date | DATE | YES | NULL |  |
| next_maintenance_date | DATE | YES | NULL |  |
| is_available | BOOLEAN | YES | true |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **equipment_condition_check**: CHECK on condition
- **equipment_pkey**: PRIMARY KEY on id

#### Indexes

- **equipment_pkey**: CREATE UNIQUE INDEX equipment_pkey ON public.equipment USING btree (id)

---

### exercises

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('exercises_id_seq'::regclass) |  |
| name | VARCHAR(255) | NO | NULL |  |
| description | TEXT | YES | NULL |  |
| instructions | TEXT | YES | NULL |  |
| primary_muscle_group_id | INTEGER | YES | NULL |  |
| secondary_muscle_groups | ARRAY | YES | ARRAY[]::integer[] |  |
| equipment_needed | ARRAY | YES | NULL |  |
| difficulty_level | VARCHAR(20) | YES | NULL |  |
| video_url | TEXT | YES | NULL |  |
| image_url | TEXT | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **exercises_difficulty_level_check**: CHECK on difficulty_level
- **exercises_primary_muscle_group_id_fkey**: FOREIGN KEY on id
- **exercises_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **primary_muscle_group_id** → **muscle_groups.id** (ON DELETE: NO ACTION, ON UPDATE: NO ACTION)

#### Indexes

- **exercises_pkey**: CREATE UNIQUE INDEX exercises_pkey ON public.exercises USING btree (id)
- **idx_exercises_difficulty**: CREATE INDEX idx_exercises_difficulty ON public.exercises USING btree (difficulty_level)
- **idx_exercises_muscle_group**: CREATE INDEX idx_exercises_muscle_group ON public.exercises USING btree (primary_muscle_group_id)

---

### facilities

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('facilities_id_seq'::regclass) |  |
| name | VARCHAR(255) | NO | NULL |  |
| description | TEXT | YES | NULL |  |
| category | VARCHAR(100) | NO | NULL |  |
| default_duration_minutes | INTEGER | YES | 60 |  |
| max_capacity | INTEGER | YES | 1 |  |
| location | VARCHAR(255) | YES | NULL |  |
| image_url | VARCHAR(500) | YES | NULL |  |
| is_active | BOOLEAN | YES | true |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **facilities_pkey**: PRIMARY KEY on id
- **facilities_name_key**: UNIQUE on name

#### Indexes

- **facilities_name_key**: CREATE UNIQUE INDEX facilities_name_key ON public.facilities USING btree (name)
- **facilities_pkey**: CREATE UNIQUE INDEX facilities_pkey ON public.facilities USING btree (id)

---

### facility_analytics

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('facility_analytics_id_seq'::regclass) |  |
| facility_id | INTEGER | YES | NULL |  |
| date | DATE | NO | NULL |  |
| total_slots | INTEGER | YES | 0 |  |
| total_bookings | INTEGER | YES | 0 |  |
| total_revenue | DECIMAL(10, 2) | YES | 0.00 |  |
| peak_hour_bookings | INTEGER | YES | 0 |  |
| off_peak_bookings | INTEGER | YES | 0 |  |
| member_bookings | INTEGER | YES | 0 |  |
| non_member_bookings | INTEGER | YES | 0 |  |
| average_utilization_percentage | DECIMAL(5, 2) | YES | 0.00 |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **facility_analytics_facility_id_fkey**: FOREIGN KEY on id
- **facility_analytics_pkey**: PRIMARY KEY on id
- **facility_analytics_facility_id_date_key**: UNIQUE on date
- **facility_analytics_facility_id_date_key**: UNIQUE on facility_id

#### Foreign Keys

- **facility_id** → **facilities.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **facility_analytics_facility_id_date_key**: CREATE UNIQUE INDEX facility_analytics_facility_id_date_key ON public.facility_analytics USING btree (facility_id, date)
- **facility_analytics_pkey**: CREATE UNIQUE INDEX facility_analytics_pkey ON public.facility_analytics USING btree (id)
- **idx_facility_analytics_facility_date**: CREATE INDEX idx_facility_analytics_facility_date ON public.facility_analytics USING btree (facility_id, date)

---

### facility_availability_exceptions

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('facility_availability_exceptions_id_seq'::regclass) |  |
| facility_id | INTEGER | YES | NULL |  |
| date | DATE | NO | NULL |  |
| start_time | TIME WITHOUT TIME ZONE | YES | NULL |  |
| end_time | TIME WITHOUT TIME ZONE | YES | NULL |  |
| reason | VARCHAR(255) | NO | NULL |  |
| is_blocked | BOOLEAN | YES | true |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **facility_availability_exceptions_facility_id_fkey**: FOREIGN KEY on id
- **facility_availability_exceptions_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **facility_id** → **facilities.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **facility_availability_exceptions_pkey**: CREATE UNIQUE INDEX facility_availability_exceptions_pkey ON public.facility_availability_exceptions USING btree (id)

---

### facility_bookings

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('facility_bookings_id_seq'::regclass) |  |
| user_id | INTEGER | YES | NULL |  |
| slot_id | INTEGER | YES | NULL |  |
| facility_id | INTEGER | YES | NULL |  |
| booking_date | DATE | NO | NULL |  |
| start_time | TIME WITHOUT TIME ZONE | NO | NULL |  |
| end_time | TIME WITHOUT TIME ZONE | NO | NULL |  |
| status | VARCHAR(20) | YES | 'confirmed'::character varying |  |
| price_paid | DECIMAL(10, 2) | NO | NULL |  |
| notes | TEXT | YES | NULL |  |
| cancellation_reason | TEXT | YES | NULL |  |
| cancelled_at | TIMESTAMP WITHOUT TIME ZONE | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **facility_bookings_status_check**: CHECK on status
- **facility_bookings_facility_id_fkey**: FOREIGN KEY on id
- **facility_bookings_slot_id_fkey**: FOREIGN KEY on id
- **facility_bookings_user_id_fkey**: FOREIGN KEY on id
- **facility_bookings_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **facility_id** → **facilities.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **slot_id** → **facility_slots.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **user_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **facility_bookings_pkey**: CREATE UNIQUE INDEX facility_bookings_pkey ON public.facility_bookings USING btree (id)
- **idx_facility_bookings_date**: CREATE INDEX idx_facility_bookings_date ON public.facility_bookings USING btree (booking_date)
- **idx_facility_bookings_slot**: CREATE INDEX idx_facility_bookings_slot ON public.facility_bookings USING btree (slot_id)
- **idx_facility_bookings_user**: CREATE INDEX idx_facility_bookings_user ON public.facility_bookings USING btree (user_id)

---

### facility_pricing

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('facility_pricing_id_seq'::regclass) |  |
| facility_id | INTEGER | YES | NULL |  |
| base_price | DECIMAL(10, 2) | NO | NULL |  |
| peak_hours_start | TIME WITHOUT TIME ZONE | YES | '17:00:00'::time without time zone |  |
| peak_hours_end | TIME WITHOUT TIME ZONE | YES | '21:00:00'::time without time zone |  |
| peak_price_multiplier | DECIMAL(4, 2) | YES | 1.25 |  |
| member_discount_percentage | DECIMAL(5, 2) | YES | 15.00 |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **facility_pricing_facility_id_fkey**: FOREIGN KEY on id
- **facility_pricing_pkey**: PRIMARY KEY on id
- **facility_pricing_facility_id_key**: UNIQUE on facility_id

#### Foreign Keys

- **facility_id** → **facilities.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **facility_pricing_facility_id_key**: CREATE UNIQUE INDEX facility_pricing_facility_id_key ON public.facility_pricing USING btree (facility_id)
- **facility_pricing_pkey**: CREATE UNIQUE INDEX facility_pricing_pkey ON public.facility_pricing USING btree (id)

---

### facility_schedules

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('facility_schedules_id_seq'::regclass) |  |
| facility_id | INTEGER | YES | NULL |  |
| day_of_week | INTEGER | NO | NULL |  |
| start_time | TIME WITHOUT TIME ZONE | NO | NULL |  |
| end_time | TIME WITHOUT TIME ZONE | NO | NULL |  |
| is_available | BOOLEAN | YES | true |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **facility_schedules_day_of_week_check**: CHECK on day_of_week
- **facility_schedules_facility_id_fkey**: FOREIGN KEY on id
- **facility_schedules_pkey**: PRIMARY KEY on id
- **facility_schedules_facility_id_day_of_week_start_time_key**: UNIQUE on day_of_week
- **facility_schedules_facility_id_day_of_week_start_time_key**: UNIQUE on facility_id
- **facility_schedules_facility_id_day_of_week_start_time_key**: UNIQUE on start_time

#### Foreign Keys

- **facility_id** → **facilities.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **facility_schedules_facility_id_day_of_week_start_time_key**: CREATE UNIQUE INDEX facility_schedules_facility_id_day_of_week_start_time_key ON public.facility_schedules USING btree (facility_id, day_of_week, start_time)
- **facility_schedules_pkey**: CREATE UNIQUE INDEX facility_schedules_pkey ON public.facility_schedules USING btree (id)

---

### facility_slots

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('facility_slots_id_seq'::regclass) |  |
| facility_id | INTEGER | YES | NULL |  |
| date | DATE | NO | NULL |  |
| start_time | TIME WITHOUT TIME ZONE | NO | NULL |  |
| end_time | TIME WITHOUT TIME ZONE | NO | NULL |  |
| status | VARCHAR(20) | YES | 'available'::character varying |  |
| base_price | DECIMAL(10, 2) | NO | NULL |  |
| final_price | DECIMAL(10, 2) | NO | NULL |  |
| slot_type | VARCHAR(20) | YES | 'regular'::character varying |  |
| max_capacity | INTEGER | YES | 1 |  |
| current_bookings | INTEGER | YES | 0 |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **facility_slots_slot_type_check**: CHECK on slot_type
- **facility_slots_status_check**: CHECK on status
- **facility_slots_facility_id_fkey**: FOREIGN KEY on id
- **facility_slots_pkey**: PRIMARY KEY on id
- **facility_slots_facility_id_date_start_time_key**: UNIQUE on date
- **facility_slots_facility_id_date_start_time_key**: UNIQUE on facility_id
- **facility_slots_facility_id_date_start_time_key**: UNIQUE on start_time

#### Foreign Keys

- **facility_id** → **facilities.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **facility_slots_facility_id_date_start_time_key**: CREATE UNIQUE INDEX facility_slots_facility_id_date_start_time_key ON public.facility_slots USING btree (facility_id, date, start_time)
- **facility_slots_pkey**: CREATE UNIQUE INDEX facility_slots_pkey ON public.facility_slots USING btree (id)
- **idx_facility_slots_facility_date**: CREATE INDEX idx_facility_slots_facility_date ON public.facility_slots USING btree (facility_id, date)
- **idx_facility_slots_status**: CREATE INDEX idx_facility_slots_status ON public.facility_slots USING btree (status)

---

### facility_waitlist

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('facility_waitlist_id_seq'::regclass) |  |
| user_id | INTEGER | YES | NULL |  |
| facility_id | INTEGER | YES | NULL |  |
| preferred_date | DATE | NO | NULL |  |
| preferred_start_time | TIME WITHOUT TIME ZONE | NO | NULL |  |
| preferred_end_time | TIME WITHOUT TIME ZONE | NO | NULL |  |
| status | VARCHAR(20) | YES | 'waiting'::character varying |  |
| priority | INTEGER | YES | 0 |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **facility_waitlist_status_check**: CHECK on status
- **facility_waitlist_facility_id_fkey**: FOREIGN KEY on id
- **facility_waitlist_user_id_fkey**: FOREIGN KEY on id
- **facility_waitlist_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **facility_id** → **facilities.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **user_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **facility_waitlist_pkey**: CREATE UNIQUE INDEX facility_waitlist_pkey ON public.facility_waitlist USING btree (id)
- **idx_facility_waitlist_facility_date**: CREATE INDEX idx_facility_waitlist_facility_date ON public.facility_waitlist USING btree (facility_id, preferred_date)

---

### front_desk_staff

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('front_desk_staff_id_seq'::regclass) |  |
| user_id | INTEGER | NO | NULL |  |
| shift_preference | VARCHAR(50) | YES | NULL |  |
| emergency_contact_authorized | BOOLEAN | YES | false |  |
| system_access_level | VARCHAR(50) | YES | 'basic'::character varying |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **front_desk_staff_user_id_fkey**: FOREIGN KEY on id
- **front_desk_staff_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **user_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **front_desk_staff_pkey**: CREATE UNIQUE INDEX front_desk_staff_pkey ON public.front_desk_staff USING btree (id)
- **idx_front_desk_staff_user_id**: CREATE INDEX idx_front_desk_staff_user_id ON public.front_desk_staff USING btree (user_id)

---

### gym_revenue

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('gym_revenue_id_seq'::regclass) |  |
| revenue_date | DATE | NO | NULL |  |
| revenue_source | VARCHAR(100) | NO | NULL |  |
| category | VARCHAR(50) | NO | NULL |  |
| amount | DECIMAL(10, 2) | NO | NULL |  |
| tax_amount | DECIMAL(10, 2) | YES | 0.00 |  |
| net_amount | DECIMAL(10, 2) | NO | NULL |  |
| payment_method | VARCHAR(50) | NO | NULL |  |
| transaction_status | VARCHAR(20) | YES | 'completed'::character varying |  |
| reference_table | VARCHAR(50) | YES | NULL |  |
| reference_id | INTEGER | YES | NULL |  |
| user_id | INTEGER | YES | NULL |  |
| trainer_id | INTEGER | YES | NULL |  |
| notes | TEXT | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **gym_revenue_category_check**: CHECK on category
- **gym_revenue_payment_method_check**: CHECK on payment_method
- **gym_revenue_revenue_source_check**: CHECK on revenue_source
- **gym_revenue_transaction_status_check**: CHECK on transaction_status
- **gym_revenue_pkey**: PRIMARY KEY on id

#### Indexes

- **gym_revenue_pkey**: CREATE UNIQUE INDEX gym_revenue_pkey ON public.gym_revenue USING btree (id)
- **idx_gym_revenue_category**: CREATE INDEX idx_gym_revenue_category ON public.gym_revenue USING btree (category)
- **idx_gym_revenue_date**: CREATE INDEX idx_gym_revenue_date ON public.gym_revenue USING btree (revenue_date)
- **idx_gym_revenue_reference**: CREATE INDEX idx_gym_revenue_reference ON public.gym_revenue USING btree (reference_table, reference_id)
- **idx_gym_revenue_source**: CREATE INDEX idx_gym_revenue_source ON public.gym_revenue USING btree (revenue_source)
- **idx_gym_revenue_status**: CREATE INDEX idx_gym_revenue_status ON public.gym_revenue USING btree (transaction_status)
- **idx_gym_revenue_trainer_id**: CREATE INDEX idx_gym_revenue_trainer_id ON public.gym_revenue USING btree (trainer_id)
- **idx_gym_revenue_user_id**: CREATE INDEX idx_gym_revenue_user_id ON public.gym_revenue USING btree (user_id)

---

### gym_visits

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('gym_visits_id_seq'::regclass) |  |
| user_id | INTEGER | YES | NULL |  |
| visit_date | DATE | NO | NULL |  |
| check_in_time | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| check_out_time | TIMESTAMP WITHOUT TIME ZONE | YES | NULL |  |
| duration_minutes | INTEGER | YES | NULL |  |
| points_awarded | INTEGER | YES | 1 |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **gym_visits_user_id_fkey**: FOREIGN KEY on id
- **gym_visits_pkey**: PRIMARY KEY on id
- **gym_visits_user_id_visit_date_key**: UNIQUE on user_id
- **gym_visits_user_id_visit_date_key**: UNIQUE on visit_date

#### Foreign Keys

- **user_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **gym_visits_pkey**: CREATE UNIQUE INDEX gym_visits_pkey ON public.gym_visits USING btree (id)
- **gym_visits_user_id_visit_date_key**: CREATE UNIQUE INDEX gym_visits_user_id_visit_date_key ON public.gym_visits USING btree (user_id, visit_date)
- **idx_gym_visits_date**: CREATE INDEX idx_gym_visits_date ON public.gym_visits USING btree (visit_date)
- **idx_gym_visits_user_id**: CREATE INDEX idx_gym_visits_user_id ON public.gym_visits USING btree (user_id)

---

### loyalty_transactions

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('loyalty_transactions_id_seq'::regclass) |  |
| user_id | INTEGER | YES | NULL |  |
| points_change | INTEGER | NO | NULL |  |
| transaction_type | VARCHAR(50) | NO | NULL |  |
| description | TEXT | YES | NULL |  |
| reference_id | INTEGER | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **loyalty_transactions_transaction_type_check**: CHECK on transaction_type
- **loyalty_transactions_user_id_fkey**: FOREIGN KEY on id
- **loyalty_transactions_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **user_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_loyalty_transactions_type**: CREATE INDEX idx_loyalty_transactions_type ON public.loyalty_transactions USING btree (transaction_type)
- **idx_loyalty_transactions_user_id**: CREATE INDEX idx_loyalty_transactions_user_id ON public.loyalty_transactions USING btree (user_id)
- **loyalty_transactions_pkey**: CREATE UNIQUE INDEX loyalty_transactions_pkey ON public.loyalty_transactions USING btree (id)

---

### meal_plan_template_foods

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('meal_plan_template_foods_id_seq'::regclass) |  |
| meal_id | INTEGER | YES | NULL |  |
| food_name | VARCHAR(200) | NO | NULL |  |
| quantity | DECIMAL(8, 3) | NO | NULL |  |
| unit | VARCHAR(50) | NO | NULL |  |
| calories_per_serving | DECIMAL(6, 2) | YES | NULL |  |
| protein_per_serving | DECIMAL(5, 2) | YES | NULL |  |
| carbs_per_serving | DECIMAL(5, 2) | YES | NULL |  |
| fats_per_serving | DECIMAL(5, 2) | YES | NULL |  |
| fiber_per_serving | DECIMAL(5, 2) | YES | NULL |  |
| notes | TEXT | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **meal_plan_template_foods_meal_id_fkey**: FOREIGN KEY on id
- **meal_plan_template_foods_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **meal_id** → **meal_plan_template_meals.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_meal_plan_template_foods_meal_id**: CREATE INDEX idx_meal_plan_template_foods_meal_id ON public.meal_plan_template_foods USING btree (meal_id)
- **meal_plan_template_foods_pkey**: CREATE UNIQUE INDEX meal_plan_template_foods_pkey ON public.meal_plan_template_foods USING btree (id)

---

### meal_plan_template_meals

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('meal_plan_template_meals_id_seq'::regclass) |  |
| template_id | INTEGER | YES | NULL |  |
| meal_name | VARCHAR(200) | NO | NULL |  |
| meal_type | VARCHAR(50) | NO | NULL |  |
| meal_order | INTEGER | NO | NULL |  |
| target_calories | INTEGER | YES | NULL |  |
| target_protein | DECIMAL(5, 2) | YES | NULL |  |
| target_carbs | DECIMAL(5, 2) | YES | NULL |  |
| target_fats | DECIMAL(5, 2) | YES | NULL |  |
| description | TEXT | YES | NULL |  |
| preparation_time | INTEGER | YES | NULL |  |
| cooking_time | INTEGER | YES | NULL |  |
| difficulty | VARCHAR(50) | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **meal_plan_template_meals_difficulty_check**: CHECK on difficulty
- **meal_plan_template_meals_meal_type_check**: CHECK on meal_type
- **meal_plan_template_meals_template_id_fkey**: FOREIGN KEY on id
- **meal_plan_template_meals_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **template_id** → **meal_plan_templates.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_meal_plan_template_meals_template_id**: CREATE INDEX idx_meal_plan_template_meals_template_id ON public.meal_plan_template_meals USING btree (template_id)
- **meal_plan_template_meals_pkey**: CREATE UNIQUE INDEX meal_plan_template_meals_pkey ON public.meal_plan_template_meals USING btree (id)

---

### meal_plan_templates

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('meal_plan_templates_id_seq'::regclass) |  |
| nutritionist_id | INTEGER | YES | NULL |  |
| template_name | VARCHAR(200) | NO | NULL |  |
| template_type | VARCHAR(100) | NO | NULL |  |
| target_calories | INTEGER | NO | NULL |  |
| target_protein | DECIMAL(5, 2) | YES | NULL |  |
| target_carbs | DECIMAL(5, 2) | YES | NULL |  |
| target_fats | DECIMAL(5, 2) | YES | NULL |  |
| target_fiber | DECIMAL(5, 2) | YES | NULL |  |
| target_sodium | DECIMAL(6, 2) | YES | NULL |  |
| target_sugar | DECIMAL(5, 2) | YES | NULL |  |
| meal_count | INTEGER | NO | NULL |  |
| duration_weeks | INTEGER | YES | 1 |  |
| difficulty_level | VARCHAR(50) | YES | NULL |  |
| dietary_restrictions | ARRAY | YES | NULL |  |
| fitness_goal | VARCHAR(100) | YES | NULL |  |
| age_group | VARCHAR(50) | YES | NULL |  |
| activity_level | VARCHAR(50) | YES | NULL |  |
| description | TEXT | YES | NULL |  |
| instructions | TEXT | YES | NULL |  |
| tips_and_notes | TEXT | YES | NULL |  |
| is_active | BOOLEAN | YES | true |  |
| is_public | BOOLEAN | YES | false |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **meal_plan_templates_difficulty_level_check**: CHECK on difficulty_level
- **meal_plan_templates_nutritionist_id_fkey**: FOREIGN KEY on id
- **meal_plan_templates_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **nutritionist_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_meal_plan_templates_fitness_goal**: CREATE INDEX idx_meal_plan_templates_fitness_goal ON public.meal_plan_templates USING btree (fitness_goal)
- **idx_meal_plan_templates_nutritionist_id**: CREATE INDEX idx_meal_plan_templates_nutritionist_id ON public.meal_plan_templates USING btree (nutritionist_id)
- **idx_meal_plan_templates_type**: CREATE INDEX idx_meal_plan_templates_type ON public.meal_plan_templates USING btree (template_type)
- **meal_plan_templates_pkey**: CREATE UNIQUE INDEX meal_plan_templates_pkey ON public.meal_plan_templates USING btree (id)

---

### member_balance

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('member_balance_id_seq'::regclass) |  |
| user_id | INTEGER | YES | NULL |  |
| current_balance | DECIMAL(10, 2) | YES | 0.00 |  |
| total_earned | DECIMAL(10, 2) | YES | 0.00 |  |
| total_spent | DECIMAL(10, 2) | YES | 0.00 |  |
| last_updated | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **member_balance_user_id_fkey**: FOREIGN KEY on id
- **member_balance_pkey**: PRIMARY KEY on id
- **member_balance_user_id_key**: UNIQUE on user_id

#### Foreign Keys

- **user_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_member_balance_user_id**: CREATE INDEX idx_member_balance_user_id ON public.member_balance USING btree (user_id)
- **member_balance_pkey**: CREATE UNIQUE INDEX member_balance_pkey ON public.member_balance USING btree (id)
- **member_balance_user_id_key**: CREATE UNIQUE INDEX member_balance_user_id_key ON public.member_balance USING btree (user_id)

---

### member_balance_transactions

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('member_balance_transactions_id_seq'::regclass) |  |
| user_id | INTEGER | YES | NULL |  |
| transaction_type | VARCHAR(50) | NO | NULL |  |
| amount | DECIMAL(10, 2) | NO | NULL |  |
| balance_before | DECIMAL(10, 2) | NO | NULL |  |
| balance_after | DECIMAL(10, 2) | NO | NULL |  |
| description | TEXT | YES | NULL |  |
| reference_id | INTEGER | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **member_balance_transactions_transaction_type_check**: CHECK on transaction_type
- **member_balance_transactions_user_id_fkey**: FOREIGN KEY on id
- **member_balance_transactions_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **user_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_member_balance_transactions_type**: CREATE INDEX idx_member_balance_transactions_type ON public.member_balance_transactions USING btree (transaction_type)
- **idx_member_balance_transactions_user_id**: CREATE INDEX idx_member_balance_transactions_user_id ON public.member_balance_transactions USING btree (user_id)
- **member_balance_transactions_pkey**: CREATE UNIQUE INDEX member_balance_transactions_pkey ON public.member_balance_transactions USING btree (id)

---

### member_invites

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('member_invites_id_seq'::regclass) |  |
| user_id | INTEGER | YES | NULL |  |
| email_sent_to | VARCHAR(255) | NO | NULL |  |
| invite_code | VARCHAR(50) | NO | NULL |  |
| status | VARCHAR(20) | YES | 'sent'::character varying |  |
| sent_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| opened_at | TIMESTAMP WITHOUT TIME ZONE | YES | NULL |  |
| registered_at | TIMESTAMP WITHOUT TIME ZONE | YES | NULL |  |

#### Constraints

- **member_invites_status_check**: CHECK on status
- **member_invites_user_id_fkey**: FOREIGN KEY on id
- **member_invites_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **user_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **member_invites_pkey**: CREATE UNIQUE INDEX member_invites_pkey ON public.member_invites USING btree (id)

---

### member_profiles

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('member_profiles_id_seq'::regclass) |  |
| user_id | INTEGER | YES | NULL |  |
| current_plan_id | INTEGER | YES | NULL |  |
| loyalty_points | INTEGER | YES | 0 |  |
| streak_days | INTEGER | YES | 0 |  |
| last_gym_visit | DATE | YES | NULL |  |
| weight | DECIMAL(5, 2) | YES | NULL |  |
| height | DECIMAL(5, 2) | YES | NULL |  |
| profile_image_url | TEXT | YES | NULL |  |
| fitness_goals | TEXT | YES | NULL |  |
| health_notes | TEXT | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| subscription_status | VARCHAR(20) | YES | 'active'::character varying |  |
| store_preferences | JSONB | YES | '{}'::jsonb |  |
| favorite_categories | ARRAY | YES | ARRAY[]::integer[] |  |
| total_store_purchases | INTEGER | YES | 0 |  |
| total_store_spent | DECIMAL(10, 2) | YES | 0.00 |  |
| last_store_purchase_date | TIMESTAMP WITHOUT TIME ZONE | YES | NULL |  |
| membership_start_date | DATE | YES | NULL | Date when membership becomes active (next day after creation) |
| membership_end_date | DATE | YES | NULL | Date when membership expires (calculated based on plan duration) |

#### Constraints

- **member_profiles_subscription_status_check**: CHECK on subscription_status
- **member_profiles_current_plan_id_fkey**: FOREIGN KEY on id
- **member_profiles_user_id_fkey**: FOREIGN KEY on id
- **member_profiles_pkey**: PRIMARY KEY on id
- **member_profiles_user_id_key**: UNIQUE on user_id

#### Foreign Keys

- **current_plan_id** → **membership_plans.id** (ON DELETE: NO ACTION, ON UPDATE: NO ACTION)
- **user_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_member_profiles_membership_dates**: CREATE INDEX idx_member_profiles_membership_dates ON public.member_profiles USING btree (membership_start_date, membership_end_date)
- **idx_member_profiles_plan_id**: CREATE INDEX idx_member_profiles_plan_id ON public.member_profiles USING btree (current_plan_id)
- **idx_member_profiles_subscription_status**: CREATE INDEX idx_member_profiles_subscription_status ON public.member_profiles USING btree (subscription_status)
- **idx_member_profiles_user_id**: CREATE INDEX idx_member_profiles_user_id ON public.member_profiles USING btree (user_id)
- **member_profiles_pkey**: CREATE UNIQUE INDEX member_profiles_pkey ON public.member_profiles USING btree (id)
- **member_profiles_user_id_key**: CREATE UNIQUE INDEX member_profiles_user_id_key ON public.member_profiles USING btree (user_id)

---

### member_workout_schedules

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('member_workout_schedules_id_seq'::regclass) |  |
| user_id | INTEGER | YES | NULL |  |
| day_of_week | INTEGER | NO | NULL |  |
| schedule_name | VARCHAR(255) | YES | NULL |  |
| is_active | BOOLEAN | YES | true |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **member_workout_schedules_day_of_week_check**: CHECK on day_of_week
- **member_workout_schedules_user_id_fkey**: FOREIGN KEY on id
- **member_workout_schedules_pkey**: PRIMARY KEY on id
- **member_workout_schedules_user_id_day_of_week_is_active_key**: UNIQUE on day_of_week
- **member_workout_schedules_user_id_day_of_week_is_active_key**: UNIQUE on is_active
- **member_workout_schedules_user_id_day_of_week_is_active_key**: UNIQUE on user_id

#### Foreign Keys

- **user_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_workout_schedules_day**: CREATE INDEX idx_workout_schedules_day ON public.member_workout_schedules USING btree (day_of_week)
- **idx_workout_schedules_user_id**: CREATE INDEX idx_workout_schedules_user_id ON public.member_workout_schedules USING btree (user_id)
- **member_workout_schedules_pkey**: CREATE UNIQUE INDEX member_workout_schedules_pkey ON public.member_workout_schedules USING btree (id)
- **member_workout_schedules_user_id_day_of_week_is_active_key**: CREATE UNIQUE INDEX member_workout_schedules_user_id_day_of_week_is_active_key ON public.member_workout_schedules USING btree (user_id, day_of_week, is_active)

---

### membership_plans

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('membership_plans_id_seq'::regclass) |  |
| name | VARCHAR(255) | NO | NULL |  |
| description | TEXT | YES | NULL |  |
| price | DECIMAL(10, 2) | NO | NULL |  |
| duration_months | INTEGER | NO | NULL |  |
| features | ARRAY | YES | NULL |  |
| max_classes_per_month | INTEGER | YES | NULL |  |
| includes_personal_training | BOOLEAN | YES | false |  |
| includes_nutrition_consultation | BOOLEAN | YES | false |  |
| is_active | BOOLEAN | YES | true |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **membership_plans_pkey**: PRIMARY KEY on id

#### Indexes

- **membership_plans_pkey**: CREATE UNIQUE INDEX membership_plans_pkey ON public.membership_plans USING btree (id)

---

### membership_revenue

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('membership_revenue_id_seq'::regclass) |  |
| revenue_id | INTEGER | YES | NULL |  |
| membership_plan_id | INTEGER | YES | NULL |  |
| plan_name | VARCHAR(255) | YES | NULL |  |
| plan_duration_months | INTEGER | YES | NULL |  |
| is_renewal | BOOLEAN | YES | false |  |
| discount_applied | DECIMAL(10, 2) | YES | 0.00 |  |
| promotional_code | VARCHAR(50) | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **membership_revenue_pkey**: PRIMARY KEY on id

#### Indexes

- **idx_membership_revenue_revenue_id**: CREATE INDEX idx_membership_revenue_revenue_id ON public.membership_revenue USING btree (revenue_id)
- **membership_revenue_pkey**: CREATE UNIQUE INDEX membership_revenue_pkey ON public.membership_revenue USING btree (id)

---

### monthly_plan_session_assignments

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('monthly_plan_session_assignments_id_seq'::regclass) |  |
| subscription_id | INTEGER | YES | NULL |  |
| slot_assignment_id | INTEGER | YES | NULL |  |
| scheduled_date | DATE | NO | NULL |  |
| scheduled_time | TIME WITHOUT TIME ZONE | NO | NULL |  |
| slot_id | INTEGER | YES | NULL |  |
| session_number | INTEGER | NO | NULL |  |
| status | VARCHAR(20) | NO | 'scheduled'::character varying |  |
| completion_date | TIMESTAMP WITHOUT TIME ZONE | YES | NULL |  |
| rescheduled_from_slot_id | INTEGER | YES | NULL |  |
| rescheduled_to_slot_id | INTEGER | YES | NULL |  |
| rescheduled_date | TIMESTAMP WITHOUT TIME ZONE | YES | NULL |  |
| notes | TEXT | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **monthly_plan_session_assignments_session_number_check**: CHECK on session_number
- **monthly_plan_session_assignments_status_check**: CHECK on status
- **monthly_plan_session_assignments_rescheduled_from_slot_id_fkey**: FOREIGN KEY on id
- **monthly_plan_session_assignments_rescheduled_to_slot_id_fkey**: FOREIGN KEY on id
- **monthly_plan_session_assignments_slot_assignment_id_fkey**: FOREIGN KEY on id
- **monthly_plan_session_assignments_slot_id_fkey**: FOREIGN KEY on id
- **monthly_plan_session_assignments_subscription_id_fkey**: FOREIGN KEY on id
- **monthly_plan_session_assignments_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **rescheduled_from_slot_id** → **trainer_master_slots.id** (ON DELETE: SET NULL, ON UPDATE: NO ACTION)
- **rescheduled_to_slot_id** → **trainer_master_slots.id** (ON DELETE: SET NULL, ON UPDATE: NO ACTION)
- **slot_assignment_id** → **slot_assignments.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **slot_id** → **trainer_master_slots.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **subscription_id** → **monthly_plan_subscriptions.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_monthly_plan_session_assignments_date**: CREATE INDEX idx_monthly_plan_session_assignments_date ON public.monthly_plan_session_assignments USING btree (scheduled_date)
- **idx_monthly_plan_session_assignments_status**: CREATE INDEX idx_monthly_plan_session_assignments_status ON public.monthly_plan_session_assignments USING btree (status)
- **idx_monthly_plan_session_assignments_subscription_id**: CREATE INDEX idx_monthly_plan_session_assignments_subscription_id ON public.monthly_plan_session_assignments USING btree (subscription_id)
- **monthly_plan_session_assignments_pkey**: CREATE UNIQUE INDEX monthly_plan_session_assignments_pkey ON public.monthly_plan_session_assignments USING btree (id)

---

### monthly_plan_subscriptions

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('monthly_plan_subscriptions_id_seq'::regclass) |  |
| member_id | INTEGER | YES | NULL |  |
| trainer_id | INTEGER | YES | NULL |  |
| plan_id | INTEGER | YES | NULL |  |
| subscription_start_date | DATE | NO | NULL |  |
| subscription_end_date | DATE | YES | NULL |  |
| auto_renewal | BOOLEAN | YES | false |  |
| status | VARCHAR(20) | NO | 'active'::character varying |  |
| sessions_remaining | INTEGER | NO | NULL |  |
| total_paid | DECIMAL(10, 2) | NO | NULL |  |
| payment_date | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| next_billing_date | DATE | YES | NULL |  |
| cancellation_date | DATE | YES | NULL |  |
| cancellation_reason | TEXT | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| trainer_approval_date | TIMESTAMP WITHOUT TIME ZONE | YES | NULL | Timestamp when the trainer approved this subscription request |
| trainer_approval_notes | TEXT | YES | NULL | Notes from the trainer when approving this subscription request |
| trainer_rejection_date | TIMESTAMP WITHOUT TIME ZONE | YES | NULL | Timestamp when the trainer rejected this subscription request |
| trainer_rejection_reason | TEXT | YES | NULL | Reason from the trainer when rejecting this subscription request |

#### Constraints

- **monthly_plan_subscriptions_status_check**: CHECK on status
- **valid_sessions_remaining**: CHECK on sessions_remaining
- **valid_subscription_dates**: CHECK on subscription_end_date
- **valid_subscription_dates**: CHECK on subscription_start_date
- **monthly_plan_subscriptions_member_id_fkey**: FOREIGN KEY on id
- **monthly_plan_subscriptions_plan_id_fkey**: FOREIGN KEY on id
- **monthly_plan_subscriptions_trainer_id_fkey**: FOREIGN KEY on id
- **monthly_plan_subscriptions_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **member_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **plan_id** → **trainer_monthly_plans.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **trainer_id** → **trainers.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_monthly_plan_subscriptions_dates**: CREATE INDEX idx_monthly_plan_subscriptions_dates ON public.monthly_plan_subscriptions USING btree (subscription_start_date, subscription_end_date)
- **idx_monthly_plan_subscriptions_member_id**: CREATE INDEX idx_monthly_plan_subscriptions_member_id ON public.monthly_plan_subscriptions USING btree (member_id)
- **idx_monthly_plan_subscriptions_status**: CREATE INDEX idx_monthly_plan_subscriptions_status ON public.monthly_plan_subscriptions USING btree (status)
- **idx_monthly_plan_subscriptions_trainer_approval_date**: CREATE INDEX idx_monthly_plan_subscriptions_trainer_approval_date ON public.monthly_plan_subscriptions USING btree (trainer_approval_date)
- **idx_monthly_plan_subscriptions_trainer_id**: CREATE INDEX idx_monthly_plan_subscriptions_trainer_id ON public.monthly_plan_subscriptions USING btree (trainer_id)
- **idx_monthly_plan_subscriptions_trainer_rejection_date**: CREATE INDEX idx_monthly_plan_subscriptions_trainer_rejection_date ON public.monthly_plan_subscriptions USING btree (trainer_rejection_date)
- **monthly_plan_subscriptions_pkey**: CREATE UNIQUE INDEX monthly_plan_subscriptions_pkey ON public.monthly_plan_subscriptions USING btree (id)

---

### monthly_revenue_summary

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('monthly_revenue_summary_id_seq'::regclass) |  |
| month_year | DATE | NO | NULL |  |
| total_revenue | DECIMAL(12, 2) | YES | 0.00 |  |
| total_transactions | INTEGER | YES | 0 |  |
| membership_revenue | DECIMAL(12, 2) | YES | 0.00 |  |
| training_revenue | DECIMAL(12, 2) | YES | 0.00 |  |
| class_revenue | DECIMAL(12, 2) | YES | 0.00 |  |
| other_revenue | DECIMAL(12, 2) | YES | 0.00 |  |
| total_tax | DECIMAL(12, 2) | YES | 0.00 |  |
| net_revenue | DECIMAL(12, 2) | YES | 0.00 |  |
| average_daily_revenue | DECIMAL(10, 2) | YES | 0.00 |  |
| highest_daily_revenue | DECIMAL(10, 2) | YES | 0.00 |  |
| lowest_daily_revenue | DECIMAL(10, 2) | YES | 0.00 |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **monthly_revenue_summary_pkey**: PRIMARY KEY on id
- **monthly_revenue_summary_month_year_key**: UNIQUE on month_year

#### Indexes

- **idx_monthly_revenue_summary_month**: CREATE INDEX idx_monthly_revenue_summary_month ON public.monthly_revenue_summary USING btree (month_year)
- **monthly_revenue_summary_month_year_key**: CREATE UNIQUE INDEX monthly_revenue_summary_month_year_key ON public.monthly_revenue_summary USING btree (month_year)
- **monthly_revenue_summary_pkey**: CREATE UNIQUE INDEX monthly_revenue_summary_pkey ON public.monthly_revenue_summary USING btree (id)

---

### muscle_groups

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('muscle_groups_id_seq'::regclass) |  |
| name | VARCHAR(100) | NO | NULL |  |
| description | TEXT | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **muscle_groups_pkey**: PRIMARY KEY on id
- **muscle_groups_name_key**: UNIQUE on name

#### Indexes

- **muscle_groups_name_key**: CREATE UNIQUE INDEX muscle_groups_name_key ON public.muscle_groups USING btree (name)
- **muscle_groups_pkey**: CREATE UNIQUE INDEX muscle_groups_pkey ON public.muscle_groups USING btree (id)

---

### nutrition_consultations

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('nutrition_consultations_id_seq'::regclass) |  |
| user_id | INTEGER | YES | NULL |  |
| nutritionist_id | INTEGER | YES | NULL |  |
| consultation_date | DATE | NO | NULL |  |
| start_time | TIME WITHOUT TIME ZONE | NO | NULL |  |
| end_time | TIME WITHOUT TIME ZONE | NO | NULL |  |
| status | VARCHAR(20) | YES | 'scheduled'::character varying |  |
| notes | TEXT | YES | NULL |  |
| meal_plan | TEXT | YES | NULL |  |
| recommendations | TEXT | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **nutrition_consultations_status_check**: CHECK on status
- **nutrition_consultations_nutritionist_id_fkey**: FOREIGN KEY on id
- **nutrition_consultations_user_id_fkey**: FOREIGN KEY on id
- **nutrition_consultations_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **nutritionist_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **user_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **nutrition_consultations_pkey**: CREATE UNIQUE INDEX nutrition_consultations_pkey ON public.nutrition_consultations USING btree (id)

---

### nutritionist_availability

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('nutritionist_availability_id_seq'::regclass) |  |
| nutritionist_id | INTEGER | YES | NULL |  |
| day_of_week | INTEGER | NO | NULL |  |
| start_time | TIME WITHOUT TIME ZONE | NO | NULL |  |
| end_time | TIME WITHOUT TIME ZONE | NO | NULL |  |
| is_available | BOOLEAN | YES | true |  |
| session_duration_minutes | INTEGER | YES | 60 |  |
| max_sessions_per_day | INTEGER | YES | 8 |  |
| break_duration_minutes | INTEGER | YES | 15 |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **nutritionist_availability_day_of_week_check**: CHECK on day_of_week
- **nutritionist_availability_nutritionist_id_fkey**: FOREIGN KEY on id
- **nutritionist_availability_pkey**: PRIMARY KEY on id
- **nutritionist_availability_nutritionist_id_day_of_week_key**: UNIQUE on day_of_week
- **nutritionist_availability_nutritionist_id_day_of_week_key**: UNIQUE on nutritionist_id

#### Foreign Keys

- **nutritionist_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **nutritionist_availability_nutritionist_id_day_of_week_key**: CREATE UNIQUE INDEX nutritionist_availability_nutritionist_id_day_of_week_key ON public.nutritionist_availability USING btree (nutritionist_id, day_of_week)
- **nutritionist_availability_pkey**: CREATE UNIQUE INDEX nutritionist_availability_pkey ON public.nutritionist_availability USING btree (id)

---

### nutritionist_diet_plan_ratings

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('nutritionist_diet_plan_ratings_id_seq'::regclass) |  |
| nutritionist_id | INTEGER | YES | NULL |  |
| client_id | INTEGER | YES | NULL |  |
| diet_plan_request_id | INTEGER | YES | NULL |  |
| rating | INTEGER | NO | NULL |  |
| review_text | TEXT | YES | NULL |  |
| meal_plan_quality | INTEGER | YES | NULL |  |
| nutritional_accuracy | INTEGER | YES | NULL |  |
| customization_level | INTEGER | YES | NULL |  |
| support_quality | INTEGER | YES | NULL |  |
| follow_up_support | INTEGER | YES | NULL |  |
| is_anonymous | BOOLEAN | YES | false |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **nutritionist_diet_plan_ratings_customization_level_check**: CHECK on customization_level
- **nutritionist_diet_plan_ratings_follow_up_support_check**: CHECK on follow_up_support
- **nutritionist_diet_plan_ratings_meal_plan_quality_check**: CHECK on meal_plan_quality
- **nutritionist_diet_plan_ratings_nutritional_accuracy_check**: CHECK on nutritional_accuracy
- **nutritionist_diet_plan_ratings_rating_check**: CHECK on rating
- **nutritionist_diet_plan_ratings_support_quality_check**: CHECK on support_quality
- **nutritionist_diet_plan_ratings_client_id_fkey**: FOREIGN KEY on id
- **nutritionist_diet_plan_ratings_diet_plan_request_id_fkey**: FOREIGN KEY on id
- **nutritionist_diet_plan_ratings_nutritionist_id_fkey**: FOREIGN KEY on id
- **nutritionist_diet_plan_ratings_pkey**: PRIMARY KEY on id
- **nutritionist_diet_plan_ratings_diet_plan_request_id_key**: UNIQUE on diet_plan_request_id

#### Foreign Keys

- **client_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **diet_plan_request_id** → **diet_plan_requests.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **nutritionist_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **nutritionist_diet_plan_ratings_diet_plan_request_id_key**: CREATE UNIQUE INDEX nutritionist_diet_plan_ratings_diet_plan_request_id_key ON public.nutritionist_diet_plan_ratings USING btree (diet_plan_request_id)
- **nutritionist_diet_plan_ratings_pkey**: CREATE UNIQUE INDEX nutritionist_diet_plan_ratings_pkey ON public.nutritionist_diet_plan_ratings USING btree (id)

---

### nutritionist_schedules

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('nutritionist_schedules_id_seq'::regclass) |  |
| nutritionist_id | INTEGER | YES | NULL |  |
| day_of_week | INTEGER | NO | NULL |  |
| time_slot | TIME WITHOUT TIME ZONE | NO | NULL |  |
| status | VARCHAR(20) | YES | 'available'::character varying |  |
| booking_id | INTEGER | YES | NULL |  |
| client_id | INTEGER | YES | NULL |  |
| session_date | DATE | YES | NULL |  |
| notes | TEXT | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **nutritionist_schedules_day_of_week_check**: CHECK on day_of_week
- **nutritionist_schedules_status_check**: CHECK on status
- **nutritionist_schedules_booking_id_fkey**: FOREIGN KEY on id
- **nutritionist_schedules_client_id_fkey**: FOREIGN KEY on id
- **nutritionist_schedules_nutritionist_id_fkey**: FOREIGN KEY on id
- **nutritionist_schedules_pkey**: PRIMARY KEY on id
- **nutritionist_schedules_nutritionist_id_day_of_week_time_slo_key**: UNIQUE on nutritionist_id
- **nutritionist_schedules_nutritionist_id_day_of_week_time_slo_key**: UNIQUE on time_slot
- **nutritionist_schedules_nutritionist_id_day_of_week_time_slo_key**: UNIQUE on day_of_week

#### Foreign Keys

- **booking_id** → **nutritionist_sessions.id** (ON DELETE: SET NULL, ON UPDATE: NO ACTION)
- **client_id** → **users.id** (ON DELETE: SET NULL, ON UPDATE: NO ACTION)
- **nutritionist_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_nutritionist_schedules_booking_id**: CREATE INDEX idx_nutritionist_schedules_booking_id ON public.nutritionist_schedules USING btree (booking_id)
- **idx_nutritionist_schedules_client_id**: CREATE INDEX idx_nutritionist_schedules_client_id ON public.nutritionist_schedules USING btree (client_id)
- **idx_nutritionist_schedules_day_time**: CREATE INDEX idx_nutritionist_schedules_day_time ON public.nutritionist_schedules USING btree (day_of_week, time_slot)
- **idx_nutritionist_schedules_nutritionist_id**: CREATE INDEX idx_nutritionist_schedules_nutritionist_id ON public.nutritionist_schedules USING btree (nutritionist_id)
- **idx_nutritionist_schedules_session_date**: CREATE INDEX idx_nutritionist_schedules_session_date ON public.nutritionist_schedules USING btree (session_date)
- **idx_nutritionist_schedules_status**: CREATE INDEX idx_nutritionist_schedules_status ON public.nutritionist_schedules USING btree (status)
- **nutritionist_schedules_nutritionist_id_day_of_week_time_slo_key**: CREATE UNIQUE INDEX nutritionist_schedules_nutritionist_id_day_of_week_time_slo_key ON public.nutritionist_schedules USING btree (nutritionist_id, day_of_week, time_slot)
- **nutritionist_schedules_pkey**: CREATE UNIQUE INDEX nutritionist_schedules_pkey ON public.nutritionist_schedules USING btree (id)

---

### nutritionist_session_ratings

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('nutritionist_session_ratings_id_seq'::regclass) |  |
| nutritionist_id | INTEGER | YES | NULL |  |
| client_id | INTEGER | YES | NULL |  |
| session_request_id | INTEGER | YES | NULL |  |
| rating | INTEGER | NO | NULL |  |
| review_text | TEXT | YES | NULL |  |
| nutritional_guidance | INTEGER | YES | NULL |  |
| communication | INTEGER | YES | NULL |  |
| punctuality | INTEGER | YES | NULL |  |
| professionalism | INTEGER | YES | NULL |  |
| session_effectiveness | INTEGER | YES | NULL |  |
| is_anonymous | BOOLEAN | YES | false |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **nutritionist_session_ratings_communication_check**: CHECK on communication
- **nutritionist_session_ratings_nutritional_guidance_check**: CHECK on nutritional_guidance
- **nutritionist_session_ratings_professionalism_check**: CHECK on professionalism
- **nutritionist_session_ratings_punctuality_check**: CHECK on punctuality
- **nutritionist_session_ratings_rating_check**: CHECK on rating
- **nutritionist_session_ratings_session_effectiveness_check**: CHECK on session_effectiveness
- **nutritionist_session_ratings_client_id_fkey**: FOREIGN KEY on id
- **nutritionist_session_ratings_nutritionist_id_fkey**: FOREIGN KEY on id
- **nutritionist_session_ratings_session_request_id_fkey**: FOREIGN KEY on id
- **nutritionist_session_ratings_pkey**: PRIMARY KEY on id
- **nutritionist_session_ratings_session_request_id_key**: UNIQUE on session_request_id

#### Foreign Keys

- **client_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **nutritionist_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **session_request_id** → **nutritionist_session_requests.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **nutritionist_session_ratings_pkey**: CREATE UNIQUE INDEX nutritionist_session_ratings_pkey ON public.nutritionist_session_ratings USING btree (id)
- **nutritionist_session_ratings_session_request_id_key**: CREATE UNIQUE INDEX nutritionist_session_ratings_session_request_id_key ON public.nutritionist_session_ratings USING btree (session_request_id)

---

### nutritionist_session_requests

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('nutritionist_session_requests_id_seq'::regclass) |  |
| requester_id | INTEGER | YES | NULL |  |
| nutritionist_id | INTEGER | YES | NULL |  |
| preferred_date | DATE | YES | NULL |  |
| preferred_time | TIME WITHOUT TIME ZONE | YES | NULL |  |
| session_type | VARCHAR(50) | NO | NULL |  |
| message | TEXT | YES | NULL |  |
| status | VARCHAR(20) | YES | 'pending'::character varying |  |
| nutritionist_response | TEXT | YES | NULL |  |
| approved_date | DATE | YES | NULL |  |
| approved_time | TIME WITHOUT TIME ZONE | YES | NULL |  |
| session_price | DECIMAL(10, 2) | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| has_review | BOOLEAN | YES | false |  |

#### Constraints

- **nutritionist_session_requests_session_type_check**: CHECK on session_type
- **nutritionist_session_requests_status_check**: CHECK on status
- **nutritionist_session_requests_nutritionist_id_fkey**: FOREIGN KEY on id
- **nutritionist_session_requests_requester_id_fkey**: FOREIGN KEY on id
- **nutritionist_session_requests_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **nutritionist_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **requester_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **nutritionist_session_requests_pkey**: CREATE UNIQUE INDEX nutritionist_session_requests_pkey ON public.nutritionist_session_requests USING btree (id)

---

### nutritionist_sessions

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('nutritionist_sessions_id_seq'::regclass) |  |
| nutritionist_id | INTEGER | YES | NULL |  |
| client_id | INTEGER | YES | NULL |  |
| session_date | DATE | NO | NULL |  |
| start_time | TIME WITHOUT TIME ZONE | NO | NULL |  |
| end_time | TIME WITHOUT TIME ZONE | NO | NULL |  |
| session_type | VARCHAR(50) | NO | NULL |  |
| status | VARCHAR(20) | YES | 'pending'::character varying |  |
| price | DECIMAL(10, 2) | YES | NULL |  |
| payment_status | VARCHAR(20) | YES | 'pending'::character varying |  |
| notes | TEXT | YES | NULL |  |
| client_notes | TEXT | YES | NULL |  |
| nutritionist_notes | TEXT | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **nutritionist_sessions_payment_status_check**: CHECK on payment_status
- **nutritionist_sessions_session_type_check**: CHECK on session_type
- **nutritionist_sessions_status_check**: CHECK on status
- **nutritionist_sessions_client_id_fkey**: FOREIGN KEY on id
- **nutritionist_sessions_nutritionist_id_fkey**: FOREIGN KEY on id
- **nutritionist_sessions_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **client_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **nutritionist_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **nutritionist_sessions_pkey**: CREATE UNIQUE INDEX nutritionist_sessions_pkey ON public.nutritionist_sessions USING btree (id)

---

### nutritionist_time_off

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('nutritionist_time_off_id_seq'::regclass) |  |
| nutritionist_id | INTEGER | YES | NULL |  |
| start_date | DATE | NO | NULL |  |
| end_date | DATE | NO | NULL |  |
| start_time | TIME WITHOUT TIME ZONE | YES | NULL |  |
| end_time | TIME WITHOUT TIME ZONE | YES | NULL |  |
| reason | VARCHAR(255) | YES | NULL |  |
| is_recurring | BOOLEAN | YES | false |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **nutritionist_time_off_nutritionist_id_fkey**: FOREIGN KEY on id
- **nutritionist_time_off_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **nutritionist_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **nutritionist_time_off_pkey**: CREATE UNIQUE INDEX nutritionist_time_off_pkey ON public.nutritionist_time_off USING btree (id)

---

### nutritionists

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('nutritionists_id_seq'::regclass) |  |
| user_id | INTEGER | NO | NULL |  |
| specialization | ARRAY | YES | NULL |  |
| certification | ARRAY | YES | NULL |  |
| experience_years | INTEGER | YES | 0 |  |
| bio | TEXT | YES | NULL |  |
| hourly_rate | DECIMAL(10, 2) | YES | 0.00 |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **nutritionists_user_id_fkey**: FOREIGN KEY on id
- **nutritionists_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **user_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_nutritionists_user_id**: CREATE INDEX idx_nutritionists_user_id ON public.nutritionists USING btree (user_id)
- **nutritionists_pkey**: CREATE UNIQUE INDEX nutritionists_pkey ON public.nutritionists USING btree (id)

---

### payments

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('payments_id_seq'::regclass) |  |
| user_id | INTEGER | YES | NULL |  |
| amount | DECIMAL(10, 2) | NO | NULL |  |
| payment_type | VARCHAR(50) | NO | NULL |  |
| payment_method | VARCHAR(50) | NO | NULL |  |
| status | VARCHAR(20) | YES | 'pending'::character varying |  |
| transaction_id | VARCHAR(255) | YES | NULL |  |
| description | TEXT | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **payments_payment_method_check**: CHECK on payment_method
- **payments_payment_type_check**: CHECK on payment_type
- **payments_status_check**: CHECK on status
- **payments_user_id_fkey**: FOREIGN KEY on id
- **payments_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **user_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_payments_user_id**: CREATE INDEX idx_payments_user_id ON public.payments USING btree (user_id)
- **payments_pkey**: CREATE UNIQUE INDEX payments_pkey ON public.payments USING btree (id)

---

### plan_change_requests

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('plan_change_requests_id_seq'::regclass) |  |
| user_id | INTEGER | YES | NULL |  |
| current_plan_id | INTEGER | YES | NULL |  |
| new_plan_id | INTEGER | YES | NULL |  |
| current_plan_balance | DECIMAL(10, 2) | NO | NULL |  |
| new_plan_price | DECIMAL(10, 2) | NO | NULL |  |
| balance_difference | DECIMAL(10, 2) | NO | NULL |  |
| status | VARCHAR(20) | YES | 'pending'::character varying |  |
| payment_required | BOOLEAN | YES | false |  |
| payment_amount | DECIMAL(10, 2) | YES | 0.00 |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| completed_at | TIMESTAMP WITHOUT TIME ZONE | YES | NULL |  |

#### Constraints

- **plan_change_requests_status_check**: CHECK on status
- **plan_change_requests_current_plan_id_fkey**: FOREIGN KEY on id
- **plan_change_requests_new_plan_id_fkey**: FOREIGN KEY on id
- **plan_change_requests_user_id_fkey**: FOREIGN KEY on id
- **plan_change_requests_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **current_plan_id** → **membership_plans.id** (ON DELETE: NO ACTION, ON UPDATE: NO ACTION)
- **new_plan_id** → **membership_plans.id** (ON DELETE: NO ACTION, ON UPDATE: NO ACTION)
- **user_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_plan_change_requests_status**: CREATE INDEX idx_plan_change_requests_status ON public.plan_change_requests USING btree (status)
- **idx_plan_change_requests_user_id**: CREATE INDEX idx_plan_change_requests_user_id ON public.plan_change_requests USING btree (user_id)
- **plan_change_requests_pkey**: CREATE UNIQUE INDEX plan_change_requests_pkey ON public.plan_change_requests USING btree (id)

---

### referrals

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('referrals_id_seq'::regclass) |  |
| referrer_id | INTEGER | YES | NULL |  |
| referred_email | VARCHAR(255) | NO | NULL |  |
| referred_user_id | INTEGER | YES | NULL |  |
| promo_code | VARCHAR(50) | NO | NULL |  |
| status | VARCHAR(20) | YES | 'pending'::character varying |  |
| points_awarded | INTEGER | YES | 0 |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| joined_at | TIMESTAMP WITHOUT TIME ZONE | YES | NULL |  |

#### Constraints

- **referrals_status_check**: CHECK on status
- **referrals_referred_user_id_fkey**: FOREIGN KEY on id
- **referrals_referrer_id_fkey**: FOREIGN KEY on id
- **referrals_pkey**: PRIMARY KEY on id
- **referrals_promo_code_key**: UNIQUE on promo_code

#### Foreign Keys

- **referred_user_id** → **users.id** (ON DELETE: SET NULL, ON UPDATE: NO ACTION)
- **referrer_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_referrals_promo_code**: CREATE INDEX idx_referrals_promo_code ON public.referrals USING btree (promo_code)
- **idx_referrals_referrer_id**: CREATE INDEX idx_referrals_referrer_id ON public.referrals USING btree (referrer_id)
- **idx_referrals_status**: CREATE INDEX idx_referrals_status ON public.referrals USING btree (status)
- **referrals_pkey**: CREATE UNIQUE INDEX referrals_pkey ON public.referrals USING btree (id)
- **referrals_promo_code_key**: CREATE UNIQUE INDEX referrals_promo_code_key ON public.referrals USING btree (promo_code)

---

### schedule_exercises

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('schedule_exercises_id_seq'::regclass) |  |
| schedule_id | INTEGER | YES | NULL |  |
| exercise_id | INTEGER | YES | NULL |  |
| muscle_group_id | INTEGER | YES | NULL |  |
| sets | INTEGER | YES | NULL |  |
| reps | VARCHAR(50) | YES | NULL |  |
| weight | DECIMAL(6, 2) | YES | NULL |  |
| rest_seconds | INTEGER | YES | NULL |  |
| order_index | INTEGER | YES | 0 |  |
| notes | TEXT | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| exercise_name | VARCHAR(255) | NO | NULL |  |
| exercise_type | VARCHAR(20) | YES | 'predefined'::character varying |  |

#### Constraints

- **schedule_exercises_exercise_id_fkey**: FOREIGN KEY on id
- **schedule_exercises_muscle_group_id_fkey**: FOREIGN KEY on id
- **schedule_exercises_schedule_id_fkey**: FOREIGN KEY on id
- **schedule_exercises_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **exercise_id** → **exercises.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **muscle_group_id** → **muscle_groups.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **schedule_id** → **member_workout_schedules.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_schedule_exercises_muscle_group**: CREATE INDEX idx_schedule_exercises_muscle_group ON public.schedule_exercises USING btree (muscle_group_id)
- **idx_schedule_exercises_schedule_id**: CREATE INDEX idx_schedule_exercises_schedule_id ON public.schedule_exercises USING btree (schedule_id)
- **schedule_exercises_pkey**: CREATE UNIQUE INDEX schedule_exercises_pkey ON public.schedule_exercises USING btree (id)

---

### schedule_muscle_groups

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('schedule_muscle_groups_id_seq'::regclass) |  |
| schedule_id | INTEGER | YES | NULL |  |
| muscle_group_id | INTEGER | YES | NULL |  |
| order_index | INTEGER | YES | 0 |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **schedule_muscle_groups_muscle_group_id_fkey**: FOREIGN KEY on id
- **schedule_muscle_groups_schedule_id_fkey**: FOREIGN KEY on id
- **schedule_muscle_groups_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **muscle_group_id** → **muscle_groups.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **schedule_id** → **member_workout_schedules.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_schedule_muscle_groups_schedule_id**: CREATE INDEX idx_schedule_muscle_groups_schedule_id ON public.schedule_muscle_groups USING btree (schedule_id)
- **schedule_muscle_groups_pkey**: CREATE UNIQUE INDEX schedule_muscle_groups_pkey ON public.schedule_muscle_groups USING btree (id)

---

### session_notes

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('session_notes_id_seq'::regclass) |  |
| training_session_id | INTEGER | YES | NULL |  |
| trainer_id | INTEGER | YES | NULL |  |
| client_id | INTEGER | YES | NULL |  |
| exercises_performed | ARRAY | YES | NULL |  |
| sets_and_reps | JSONB | YES | NULL |  |
| client_feedback | TEXT | YES | NULL |  |
| trainer_observations | TEXT | YES | NULL |  |
| next_session_goals | TEXT | YES | NULL |  |
| client_progress_notes | TEXT | YES | NULL |  |
| fitness_metrics | JSONB | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **session_notes_client_id_fkey**: FOREIGN KEY on id
- **session_notes_trainer_id_fkey**: FOREIGN KEY on id
- **session_notes_training_session_id_fkey**: FOREIGN KEY on id
- **session_notes_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **client_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **trainer_id** → **trainers.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **training_session_id** → **training_sessions.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_session_notes_client_id**: CREATE INDEX idx_session_notes_client_id ON public.session_notes USING btree (client_id)
- **idx_session_notes_session_id**: CREATE INDEX idx_session_notes_session_id ON public.session_notes USING btree (training_session_id)
- **idx_session_notes_trainer_id**: CREATE INDEX idx_session_notes_trainer_id ON public.session_notes USING btree (trainer_id)
- **session_notes_pkey**: CREATE UNIQUE INDEX session_notes_pkey ON public.session_notes USING btree (id)

---

### session_packages

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('session_packages_id_seq'::regclass) |  |
| client_id | INTEGER | YES | NULL |  |
| trainer_id | INTEGER | YES | NULL |  |
| package_name | VARCHAR(255) | NO | NULL |  |
| total_sessions | INTEGER | NO | NULL |  |
| remaining_sessions | INTEGER | NO | NULL |  |
| price_per_session | DECIMAL(10, 2) | YES | NULL |  |
| total_amount | DECIMAL(10, 2) | YES | NULL |  |
| purchase_date | DATE | NO | NULL |  |
| expiry_date | DATE | YES | NULL |  |
| is_active | BOOLEAN | YES | true |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **session_packages_client_id_fkey**: FOREIGN KEY on id
- **session_packages_trainer_id_fkey**: FOREIGN KEY on id
- **session_packages_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **client_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **trainer_id** → **trainers.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_session_packages_active**: CREATE INDEX idx_session_packages_active ON public.session_packages USING btree (is_active)
- **idx_session_packages_client_id**: CREATE INDEX idx_session_packages_client_id ON public.session_packages USING btree (client_id)
- **idx_session_packages_trainer_id**: CREATE INDEX idx_session_packages_trainer_id ON public.session_packages USING btree (trainer_id)
- **session_packages_pkey**: CREATE UNIQUE INDEX session_packages_pkey ON public.session_packages USING btree (id)

---

### slot_assignments

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('slot_assignments_id_seq'::regclass) |  |
| slot_id | INTEGER | YES | NULL |  |
| assignment_type | VARCHAR(20) | NO | NULL |  |
| assigned_member_id | INTEGER | YES | NULL |  |
| subscription_id | INTEGER | YES | NULL |  |
| booking_id | INTEGER | YES | NULL |  |
| assignment_start_date | DATE | NO | NULL |  |
| assignment_end_date | DATE | YES | NULL |  |
| is_permanent | BOOLEAN | YES | false |  |
| assignment_reason | TEXT | YES | NULL |  |
| created_by_trainer_id | INTEGER | YES | NULL |  |
| status | VARCHAR(20) | NO | 'active'::character varying |  |
| rescheduled_from_slot_id | INTEGER | YES | NULL |  |
| rescheduled_to_slot_id | INTEGER | YES | NULL |  |
| rescheduled_date | TIMESTAMP WITHOUT TIME ZONE | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **slot_assignments_assignment_type_check**: CHECK on assignment_type
- **slot_assignments_status_check**: CHECK on status
- **valid_assignment_dates**: CHECK on assignment_end_date
- **valid_assignment_dates**: CHECK on assignment_start_date
- **slot_assignments_assigned_member_id_fkey**: FOREIGN KEY on id
- **slot_assignments_booking_id_fkey**: FOREIGN KEY on id
- **slot_assignments_created_by_trainer_id_fkey**: FOREIGN KEY on id
- **slot_assignments_rescheduled_from_slot_id_fkey**: FOREIGN KEY on id
- **slot_assignments_rescheduled_to_slot_id_fkey**: FOREIGN KEY on id
- **slot_assignments_slot_id_fkey**: FOREIGN KEY on id
- **slot_assignments_subscription_id_fkey**: FOREIGN KEY on id
- **slot_assignments_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **assigned_member_id** → **users.id** (ON DELETE: SET NULL, ON UPDATE: NO ACTION)
- **booking_id** → **training_sessions.id** (ON DELETE: SET NULL, ON UPDATE: NO ACTION)
- **created_by_trainer_id** → **trainers.id** (ON DELETE: SET NULL, ON UPDATE: NO ACTION)
- **rescheduled_from_slot_id** → **trainer_master_slots.id** (ON DELETE: SET NULL, ON UPDATE: NO ACTION)
- **rescheduled_to_slot_id** → **trainer_master_slots.id** (ON DELETE: SET NULL, ON UPDATE: NO ACTION)
- **slot_id** → **trainer_master_slots.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **subscription_id** → **monthly_plan_subscriptions.id** (ON DELETE: SET NULL, ON UPDATE: NO ACTION)

#### Indexes

- **idx_slot_assignments_dates**: CREATE INDEX idx_slot_assignments_dates ON public.slot_assignments USING btree (assignment_start_date, assignment_end_date)
- **idx_slot_assignments_member_id**: CREATE INDEX idx_slot_assignments_member_id ON public.slot_assignments USING btree (assigned_member_id)
- **idx_slot_assignments_slot_id**: CREATE INDEX idx_slot_assignments_slot_id ON public.slot_assignments USING btree (slot_id)
- **idx_slot_assignments_status**: CREATE INDEX idx_slot_assignments_status ON public.slot_assignments USING btree (status)
- **idx_slot_assignments_type**: CREATE INDEX idx_slot_assignments_type ON public.slot_assignments USING btree (assignment_type)
- **slot_assignments_pkey**: CREATE UNIQUE INDEX slot_assignments_pkey ON public.slot_assignments USING btree (id)

---

### slot_generation_batches

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('slot_generation_batches_id_seq'::regclass) |  |
| trainer_id | INTEGER | YES | NULL |  |
| batch_name | VARCHAR(255) | NO | NULL |  |
| generation_start_date | DATE | NO | NULL |  |
| generation_end_date | DATE | NO | NULL |  |
| slot_duration | INTEGER | NO | 60 |  |
| break_duration | INTEGER | NO | 15 |  |
| selected_days | ARRAY | NO | NULL |  |
| daily_start_time | TIME WITHOUT TIME ZONE | NO | NULL |  |
| daily_end_time | TIME WITHOUT TIME ZONE | NO | NULL |  |
| total_slots_generated | INTEGER | YES | 0 |  |
| generation_date | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| is_active | BOOLEAN | YES | true |  |
| notes | TEXT | YES | NULL |  |

#### Constraints

- **slot_generation_batches_break_duration_check**: CHECK on break_duration
- **slot_generation_batches_selected_days_check**: CHECK on selected_days
- **slot_generation_batches_slot_duration_check**: CHECK on slot_duration
- **valid_date_range**: CHECK on generation_end_date
- **valid_date_range**: CHECK on generation_start_date
- **valid_time_range**: CHECK on daily_start_time
- **valid_time_range**: CHECK on daily_end_time
- **slot_generation_batches_trainer_id_fkey**: FOREIGN KEY on id
- **slot_generation_batches_pkey**: PRIMARY KEY on id
- **unique_trainer_batch_name**: UNIQUE on batch_name
- **unique_trainer_batch_name**: UNIQUE on trainer_id

#### Foreign Keys

- **trainer_id** → **trainers.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_slot_generation_batches_active**: CREATE INDEX idx_slot_generation_batches_active ON public.slot_generation_batches USING btree (is_active)
- **idx_slot_generation_batches_dates**: CREATE INDEX idx_slot_generation_batches_dates ON public.slot_generation_batches USING btree (generation_start_date, generation_end_date)
- **idx_slot_generation_batches_trainer_id**: CREATE INDEX idx_slot_generation_batches_trainer_id ON public.slot_generation_batches USING btree (trainer_id)
- **slot_generation_batches_pkey**: CREATE UNIQUE INDEX slot_generation_batches_pkey ON public.slot_generation_batches USING btree (id)
- **unique_trainer_batch_name**: CREATE UNIQUE INDEX unique_trainer_batch_name ON public.slot_generation_batches USING btree (trainer_id, batch_name)

---

### store_analytics

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('store_analytics_id_seq'::regclass) |  |
| date | DATE | NO | NULL |  |
| total_orders | INTEGER | YES | 0 |  |
| total_revenue | DECIMAL(12, 2) | YES | 0.00 |  |
| total_items_sold | INTEGER | YES | 0 |  |
| unique_customers | INTEGER | YES | 0 |  |
| member_orders | INTEGER | YES | 0 |  |
| guest_orders | INTEGER | YES | 0 |  |
| loyalty_points_earned | INTEGER | YES | 0 |  |
| loyalty_points_used | INTEGER | YES | 0 |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **store_analytics_pkey**: PRIMARY KEY on id
- **store_analytics_date_key**: UNIQUE on date

#### Indexes

- **store_analytics_date_key**: CREATE UNIQUE INDEX store_analytics_date_key ON public.store_analytics USING btree (date)
- **store_analytics_pkey**: CREATE UNIQUE INDEX store_analytics_pkey ON public.store_analytics USING btree (id)

---

### store_cart_items

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('store_cart_items_id_seq'::regclass) |  |
| cart_id | INTEGER | YES | NULL |  |
| item_id | INTEGER | YES | NULL |  |
| quantity | INTEGER | NO | NULL |  |
| price_at_time | DECIMAL(10, 2) | NO | NULL |  |
| member_discount_applied | DECIMAL(10, 2) | YES | 0.00 |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| loyalty_points_discount_applied | DECIMAL(10, 2) | YES | 0.00 |  |

#### Constraints

- **store_cart_items_loyalty_points_discount_applied_check**: CHECK on loyalty_points_discount_applied
- **store_cart_items_quantity_check**: CHECK on quantity
- **store_cart_items_cart_id_fkey**: FOREIGN KEY on id
- **store_cart_items_item_id_fkey**: FOREIGN KEY on id
- **store_cart_items_pkey**: PRIMARY KEY on id
- **store_cart_items_cart_id_item_id_key**: UNIQUE on cart_id
- **store_cart_items_cart_id_item_id_key**: UNIQUE on item_id

#### Foreign Keys

- **cart_id** → **store_carts.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **item_id** → **store_items.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_store_cart_items_cart**: CREATE INDEX idx_store_cart_items_cart ON public.store_cart_items USING btree (cart_id)
- **store_cart_items_cart_id_item_id_key**: CREATE UNIQUE INDEX store_cart_items_cart_id_item_id_key ON public.store_cart_items USING btree (cart_id, item_id)
- **store_cart_items_pkey**: CREATE UNIQUE INDEX store_cart_items_pkey ON public.store_cart_items USING btree (id)

---

### store_carts

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('store_carts_id_seq'::regclass) |  |
| user_id | INTEGER | YES | NULL |  |
| guest_email | VARCHAR(255) | YES | NULL |  |
| guest_name | VARCHAR(255) | YES | NULL |  |
| guest_phone | VARCHAR(20) | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **valid_cart_user**: CHECK on guest_email
- **valid_cart_user**: CHECK on guest_name
- **valid_cart_user**: CHECK on user_id
- **store_carts_user_id_fkey**: FOREIGN KEY on id
- **store_carts_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **user_id** → **users.id** (ON DELETE: SET NULL, ON UPDATE: NO ACTION)

#### Indexes

- **idx_store_carts_guest**: CREATE INDEX idx_store_carts_guest ON public.store_carts USING btree (guest_email)
- **idx_store_carts_user**: CREATE INDEX idx_store_carts_user ON public.store_carts USING btree (user_id)
- **store_carts_pkey**: CREATE UNIQUE INDEX store_carts_pkey ON public.store_carts USING btree (id)

---

### store_categories

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('store_categories_id_seq'::regclass) |  |
| name | VARCHAR(100) | NO | NULL |  |
| description | TEXT | YES | NULL |  |
| is_active | BOOLEAN | YES | true |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **store_categories_pkey**: PRIMARY KEY on id
- **store_categories_name_key**: UNIQUE on name

#### Indexes

- **store_categories_name_key**: CREATE UNIQUE INDEX store_categories_name_key ON public.store_categories USING btree (name)
- **store_categories_pkey**: CREATE UNIQUE INDEX store_categories_pkey ON public.store_categories USING btree (id)

---

### store_inventory_transactions

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('store_inventory_transactions_id_seq'::regclass) |  |
| item_id | INTEGER | YES | NULL |  |
| transaction_type | VARCHAR(20) | NO | NULL |  |
| quantity | INTEGER | NO | NULL |  |
| previous_stock | INTEGER | NO | NULL |  |
| new_stock | INTEGER | NO | NULL |  |
| reference_type | VARCHAR(50) | YES | NULL |  |
| reference_id | INTEGER | YES | NULL |  |
| notes | TEXT | YES | NULL |  |
| created_by | INTEGER | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **store_inventory_transactions_transaction_type_check**: CHECK on transaction_type
- **store_inventory_transactions_created_by_fkey**: FOREIGN KEY on id
- **store_inventory_transactions_item_id_fkey**: FOREIGN KEY on id
- **store_inventory_transactions_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **created_by** → **users.id** (ON DELETE: SET NULL, ON UPDATE: NO ACTION)
- **item_id** → **store_items.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_store_inventory_transactions_item**: CREATE INDEX idx_store_inventory_transactions_item ON public.store_inventory_transactions USING btree (item_id)
- **store_inventory_transactions_pkey**: CREATE UNIQUE INDEX store_inventory_transactions_pkey ON public.store_inventory_transactions USING btree (id)

---

### store_items

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('store_items_id_seq'::regclass) |  |
| category_id | INTEGER | YES | NULL |  |
| name | VARCHAR(255) | NO | NULL |  |
| description | TEXT | YES | NULL |  |
| price | DECIMAL(10, 2) | NO | NULL |  |
| member_discount_percentage | DECIMAL(5, 2) | YES | 0.00 |  |
| stock_quantity | INTEGER | NO | 0 |  |
| low_stock_threshold | INTEGER | YES | 5 |  |
| image_url | TEXT | YES | NULL |  |
| is_active | BOOLEAN | YES | true |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| rating | DECIMAL(3, 2) | YES | 0.00 |  |
| review_count | INTEGER | YES | 0 |  |
| wishlist_count | INTEGER | YES | 0 |  |
| is_featured | BOOLEAN | YES | false |  |
| is_member_only | BOOLEAN | YES | false |  |
| min_loyalty_points_required | INTEGER | YES | 0 |  |
| max_purchase_quantity | INTEGER | YES | 10 |  |

#### Constraints

- **store_items_low_stock_threshold_check**: CHECK on low_stock_threshold
- **store_items_max_purchase_quantity_check**: CHECK on max_purchase_quantity
- **store_items_member_discount_percentage_check**: CHECK on member_discount_percentage
- **store_items_min_loyalty_points_required_check**: CHECK on min_loyalty_points_required
- **store_items_price_check**: CHECK on price
- **store_items_rating_check**: CHECK on rating
- **store_items_review_count_check**: CHECK on review_count
- **store_items_stock_quantity_check**: CHECK on stock_quantity
- **store_items_wishlist_count_check**: CHECK on wishlist_count
- **store_items_category_id_fkey**: FOREIGN KEY on id
- **store_items_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **category_id** → **store_categories.id** (ON DELETE: SET NULL, ON UPDATE: NO ACTION)

#### Indexes

- **idx_store_items_active**: CREATE INDEX idx_store_items_active ON public.store_items USING btree (is_active)
- **idx_store_items_category**: CREATE INDEX idx_store_items_category ON public.store_items USING btree (category_id)
- **store_items_pkey**: CREATE UNIQUE INDEX store_items_pkey ON public.store_items USING btree (id)

---

### store_notifications

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('store_notifications_id_seq'::regclass) |  |
| notification_type | VARCHAR(50) | NO | NULL |  |
| title | VARCHAR(255) | NO | NULL |  |
| message | TEXT | NO | NULL |  |
| target_user_id | INTEGER | YES | NULL |  |
| target_role | VARCHAR(20) | YES | NULL |  |
| is_read | BOOLEAN | YES | false |  |
| action_url | TEXT | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **store_notifications_notification_type_check**: CHECK on notification_type
- **store_notifications_target_role_check**: CHECK on target_role
- **store_notifications_target_user_id_fkey**: FOREIGN KEY on id
- **store_notifications_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **target_user_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **store_notifications_pkey**: CREATE UNIQUE INDEX store_notifications_pkey ON public.store_notifications USING btree (id)

---

### store_order_items

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('store_order_items_id_seq'::regclass) |  |
| order_id | INTEGER | YES | NULL |  |
| item_id | INTEGER | YES | NULL |  |
| quantity | INTEGER | NO | NULL |  |
| price_at_time | DECIMAL(10, 2) | NO | NULL |  |
| member_discount_applied | DECIMAL(10, 2) | YES | 0.00 |  |
| subtotal | DECIMAL(10, 2) | NO | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **store_order_items_quantity_check**: CHECK on quantity
- **store_order_items_subtotal_check**: CHECK on subtotal
- **store_order_items_item_id_fkey**: FOREIGN KEY on id
- **store_order_items_order_id_fkey**: FOREIGN KEY on id
- **store_order_items_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **item_id** → **store_items.id** (ON DELETE: SET NULL, ON UPDATE: NO ACTION)
- **order_id** → **store_orders.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_store_order_items_order**: CREATE INDEX idx_store_order_items_order ON public.store_order_items USING btree (order_id)
- **store_order_items_pkey**: CREATE UNIQUE INDEX store_order_items_pkey ON public.store_order_items USING btree (id)

---

### store_order_status_history

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('store_order_status_history_id_seq'::regclass) |  |
| order_id | INTEGER | YES | NULL |  |
| status | VARCHAR(30) | NO | NULL |  |
| notes | TEXT | YES | NULL |  |
| changed_by | INTEGER | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **store_order_status_history_status_check**: CHECK on status
- **store_order_status_history_changed_by_fkey**: FOREIGN KEY on id
- **store_order_status_history_order_id_fkey**: FOREIGN KEY on id
- **store_order_status_history_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **changed_by** → **users.id** (ON DELETE: SET NULL, ON UPDATE: NO ACTION)
- **order_id** → **store_orders.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_store_order_status_history_order**: CREATE INDEX idx_store_order_status_history_order ON public.store_order_status_history USING btree (order_id)
- **store_order_status_history_pkey**: CREATE UNIQUE INDEX store_order_status_history_pkey ON public.store_order_status_history USING btree (id)

---

### store_orders

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('store_orders_id_seq'::regclass) |  |
| cart_id | INTEGER | YES | NULL |  |
| order_number | VARCHAR(50) | NO | NULL |  |
| customer_name | VARCHAR(255) | NO | NULL |  |
| customer_email | VARCHAR(255) | NO | NULL |  |
| customer_phone | VARCHAR(20) | YES | NULL |  |
| total_amount | DECIMAL(10, 2) | NO | NULL |  |
| member_discount_total | DECIMAL(10, 2) | YES | 0.00 |  |
| final_amount | DECIMAL(10, 2) | NO | NULL |  |
| payment_method | VARCHAR(20) | NO | NULL |  |
| payment_status | VARCHAR(20) | YES | 'pending'::character varying |  |
| order_status | VARCHAR(30) | YES | 'pending'::character varying |  |
| pickup_notes | TEXT | YES | NULL |  |
| admin_notes | TEXT | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| loyalty_points_used | INTEGER | YES | 0 |  |
| loyalty_points_earned | INTEGER | YES | 0 |  |
| loyalty_points_value | DECIMAL(10, 2) | YES | 0.00 |  |
| refund_amount | DECIMAL(10, 2) | YES | 0.00 |  |
| refund_reason | TEXT | YES | NULL |  |
| refunded_at | TIMESTAMP WITHOUT TIME ZONE | YES | NULL |  |
| refunded_by | INTEGER | YES | NULL |  |
| promotional_code | VARCHAR(50) | YES | NULL |  |
| promotional_discount | DECIMAL(10, 2) | YES | 0.00 |  |

#### Constraints

- **store_orders_final_amount_check**: CHECK on final_amount
- **store_orders_loyalty_points_earned_check**: CHECK on loyalty_points_earned
- **store_orders_loyalty_points_used_check**: CHECK on loyalty_points_used
- **store_orders_loyalty_points_value_check**: CHECK on loyalty_points_value
- **store_orders_order_status_check**: CHECK on order_status
- **store_orders_payment_method_check**: CHECK on payment_method
- **store_orders_payment_status_check**: CHECK on payment_status
- **store_orders_promotional_discount_check**: CHECK on promotional_discount
- **store_orders_refund_amount_check**: CHECK on refund_amount
- **store_orders_total_amount_check**: CHECK on total_amount
- **store_orders_cart_id_fkey**: FOREIGN KEY on id
- **store_orders_refunded_by_fkey**: FOREIGN KEY on id
- **store_orders_pkey**: PRIMARY KEY on id
- **store_orders_order_number_key**: UNIQUE on order_number

#### Foreign Keys

- **cart_id** → **store_carts.id** (ON DELETE: SET NULL, ON UPDATE: NO ACTION)
- **refunded_by** → **users.id** (ON DELETE: SET NULL, ON UPDATE: NO ACTION)

#### Indexes

- **idx_store_orders_email**: CREATE INDEX idx_store_orders_email ON public.store_orders USING btree (customer_email)
- **idx_store_orders_number**: CREATE INDEX idx_store_orders_number ON public.store_orders USING btree (order_number)
- **idx_store_orders_status**: CREATE INDEX idx_store_orders_status ON public.store_orders USING btree (order_status)
- **store_orders_order_number_key**: CREATE UNIQUE INDEX store_orders_order_number_key ON public.store_orders USING btree (order_number)
- **store_orders_pkey**: CREATE UNIQUE INDEX store_orders_pkey ON public.store_orders USING btree (id)

---

### store_promotions

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('store_promotions_id_seq'::regclass) |  |
| code | VARCHAR(50) | NO | NULL |  |
| name | VARCHAR(255) | NO | NULL |  |
| description | TEXT | YES | NULL |  |
| discount_type | VARCHAR(20) | NO | NULL |  |
| discount_value | DECIMAL(10, 2) | NO | NULL |  |
| min_order_amount | DECIMAL(10, 2) | YES | 0 |  |
| max_discount_amount | DECIMAL(10, 2) | YES | NULL |  |
| usage_limit | INTEGER | YES | 1 |  |
| used_count | INTEGER | YES | 0 |  |
| is_member_only | BOOLEAN | YES | false |  |
| is_active | BOOLEAN | YES | true |  |
| valid_from | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| valid_until | TIMESTAMP WITHOUT TIME ZONE | YES | NULL |  |
| created_by | INTEGER | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **store_promotions_discount_type_check**: CHECK on discount_type
- **store_promotions_discount_value_check**: CHECK on discount_value
- **store_promotions_min_order_amount_check**: CHECK on min_order_amount
- **store_promotions_usage_limit_check**: CHECK on usage_limit
- **store_promotions_used_count_check**: CHECK on used_count
- **store_promotions_created_by_fkey**: FOREIGN KEY on id
- **store_promotions_pkey**: PRIMARY KEY on id
- **store_promotions_code_key**: UNIQUE on code

#### Foreign Keys

- **created_by** → **users.id** (ON DELETE: SET NULL, ON UPDATE: NO ACTION)

#### Indexes

- **store_promotions_code_key**: CREATE UNIQUE INDEX store_promotions_code_key ON public.store_promotions USING btree (code)
- **store_promotions_pkey**: CREATE UNIQUE INDEX store_promotions_pkey ON public.store_promotions USING btree (id)

---

### store_refunds

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('store_refunds_id_seq'::regclass) |  |
| order_id | INTEGER | YES | NULL |  |
| refund_amount | DECIMAL(10, 2) | NO | NULL |  |
| refund_reason | TEXT | NO | NULL |  |
| refund_method | VARCHAR(50) | NO | NULL |  |
| refund_status | VARCHAR(20) | YES | 'pending'::character varying |  |
| processed_by | INTEGER | YES | NULL |  |
| processed_at | TIMESTAMP WITHOUT TIME ZONE | YES | NULL |  |
| admin_notes | TEXT | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **store_refunds_refund_amount_check**: CHECK on refund_amount
- **store_refunds_refund_method_check**: CHECK on refund_method
- **store_refunds_refund_status_check**: CHECK on refund_status
- **store_refunds_order_id_fkey**: FOREIGN KEY on id
- **store_refunds_processed_by_fkey**: FOREIGN KEY on id
- **store_refunds_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **order_id** → **store_orders.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **processed_by** → **users.id** (ON DELETE: SET NULL, ON UPDATE: NO ACTION)

#### Indexes

- **store_refunds_pkey**: CREATE UNIQUE INDEX store_refunds_pkey ON public.store_refunds USING btree (id)

---

### store_reports

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('store_reports_id_seq'::regclass) |  |
| report_type | VARCHAR(50) | NO | NULL |  |
| report_period | VARCHAR(20) | NO | NULL |  |
| report_data | JSONB | NO | NULL |  |
| generated_by | INTEGER | YES | NULL |  |
| generated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **store_reports_report_period_check**: CHECK on report_period
- **store_reports_report_type_check**: CHECK on report_type
- **store_reports_generated_by_fkey**: FOREIGN KEY on id
- **store_reports_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **generated_by** → **users.id** (ON DELETE: SET NULL, ON UPDATE: NO ACTION)

#### Indexes

- **store_reports_pkey**: CREATE UNIQUE INDEX store_reports_pkey ON public.store_reports USING btree (id)

---

### store_reviews

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('store_reviews_id_seq'::regclass) |  |
| item_id | INTEGER | YES | NULL |  |
| user_id | INTEGER | YES | NULL |  |
| guest_name | VARCHAR(255) | YES | NULL |  |
| guest_email | VARCHAR(255) | YES | NULL |  |
| rating | INTEGER | NO | NULL |  |
| review_text | TEXT | YES | NULL |  |
| is_verified_purchase | BOOLEAN | YES | false |  |
| is_approved | BOOLEAN | YES | true |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **store_reviews_rating_check**: CHECK on rating
- **valid_review_user**: CHECK on guest_name
- **valid_review_user**: CHECK on guest_email
- **valid_review_user**: CHECK on user_id
- **store_reviews_item_id_fkey**: FOREIGN KEY on id
- **store_reviews_user_id_fkey**: FOREIGN KEY on id
- **store_reviews_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **item_id** → **store_items.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **user_id** → **users.id** (ON DELETE: SET NULL, ON UPDATE: NO ACTION)

#### Indexes

- **store_reviews_pkey**: CREATE UNIQUE INDEX store_reviews_pkey ON public.store_reviews USING btree (id)

---

### store_wishlists

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('store_wishlists_id_seq'::regclass) |  |
| user_id | INTEGER | YES | NULL |  |
| item_id | INTEGER | YES | NULL |  |
| added_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **store_wishlists_item_id_fkey**: FOREIGN KEY on id
- **store_wishlists_user_id_fkey**: FOREIGN KEY on id
- **store_wishlists_pkey**: PRIMARY KEY on id
- **store_wishlists_user_id_item_id_key**: UNIQUE on item_id
- **store_wishlists_user_id_item_id_key**: UNIQUE on user_id

#### Foreign Keys

- **item_id** → **store_items.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **user_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **store_wishlists_pkey**: CREATE UNIQUE INDEX store_wishlists_pkey ON public.store_wishlists USING btree (id)
- **store_wishlists_user_id_item_id_key**: CREATE UNIQUE INDEX store_wishlists_user_id_item_id_key ON public.store_wishlists USING btree (user_id, item_id)

---

### subscription_pauses

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('subscription_pauses_id_seq'::regclass) |  |
| user_id | INTEGER | YES | NULL |  |
| pause_start_date | DATE | NO | NULL |  |
| pause_end_date | DATE | NO | NULL |  |
| pause_duration_days | INTEGER | NO | NULL |  |
| reason | TEXT | YES | NULL |  |
| status | VARCHAR(20) | YES | 'active'::character varying |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **subscription_pauses_status_check**: CHECK on status
- **subscription_pauses_user_id_fkey**: FOREIGN KEY on id
- **subscription_pauses_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **user_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **subscription_pauses_pkey**: CREATE UNIQUE INDEX subscription_pauses_pkey ON public.subscription_pauses USING btree (id)

---

### trainer_availability

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('trainer_availability_id_seq'::regclass) |  |
| trainer_id | INTEGER | YES | NULL |  |
| day_of_week | INTEGER | NO | NULL |  |
| start_time | TIME WITHOUT TIME ZONE | NO | NULL |  |
| end_time | TIME WITHOUT TIME ZONE | NO | NULL |  |
| is_available | BOOLEAN | YES | true |  |
| session_duration_minutes | INTEGER | YES | 60 |  |
| max_sessions_per_day | INTEGER | YES | 8 |  |
| break_duration_minutes | INTEGER | YES | 15 |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **trainer_availability_day_of_week_check**: CHECK on day_of_week
- **trainer_availability_trainer_id_fkey**: FOREIGN KEY on id
- **trainer_availability_pkey**: PRIMARY KEY on id
- **trainer_availability_trainer_id_day_of_week_start_time_key**: UNIQUE on day_of_week
- **trainer_availability_trainer_id_day_of_week_start_time_key**: UNIQUE on start_time
- **trainer_availability_trainer_id_day_of_week_start_time_key**: UNIQUE on trainer_id

#### Foreign Keys

- **trainer_id** → **trainers.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_trainer_availability_day**: CREATE INDEX idx_trainer_availability_day ON public.trainer_availability USING btree (day_of_week)
- **idx_trainer_availability_trainer_id**: CREATE INDEX idx_trainer_availability_trainer_id ON public.trainer_availability USING btree (trainer_id)
- **trainer_availability_pkey**: CREATE UNIQUE INDEX trainer_availability_pkey ON public.trainer_availability USING btree (id)
- **trainer_availability_trainer_id_day_of_week_start_time_key**: CREATE UNIQUE INDEX trainer_availability_trainer_id_day_of_week_start_time_key ON public.trainer_availability USING btree (trainer_id, day_of_week, start_time)

---

### trainer_master_slots

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('trainer_master_slots_id_seq'::regclass) |  |
| trainer_id | INTEGER | YES | NULL |  |
| batch_id | INTEGER | YES | NULL |  |
| date | DATE | NO | NULL |  |
| start_time | TIME WITHOUT TIME ZONE | NO | NULL |  |
| end_time | TIME WITHOUT TIME ZONE | NO | NULL |  |
| slot_duration | INTEGER | NO | 60 |  |
| break_duration | INTEGER | NO | 15 |  |
| slot_type | VARCHAR(20) | NO | 'available'::character varying |  |
| session_type | VARCHAR(20) | YES | 'personal'::character varying |  |
| is_active | BOOLEAN | YES | true |  |
| notes | TEXT | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **trainer_master_slots_break_duration_check**: CHECK on break_duration
- **trainer_master_slots_session_type_check**: CHECK on session_type
- **trainer_master_slots_slot_duration_check**: CHECK on slot_duration
- **trainer_master_slots_slot_type_check**: CHECK on slot_type
- **valid_slot_time**: CHECK on end_time
- **valid_slot_time**: CHECK on start_time
- **trainer_master_slots_batch_id_fkey**: FOREIGN KEY on id
- **trainer_master_slots_trainer_id_fkey**: FOREIGN KEY on id
- **trainer_master_slots_pkey**: PRIMARY KEY on id
- **unique_trainer_slot_time**: UNIQUE on start_time
- **unique_trainer_slot_time**: UNIQUE on trainer_id
- **unique_trainer_slot_time**: UNIQUE on date

#### Foreign Keys

- **batch_id** → **slot_generation_batches.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **trainer_id** → **trainers.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_trainer_master_slots_active**: CREATE INDEX idx_trainer_master_slots_active ON public.trainer_master_slots USING btree (is_active)
- **idx_trainer_master_slots_batch**: CREATE INDEX idx_trainer_master_slots_batch ON public.trainer_master_slots USING btree (batch_id)
- **idx_trainer_master_slots_date**: CREATE INDEX idx_trainer_master_slots_date ON public.trainer_master_slots USING btree (date)
- **idx_trainer_master_slots_trainer_id**: CREATE INDEX idx_trainer_master_slots_trainer_id ON public.trainer_master_slots USING btree (trainer_id)
- **idx_trainer_master_slots_type**: CREATE INDEX idx_trainer_master_slots_type ON public.trainer_master_slots USING btree (slot_type)
- **trainer_master_slots_pkey**: CREATE UNIQUE INDEX trainer_master_slots_pkey ON public.trainer_master_slots USING btree (id)
- **unique_trainer_slot_time**: CREATE UNIQUE INDEX unique_trainer_slot_time ON public.trainer_master_slots USING btree (trainer_id, date, start_time)

---

### trainer_monthly_plans

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('trainer_monthly_plans_id_seq'::regclass) |  |
| trainer_id | INTEGER | YES | NULL |  |
| plan_name | VARCHAR(255) | NO | NULL |  |
| monthly_price | DECIMAL(10, 2) | NO | NULL |  |
| sessions_per_month | INTEGER | NO | NULL |  |
| session_duration | INTEGER | NO | 60 |  |
| session_type | VARCHAR(20) | NO | 'personal'::character varying |  |
| max_subscribers | INTEGER | NO | 1 |  |
| is_active | BOOLEAN | YES | true |  |
| requires_admin_approval | BOOLEAN | YES | true |  |
| admin_approved | BOOLEAN | YES | false |  |
| admin_approval_date | TIMESTAMP WITHOUT TIME ZONE | YES | NULL |  |
| admin_approval_notes | TEXT | YES | NULL |  |
| description | TEXT | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **trainer_monthly_plans_max_subscribers_check**: CHECK on max_subscribers
- **trainer_monthly_plans_monthly_price_check**: CHECK on monthly_price
- **trainer_monthly_plans_session_duration_check**: CHECK on session_duration
- **trainer_monthly_plans_session_type_check**: CHECK on session_type
- **trainer_monthly_plans_sessions_per_month_check**: CHECK on sessions_per_month
- **trainer_monthly_plans_trainer_id_fkey**: FOREIGN KEY on id
- **trainer_monthly_plans_pkey**: PRIMARY KEY on id
- **unique_trainer_plan_name**: UNIQUE on plan_name
- **unique_trainer_plan_name**: UNIQUE on trainer_id

#### Foreign Keys

- **trainer_id** → **trainers.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_trainer_monthly_plans_active**: CREATE INDEX idx_trainer_monthly_plans_active ON public.trainer_monthly_plans USING btree (is_active, admin_approved)
- **idx_trainer_monthly_plans_approval**: CREATE INDEX idx_trainer_monthly_plans_approval ON public.trainer_monthly_plans USING btree (requires_admin_approval, admin_approved)
- **idx_trainer_monthly_plans_trainer_id**: CREATE INDEX idx_trainer_monthly_plans_trainer_id ON public.trainer_monthly_plans USING btree (trainer_id)
- **trainer_monthly_plans_pkey**: CREATE UNIQUE INDEX trainer_monthly_plans_pkey ON public.trainer_monthly_plans USING btree (id)
- **unique_trainer_plan_name**: CREATE UNIQUE INDEX unique_trainer_plan_name ON public.trainer_monthly_plans USING btree (trainer_id, plan_name)

---

### trainer_monthly_stats

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('trainer_monthly_stats_id_seq'::regclass) |  |
| trainer_id | INTEGER | YES | NULL |  |
| month_year | DATE | NO | NULL |  |
| total_sessions | INTEGER | YES | 0 |  |
| completed_sessions | INTEGER | YES | 0 |  |
| cancelled_sessions | INTEGER | YES | 0 |  |
| no_show_sessions | INTEGER | YES | 0 |  |
| total_revenue | DECIMAL(10, 2) | YES | 0 |  |
| total_earnings | DECIMAL(10, 2) | YES | 0 |  |
| new_clients | INTEGER | YES | 0 |  |
| active_clients | INTEGER | YES | 0 |  |
| average_rating | DECIMAL(3, 2) | YES | 0 |  |
| total_ratings | INTEGER | YES | 0 |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **trainer_monthly_stats_trainer_id_fkey**: FOREIGN KEY on id
- **trainer_monthly_stats_pkey**: PRIMARY KEY on id
- **trainer_monthly_stats_trainer_id_month_year_key**: UNIQUE on month_year
- **trainer_monthly_stats_trainer_id_month_year_key**: UNIQUE on trainer_id

#### Foreign Keys

- **trainer_id** → **trainers.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_trainer_monthly_stats_month**: CREATE INDEX idx_trainer_monthly_stats_month ON public.trainer_monthly_stats USING btree (month_year)
- **idx_trainer_monthly_stats_trainer_id**: CREATE INDEX idx_trainer_monthly_stats_trainer_id ON public.trainer_monthly_stats USING btree (trainer_id)
- **trainer_monthly_stats_pkey**: CREATE UNIQUE INDEX trainer_monthly_stats_pkey ON public.trainer_monthly_stats USING btree (id)
- **trainer_monthly_stats_trainer_id_month_year_key**: CREATE UNIQUE INDEX trainer_monthly_stats_trainer_id_month_year_key ON public.trainer_monthly_stats USING btree (trainer_id, month_year)

---

### trainer_ratings

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('trainer_ratings_id_seq'::regclass) |  |
| trainer_id | INTEGER | YES | NULL |  |
| client_id | INTEGER | YES | NULL |  |
| training_session_id | INTEGER | YES | NULL |  |
| rating | INTEGER | NO | NULL |  |
| review_text | TEXT | YES | NULL |  |
| training_effectiveness | INTEGER | YES | NULL |  |
| communication | INTEGER | YES | NULL |  |
| punctuality | INTEGER | YES | NULL |  |
| professionalism | INTEGER | YES | NULL |  |
| is_anonymous | BOOLEAN | YES | false |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **trainer_ratings_communication_check**: CHECK on communication
- **trainer_ratings_professionalism_check**: CHECK on professionalism
- **trainer_ratings_punctuality_check**: CHECK on punctuality
- **trainer_ratings_rating_check**: CHECK on rating
- **trainer_ratings_training_effectiveness_check**: CHECK on training_effectiveness
- **trainer_ratings_client_id_fkey**: FOREIGN KEY on id
- **trainer_ratings_trainer_id_fkey**: FOREIGN KEY on id
- **trainer_ratings_training_session_id_fkey**: FOREIGN KEY on id
- **trainer_ratings_pkey**: PRIMARY KEY on id
- **trainer_ratings_training_session_id_key**: UNIQUE on training_session_id

#### Foreign Keys

- **client_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **trainer_id** → **trainers.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **training_session_id** → **training_sessions.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_trainer_ratings_client_id**: CREATE INDEX idx_trainer_ratings_client_id ON public.trainer_ratings USING btree (client_id)
- **idx_trainer_ratings_session_id**: CREATE INDEX idx_trainer_ratings_session_id ON public.trainer_ratings USING btree (training_session_id)
- **idx_trainer_ratings_trainer_id**: CREATE INDEX idx_trainer_ratings_trainer_id ON public.trainer_ratings USING btree (trainer_id)
- **trainer_ratings_pkey**: CREATE UNIQUE INDEX trainer_ratings_pkey ON public.trainer_ratings USING btree (id)
- **trainer_ratings_training_session_id_key**: CREATE UNIQUE INDEX trainer_ratings_training_session_id_key ON public.trainer_ratings USING btree (training_session_id)

---

### trainer_revenue

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('trainer_revenue_id_seq'::regclass) |  |
| trainer_id | INTEGER | YES | NULL |  |
| revenue_date | DATE | NO | NULL |  |
| training_session_id | INTEGER | YES | NULL |  |
| client_id | INTEGER | YES | NULL |  |
| session_type | VARCHAR(50) | YES | NULL |  |
| amount | DECIMAL(10, 2) | NO | NULL |  |
| commission_rate | DECIMAL(4, 2) | YES | 0.70 |  |
| trainer_earnings | DECIMAL(10, 2) | NO | NULL |  |
| gym_commission | DECIMAL(10, 2) | NO | NULL |  |
| payment_method | VARCHAR(50) | YES | NULL |  |
| payment_status | VARCHAR(20) | YES | 'pending'::character varying |  |
| payout_date | DATE | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **trainer_revenue_payment_status_check**: CHECK on payment_status
- **trainer_revenue_client_id_fkey**: FOREIGN KEY on id
- **trainer_revenue_trainer_id_fkey**: FOREIGN KEY on id
- **trainer_revenue_training_session_id_fkey**: FOREIGN KEY on id
- **trainer_revenue_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **client_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **trainer_id** → **trainers.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **training_session_id** → **training_sessions.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_trainer_revenue_client_id**: CREATE INDEX idx_trainer_revenue_client_id ON public.trainer_revenue USING btree (client_id)
- **idx_trainer_revenue_date**: CREATE INDEX idx_trainer_revenue_date ON public.trainer_revenue USING btree (revenue_date)
- **idx_trainer_revenue_trainer_id**: CREATE INDEX idx_trainer_revenue_trainer_id ON public.trainer_revenue USING btree (trainer_id)
- **trainer_revenue_pkey**: CREATE UNIQUE INDEX trainer_revenue_pkey ON public.trainer_revenue USING btree (id)

---

### trainer_schedules

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('trainer_schedules_id_seq'::regclass) |  |
| trainer_id | INTEGER | YES | NULL |  |
| day_of_week | INTEGER | NO | NULL |  |
| time_slot | TIME WITHOUT TIME ZONE | NO | NULL |  |
| status | VARCHAR(20) | YES | 'available'::character varying | Slot status: available=open for booking, pending=session requested waiting for trainer confirmation, booked=session confirmed and scheduled, unavailable=blocked by trainer, break=trainer break time |
| booking_id | INTEGER | YES | NULL |  |
| client_id | INTEGER | YES | NULL |  |
| session_date | DATE | YES | NULL |  |
| notes | TEXT | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **trainer_schedules_day_of_week_check**: CHECK on day_of_week
- **trainer_schedules_status_check**: CHECK on status
- **trainer_schedules_booking_id_fkey**: FOREIGN KEY on id
- **trainer_schedules_client_id_fkey**: FOREIGN KEY on id
- **trainer_schedules_trainer_id_fkey**: FOREIGN KEY on id
- **trainer_schedules_pkey**: PRIMARY KEY on id
- **trainer_schedules_trainer_id_day_of_week_time_slot_key**: UNIQUE on time_slot
- **trainer_schedules_trainer_id_day_of_week_time_slot_key**: UNIQUE on trainer_id
- **trainer_schedules_trainer_id_day_of_week_time_slot_key**: UNIQUE on day_of_week

#### Foreign Keys

- **booking_id** → **training_sessions.id** (ON DELETE: SET NULL, ON UPDATE: NO ACTION)
- **client_id** → **users.id** (ON DELETE: SET NULL, ON UPDATE: NO ACTION)
- **trainer_id** → **trainers.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_trainer_schedules_booking_id**: CREATE INDEX idx_trainer_schedules_booking_id ON public.trainer_schedules USING btree (booking_id)
- **idx_trainer_schedules_client_id**: CREATE INDEX idx_trainer_schedules_client_id ON public.trainer_schedules USING btree (client_id)
- **idx_trainer_schedules_day_time**: CREATE INDEX idx_trainer_schedules_day_time ON public.trainer_schedules USING btree (day_of_week, time_slot)
- **idx_trainer_schedules_session_date**: CREATE INDEX idx_trainer_schedules_session_date ON public.trainer_schedules USING btree (session_date)
- **idx_trainer_schedules_status**: CREATE INDEX idx_trainer_schedules_status ON public.trainer_schedules USING btree (status)
- **idx_trainer_schedules_trainer_id**: CREATE INDEX idx_trainer_schedules_trainer_id ON public.trainer_schedules USING btree (trainer_id)
- **trainer_schedules_pkey**: CREATE UNIQUE INDEX trainer_schedules_pkey ON public.trainer_schedules USING btree (id)
- **trainer_schedules_trainer_id_day_of_week_time_slot_key**: CREATE UNIQUE INDEX trainer_schedules_trainer_id_day_of_week_time_slot_key ON public.trainer_schedules USING btree (trainer_id, day_of_week, time_slot)

---

### trainer_time_off

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('trainer_time_off_id_seq'::regclass) |  |
| trainer_id | INTEGER | YES | NULL |  |
| start_date | DATE | NO | NULL |  |
| end_date | DATE | NO | NULL |  |
| start_time | TIME WITHOUT TIME ZONE | YES | NULL |  |
| end_time | TIME WITHOUT TIME ZONE | YES | NULL |  |
| reason | VARCHAR(255) | YES | NULL |  |
| is_recurring | BOOLEAN | YES | false |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **trainer_time_off_trainer_id_fkey**: FOREIGN KEY on id
- **trainer_time_off_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **trainer_id** → **trainers.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_trainer_time_off_date**: CREATE INDEX idx_trainer_time_off_date ON public.trainer_time_off USING btree (start_date, end_date)
- **idx_trainer_time_off_trainer_id**: CREATE INDEX idx_trainer_time_off_trainer_id ON public.trainer_time_off USING btree (trainer_id)
- **trainer_time_off_pkey**: CREATE UNIQUE INDEX trainer_time_off_pkey ON public.trainer_time_off USING btree (id)

---

### trainers

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('trainers_id_seq'::regclass) |  |
| user_id | INTEGER | YES | NULL |  |
| specialization | ARRAY | YES | NULL |  |
| certification | ARRAY | YES | NULL |  |
| experience_years | INTEGER | YES | NULL |  |
| bio | TEXT | YES | NULL |  |
| hourly_rate | DECIMAL(10, 2) | YES | NULL |  |
| availability | JSONB | YES | NULL |  |
| rating | DECIMAL(3, 2) | YES | 0 |  |
| total_sessions | INTEGER | YES | 0 |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| profile_image | TEXT | YES | NULL | Path to trainer profile image file |

#### Constraints

- **trainers_user_id_fkey**: FOREIGN KEY on id
- **trainers_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **user_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **trainers_pkey**: CREATE UNIQUE INDEX trainers_pkey ON public.trainers USING btree (id)

---

### training_requests

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('training_requests_id_seq'::regclass) |  |
| requester_id | INTEGER | YES | NULL |  |
| trainer_id | INTEGER | YES | NULL |  |
| requester_email | VARCHAR(255) | NO | NULL |  |
| requester_name | VARCHAR(255) | NO | NULL |  |
| requester_phone | VARCHAR(20) | YES | NULL |  |
| request_type | VARCHAR(50) | NO | NULL |  |
| preferred_date | DATE | YES | NULL |  |
| preferred_time | TIME WITHOUT TIME ZONE | YES | NULL |  |
| message | TEXT | YES | NULL |  |
| status | VARCHAR(20) | YES | 'pending'::character varying |  |
| trainer_response | TEXT | YES | NULL |  |
| approved_date | DATE | YES | NULL |  |
| approved_time | TIME WITHOUT TIME ZONE | YES | NULL |  |
| session_price | DECIMAL(10, 2) | YES | NULL |  |
| is_member | BOOLEAN | YES | false |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **training_requests_request_type_check**: CHECK on request_type
- **training_requests_status_check**: CHECK on status
- **training_requests_requester_id_fkey**: FOREIGN KEY on id
- **training_requests_trainer_id_fkey**: FOREIGN KEY on id
- **training_requests_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **requester_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **trainer_id** → **trainers.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_training_requests_date**: CREATE INDEX idx_training_requests_date ON public.training_requests USING btree (preferred_date)
- **idx_training_requests_requester_id**: CREATE INDEX idx_training_requests_requester_id ON public.training_requests USING btree (requester_id)
- **idx_training_requests_status**: CREATE INDEX idx_training_requests_status ON public.training_requests USING btree (status)
- **idx_training_requests_trainer_id**: CREATE INDEX idx_training_requests_trainer_id ON public.training_requests USING btree (trainer_id)
- **training_requests_pkey**: CREATE UNIQUE INDEX training_requests_pkey ON public.training_requests USING btree (id)

---

### training_revenue

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('training_revenue_id_seq'::regclass) |  |
| revenue_id | INTEGER | YES | NULL |  |
| training_session_id | INTEGER | YES | NULL |  |
| session_type | VARCHAR(50) | YES | NULL |  |
| session_duration_minutes | INTEGER | YES | NULL |  |
| trainer_hourly_rate | DECIMAL(10, 2) | YES | NULL |  |
| gym_commission_rate | DECIMAL(4, 2) | YES | NULL |  |
| trainer_earnings | DECIMAL(10, 2) | YES | NULL |  |
| gym_earnings | DECIMAL(10, 2) | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **training_revenue_pkey**: PRIMARY KEY on id

#### Indexes

- **idx_training_revenue_revenue_id**: CREATE INDEX idx_training_revenue_revenue_id ON public.training_revenue USING btree (revenue_id)
- **training_revenue_pkey**: CREATE UNIQUE INDEX training_revenue_pkey ON public.training_revenue USING btree (id)

---

### training_sessions

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('training_sessions_id_seq'::regclass) |  |
| trainer_id | INTEGER | YES | NULL |  |
| client_id | INTEGER | YES | NULL |  |
| session_date | DATE | NO | NULL |  |
| start_time | TIME WITHOUT TIME ZONE | NO | NULL |  |
| end_time | TIME WITHOUT TIME ZONE | NO | NULL |  |
| session_type | VARCHAR(50) | NO | NULL |  |
| status | VARCHAR(20) | YES | 'scheduled'::character varying | Session status: pending=waiting for trainer confirmation, confirmed=trainer accepted, scheduled=confirmed and ready, completed=session finished, cancelled=session cancelled, no_show=client didnt show, rejected=trainer rejected |
| price | DECIMAL(10, 2) | YES | NULL |  |
| payment_status | VARCHAR(20) | YES | 'pending'::character varying |  |
| notes | TEXT | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **training_sessions_payment_status_check**: CHECK on payment_status
- **training_sessions_session_type_check**: CHECK on session_type
- **training_sessions_status_check**: CHECK on status
- **training_sessions_client_id_fkey**: FOREIGN KEY on id
- **training_sessions_trainer_id_fkey**: FOREIGN KEY on id
- **training_sessions_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **client_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)
- **trainer_id** → **trainers.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_training_sessions_client_id**: CREATE INDEX idx_training_sessions_client_id ON public.training_sessions USING btree (client_id)
- **idx_training_sessions_date**: CREATE INDEX idx_training_sessions_date ON public.training_sessions USING btree (session_date)
- **idx_training_sessions_status**: CREATE INDEX idx_training_sessions_status ON public.training_sessions USING btree (status)
- **idx_training_sessions_trainer_id**: CREATE INDEX idx_training_sessions_trainer_id ON public.training_sessions USING btree (trainer_id)
- **training_sessions_pkey**: CREATE UNIQUE INDEX training_sessions_pkey ON public.training_sessions USING btree (id)

---

### users

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('users_id_seq'::regclass) |  |
| email | VARCHAR(255) | NO | NULL |  |
| password_hash | VARCHAR(255) | NO | NULL |  |
| first_name | VARCHAR(100) | NO | NULL |  |
| last_name | VARCHAR(100) | NO | NULL |  |
| role | VARCHAR(50) | NO | NULL |  |
| phone | VARCHAR(20) | YES | NULL |  |
| date_of_birth | DATE | YES | NULL |  |
| gender | VARCHAR(10) | YES | NULL |  |
| address | TEXT | YES | NULL |  |
| emergency_contact | VARCHAR(255) | YES | NULL |  |
| membership_type | VARCHAR(50) | YES | NULL |  |
| membership_start_date | DATE | YES | NULL |  |
| membership_end_date | DATE | YES | NULL |  |
| is_active | BOOLEAN | YES | true |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| updated_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |
| subscription_status | VARCHAR(20) | YES | 'active'::character varying |  |
| rating | DECIMAL(3, 2) | YES | 0 |  |

#### Constraints

- **users_role_check**: CHECK on role
- **users_subscription_status_check**: CHECK on subscription_status
- **users_pkey**: PRIMARY KEY on id
- **users_email_key**: UNIQUE on email

#### Indexes

- **idx_users_email**: CREATE INDEX idx_users_email ON public.users USING btree (email)
- **idx_users_role**: CREATE INDEX idx_users_role ON public.users USING btree (role)
- **idx_users_subscription_status**: CREATE INDEX idx_users_subscription_status ON public.users USING btree (subscription_status)
- **users_email_key**: CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email)
- **users_pkey**: CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id)

---

### weight_tracking

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('weight_tracking_id_seq'::regclass) |  |
| user_id | INTEGER | YES | NULL |  |
| weight | DECIMAL(5, 2) | NO | NULL |  |
| height | DECIMAL(5, 2) | YES | NULL |  |
| recorded_date | DATE | NO | NULL |  |
| notes | TEXT | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **weight_tracking_user_id_fkey**: FOREIGN KEY on id
- **weight_tracking_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **user_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_weight_tracking_user_date**: CREATE INDEX idx_weight_tracking_user_date ON public.weight_tracking USING btree (user_id, recorded_date DESC)
- **weight_tracking_pkey**: CREATE UNIQUE INDEX weight_tracking_pkey ON public.weight_tracking USING btree (id)

---

### workout_logs

#### Columns

| Column Name | Data Type | Nullable | Default | Description |
|-------------|-----------|----------|---------|-------------|
| id | INTEGER | NO | nextval('workout_logs_id_seq'::regclass) |  |
| user_id | INTEGER | YES | NULL |  |
| workout_date | DATE | NO | NULL |  |
| workout_type | VARCHAR(100) | YES | NULL |  |
| duration_minutes | INTEGER | YES | NULL |  |
| calories_burned | INTEGER | YES | NULL |  |
| notes | TEXT | YES | NULL |  |
| created_at | TIMESTAMP WITHOUT TIME ZONE | YES | CURRENT_TIMESTAMP |  |

#### Constraints

- **workout_logs_user_id_fkey**: FOREIGN KEY on id
- **workout_logs_pkey**: PRIMARY KEY on id

#### Foreign Keys

- **user_id** → **users.id** (ON DELETE: CASCADE, ON UPDATE: NO ACTION)

#### Indexes

- **idx_workout_logs_date**: CREATE INDEX idx_workout_logs_date ON public.workout_logs USING btree (workout_date)
- **idx_workout_logs_user_id**: CREATE INDEX idx_workout_logs_user_id ON public.workout_logs USING btree (user_id)
- **workout_logs_pkey**: CREATE UNIQUE INDEX workout_logs_pkey ON public.workout_logs USING btree (id)

---

## Database Relationships

### Entity Relationship Overview

| Table | Foreign Key | References |
|-------|-------------|------------|
| booking_reviews | booking_id | bookings.id |
| booking_reviews | user_id | users.id |
| bookings | class_id | classes.id |
| bookings | trainer_id | trainers.id |
| bookings | user_id | users.id |
| cancellation_policies | facility_id | facilities.id |
| chat_messages | diet_plan_request_id | diet_plan_requests.id |
| chat_messages | sender_id | users.id |
| class_schedules | class_id | classes.id |
| classes | trainer_id | trainers.id |
| client_progress | client_id | users.id |
| client_progress | trainer_id | trainers.id |
| client_trainer_subscriptions | client_id | users.id |
| client_trainer_subscriptions | trainer_id | trainers.id |
| comprehensive_diet_plans | client_id | users.id |
| comprehensive_diet_plans | diet_plan_request_id | diet_plan_requests.id |
| comprehensive_diet_plans | nutritionist_id | users.id |
| deleted_users | deleted_by_admin_id | users.id |
| diet_plan_requests | nutritionist_id | users.id |
| diet_plan_requests | user_id | users.id |
| exercises | primary_muscle_group_id | muscle_groups.id |
| facility_analytics | facility_id | facilities.id |
| facility_availability_exceptions | facility_id | facilities.id |
| facility_bookings | facility_id | facilities.id |
| facility_bookings | slot_id | facility_slots.id |
| facility_bookings | user_id | users.id |
| facility_pricing | facility_id | facilities.id |
| facility_schedules | facility_id | facilities.id |
| facility_slots | facility_id | facilities.id |
| facility_waitlist | facility_id | facilities.id |
| facility_waitlist | user_id | users.id |
| front_desk_staff | user_id | users.id |
| gym_visits | user_id | users.id |
| loyalty_transactions | user_id | users.id |
| meal_plan_template_foods | meal_id | meal_plan_template_meals.id |
| meal_plan_template_meals | template_id | meal_plan_templates.id |
| meal_plan_templates | nutritionist_id | users.id |
| member_balance | user_id | users.id |
| member_balance_transactions | user_id | users.id |
| member_invites | user_id | users.id |
| member_profiles | current_plan_id | membership_plans.id |
| member_profiles | user_id | users.id |
| member_workout_schedules | user_id | users.id |
| monthly_plan_session_assignments | rescheduled_from_slot_id | trainer_master_slots.id |
| monthly_plan_session_assignments | rescheduled_to_slot_id | trainer_master_slots.id |
| monthly_plan_session_assignments | slot_assignment_id | slot_assignments.id |
| monthly_plan_session_assignments | slot_id | trainer_master_slots.id |
| monthly_plan_session_assignments | subscription_id | monthly_plan_subscriptions.id |
| monthly_plan_subscriptions | member_id | users.id |
| monthly_plan_subscriptions | plan_id | trainer_monthly_plans.id |
| monthly_plan_subscriptions | trainer_id | trainers.id |
| nutrition_consultations | nutritionist_id | users.id |
| nutrition_consultations | user_id | users.id |
| nutritionist_availability | nutritionist_id | users.id |
| nutritionist_diet_plan_ratings | client_id | users.id |
| nutritionist_diet_plan_ratings | diet_plan_request_id | diet_plan_requests.id |
| nutritionist_diet_plan_ratings | nutritionist_id | users.id |
| nutritionist_schedules | booking_id | nutritionist_sessions.id |
| nutritionist_schedules | client_id | users.id |
| nutritionist_schedules | nutritionist_id | users.id |
| nutritionist_session_ratings | client_id | users.id |
| nutritionist_session_ratings | nutritionist_id | users.id |
| nutritionist_session_ratings | session_request_id | nutritionist_session_requests.id |
| nutritionist_session_requests | nutritionist_id | users.id |
| nutritionist_session_requests | requester_id | users.id |
| nutritionist_sessions | client_id | users.id |
| nutritionist_sessions | nutritionist_id | users.id |
| nutritionist_time_off | nutritionist_id | users.id |
| nutritionists | user_id | users.id |
| payments | user_id | users.id |
| plan_change_requests | current_plan_id | membership_plans.id |
| plan_change_requests | new_plan_id | membership_plans.id |
| plan_change_requests | user_id | users.id |
| referrals | referred_user_id | users.id |
| referrals | referrer_id | users.id |
| schedule_exercises | exercise_id | exercises.id |
| schedule_exercises | muscle_group_id | muscle_groups.id |
| schedule_exercises | schedule_id | member_workout_schedules.id |
| schedule_muscle_groups | muscle_group_id | muscle_groups.id |
| schedule_muscle_groups | schedule_id | member_workout_schedules.id |
| session_notes | client_id | users.id |
| session_notes | trainer_id | trainers.id |
| session_notes | training_session_id | training_sessions.id |
| session_packages | client_id | users.id |
| session_packages | trainer_id | trainers.id |
| slot_assignments | assigned_member_id | users.id |
| slot_assignments | booking_id | training_sessions.id |
| slot_assignments | created_by_trainer_id | trainers.id |
| slot_assignments | rescheduled_from_slot_id | trainer_master_slots.id |
| slot_assignments | rescheduled_to_slot_id | trainer_master_slots.id |
| slot_assignments | slot_id | trainer_master_slots.id |
| slot_assignments | subscription_id | monthly_plan_subscriptions.id |
| slot_generation_batches | trainer_id | trainers.id |
| store_cart_items | cart_id | store_carts.id |
| store_cart_items | item_id | store_items.id |
| store_carts | user_id | users.id |
| store_inventory_transactions | created_by | users.id |
| store_inventory_transactions | item_id | store_items.id |
| store_items | category_id | store_categories.id |
| store_notifications | target_user_id | users.id |
| store_order_items | item_id | store_items.id |
| store_order_items | order_id | store_orders.id |
| store_order_status_history | changed_by | users.id |
| store_order_status_history | order_id | store_orders.id |
| store_orders | cart_id | store_carts.id |
| store_orders | refunded_by | users.id |
| store_promotions | created_by | users.id |
| store_refunds | order_id | store_orders.id |
| store_refunds | processed_by | users.id |
| store_reports | generated_by | users.id |
| store_reviews | item_id | store_items.id |
| store_reviews | user_id | users.id |
| store_wishlists | item_id | store_items.id |
| store_wishlists | user_id | users.id |
| subscription_pauses | user_id | users.id |
| trainer_availability | trainer_id | trainers.id |
| trainer_master_slots | batch_id | slot_generation_batches.id |
| trainer_master_slots | trainer_id | trainers.id |
| trainer_monthly_plans | trainer_id | trainers.id |
| trainer_monthly_stats | trainer_id | trainers.id |
| trainer_ratings | client_id | users.id |
| trainer_ratings | trainer_id | trainers.id |
| trainer_ratings | training_session_id | training_sessions.id |
| trainer_revenue | client_id | users.id |
| trainer_revenue | trainer_id | trainers.id |
| trainer_revenue | training_session_id | training_sessions.id |
| trainer_schedules | booking_id | training_sessions.id |
| trainer_schedules | client_id | users.id |
| trainer_schedules | trainer_id | trainers.id |
| trainer_time_off | trainer_id | trainers.id |
| trainers | user_id | users.id |
| training_requests | requester_id | users.id |
| training_requests | trainer_id | trainers.id |
| training_sessions | client_id | users.id |
| training_sessions | trainer_id | trainers.id |
| weight_tracking | user_id | users.id |
| workout_logs | user_id | users.id |

## Table Categories

### User Management

- **users**
- **deleted_users**
- **member_profiles**

### Trainer System

- **trainers**
- **trainer_availability**
- **trainer_time_off**
- **trainer_monthly_plans**
- **trainer_master_slots**
- **trainer_monthly_stats**
- **trainer_ratings**
- **trainer_revenue**

### Booking System

- **bookings**
- **booking_reviews**
- **training_sessions**
- **session_notes**
- **training_requests**

### Class Management

- **classes**
- **class_schedules**

### Membership & Plans

- **membership_plans**
- **client_trainer_subscriptions**
- **monthly_plan_subscriptions**
- **slot_assignments**
- **monthly_plan_session_assignments**

### Workout & Exercise

- **workout_logs**
- **muscle_groups**
- **exercises**
- **member_workout_schedules**
- **schedule_muscle_groups**
- **schedule_exercises**
- **weight_tracking**

### Facilities

- **facilities**
- **facility_schedules**
- **facility_pricing**
- **facility_slots**
- **facility_bookings**
- **facility_availability_exceptions**
- **facility_waitlist**
- **facility_analytics**
- **cancellation_policies**

### Store System

- **store_categories**
- **store_items**
- **store_carts**
- **store_cart_items**
- **store_orders**
- **store_order_items**
- **store_order_status_history**
- **store_inventory_transactions**

### Loyalty & Referrals

- **referrals**
- **loyalty_transactions**
- **member_invites**
- **gym_visits**

### Nutrition

- **nutrition_consultations**
- **diet_plan_requests**

### Equipment

- **equipment**

### Payments

- **payments**

### Revenue Tracking

- **gym_revenue**
- **membership_revenue**
- **training_revenue**
- **class_revenue**
- **daily_revenue_summary**
- **monthly_revenue_summary**

### Member Balance

- **member_balance**
- **member_balance_transactions**
- **plan_change_requests**

### Slot Management

- **slot_generation_batches**

### Client Progress

- **client_progress**

### Session Packages

- **session_packages**

## Schema Files Reference

The database schema is defined in the following files:

- **Main Schema**: `backend/src/schema.sql` - Core tables for users, trainers, classes, bookings
- **Store System**: `backend/complete-store-schema.sql` - Online store tables
- **Monthly Plans**: `backend/src/database/schemas/monthly-plan-system.sql` - Trainer monthly subscription system
- **Facilities**: `backend/src/database/schemas/facilities-system.sql` - Facility booking system
- **Revenue System**: `backend/src/database/schemas/gym-revenue.sql` - Revenue tracking
- **Member Balance**: `backend/src/database/schemas/member-balance.sql` - Member balance system
- **Diet Plans**: `backend/src/database/migrations/add-diet-plan-requests-table.sql` - Diet plan requests
- **Deleted Users**: `backend/src/create-deleted-users-table.sql` - User deletion tracking

