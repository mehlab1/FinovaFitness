-- Database Indexes for Better Performance

-- Core table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_class_id ON bookings(class_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_classes_category ON classes(category);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_id ON workout_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_date ON workout_logs(workout_date);

-- Member profile indexes
CREATE INDEX IF NOT EXISTS idx_member_profiles_user_id ON member_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_member_profiles_plan_id ON member_profiles(current_plan_id);

-- Referral system indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_promo_code ON referrals(promo_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- Loyalty transactions indexes
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user_id ON loyalty_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_type ON loyalty_transactions(transaction_type);

-- Exercise and muscle group indexes
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group ON exercises(primary_muscle_group_id);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty_level);

-- Workout schedule indexes
CREATE INDEX IF NOT EXISTS idx_workout_schedules_user_id ON member_workout_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_schedules_day ON member_workout_schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_schedule_muscle_groups_schedule_id ON schedule_muscle_groups(schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_exercises_schedule_id ON schedule_exercises(schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_exercises_muscle_group ON schedule_exercises(muscle_group_id);

-- Gym visits indexes
CREATE INDEX IF NOT EXISTS idx_gym_visits_user_id ON gym_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_visits_date ON gym_visits(visit_date);

-- Booking reviews indexes
CREATE INDEX IF NOT EXISTS idx_booking_reviews_booking_id ON booking_reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_reviews_user_id ON booking_reviews(user_id);

-- Trainer portal indexes
CREATE INDEX IF NOT EXISTS idx_training_sessions_trainer_id ON training_sessions(trainer_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_client_id ON training_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_date ON training_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_training_sessions_status ON training_sessions(status);

CREATE INDEX IF NOT EXISTS idx_session_packages_client_id ON session_packages(client_id);
CREATE INDEX IF NOT EXISTS idx_session_packages_trainer_id ON session_packages(trainer_id);
CREATE INDEX IF NOT EXISTS idx_session_packages_active ON session_packages(is_active);

CREATE INDEX IF NOT EXISTS idx_trainer_availability_trainer_id ON trainer_availability(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_availability_day ON trainer_availability(day_of_week);

CREATE INDEX IF NOT EXISTS idx_trainer_time_off_trainer_id ON trainer_time_off(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_time_off_date ON trainer_time_off(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_session_notes_session_id ON session_notes(training_session_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_trainer_id ON session_notes(trainer_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_client_id ON session_notes(client_id);

CREATE INDEX IF NOT EXISTS idx_training_requests_trainer_id ON training_requests(trainer_id);
CREATE INDEX IF NOT EXISTS idx_training_requests_requester_id ON training_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_training_requests_status ON training_requests(status);
CREATE INDEX IF NOT EXISTS idx_training_requests_date ON training_requests(preferred_date);

CREATE INDEX IF NOT EXISTS idx_trainer_ratings_trainer_id ON trainer_ratings(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_ratings_client_id ON trainer_ratings(client_id);
CREATE INDEX IF NOT EXISTS idx_trainer_ratings_session_id ON trainer_ratings(training_session_id);

CREATE INDEX IF NOT EXISTS idx_client_progress_client_id ON client_progress(client_id);
CREATE INDEX IF NOT EXISTS idx_client_progress_trainer_id ON client_progress(trainer_id);
CREATE INDEX IF NOT EXISTS idx_client_progress_date ON client_progress(progress_date);

CREATE INDEX IF NOT EXISTS idx_trainer_revenue_trainer_id ON trainer_revenue(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_revenue_date ON trainer_revenue(revenue_date);
CREATE INDEX IF NOT EXISTS idx_trainer_revenue_client_id ON trainer_revenue(client_id);

CREATE INDEX IF NOT EXISTS idx_trainer_monthly_stats_trainer_id ON trainer_monthly_stats(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_monthly_stats_month ON trainer_monthly_stats(month_year);

CREATE INDEX IF NOT EXISTS idx_client_trainer_subs_client_id ON client_trainer_subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_client_trainer_subs_trainer_id ON client_trainer_subscriptions(trainer_id);
CREATE INDEX IF NOT EXISTS idx_client_trainer_subs_status ON client_trainer_subscriptions(status);
