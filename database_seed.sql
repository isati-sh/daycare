-- Supabase Database Seed Data
-- This assumes the enum types are already created in your database

-- Clear existing data (optional - remove if you want to preserve existing data)
TRUNCATE TABLE billing CASCADE;
TRUNCATE TABLE enrollment_applications CASCADE;
TRUNCATE TABLE contact_submissions CASCADE;
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE announcements CASCADE;
TRUNCATE TABLE activities CASCADE;
TRUNCATE TABLE daily_schedules CASCADE;
TRUNCATE TABLE planned_activities CASCADE;
TRUNCATE TABLE incident_reports CASCADE;
TRUNCATE TABLE development_milestones CASCADE;
TRUNCATE TABLE portfolio_entries CASCADE;
TRUNCATE TABLE attendance CASCADE;
TRUNCATE TABLE teacher_assignments CASCADE;
TRUNCATE TABLE daily_logs CASCADE;
TRUNCATE TABLE children CASCADE;

-- Seed data for existing 3 users in profiles table
-- This assumes the users already exist in the profiles table

-- Update existing profiles with additional data (using UPSERT)
INSERT INTO profiles (id, site_role, email, full_name, phone, address, emergency_contact, active_status, last_login) VALUES
('48abd6fc-eb67-4170-83fd-a3f5670412fd', 'admin', 'admin@daycare.com', 'Sarah Johnson', '555-0101', '123 Admin St, City, ST 12345', 'Emergency Admin Contact: 555-0102', true, NOW() - INTERVAL '1 hour'),
('f5c5bef8-c2c5-4703-b6fb-e63952bf8214', 'parent', 'parent@example.com', 'Michael Smith', '555-0201', '456 Parent Ave, City, ST 12345', 'Grandma Smith: 555-0202', true, NOW() - INTERVAL '2 hours'),
('f8745e5e-d84b-41ec-8076-54744b93d875', 'teacher', 'teacher@daycare.com', 'Emma Wilson', '555-0301', '789 Teacher Blvd, City, ST 12345', 'Teacher Emergency: 555-0302', true, NOW() - INTERVAL '30 minutes')
ON CONFLICT (id) DO UPDATE SET
  site_role = EXCLUDED.site_role,
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  emergency_contact = EXCLUDED.emergency_contact,
  active_status = EXCLUDED.active_status,
  last_login = EXCLUDED.last_login,
  updated_at = NOW();

-- Insert one child for the parent
INSERT INTO children (id, parent_id, teacher_id, first_name, last_name, date_of_birth, age_group, status, enrollment_date, allergies, medical_notes, emergency_contact) VALUES
(uuid_generate_v4(), 'f5c5bef8-c2c5-4703-b6fb-e63952bf8214', 'f8745e5e-d84b-41ec-8076-54744b93d875', 'Oliver', 'Smith', '2022-03-15', 'toddler', 'active', '2024-01-15', ARRAY['peanuts'], 'No known medical conditions', 'Grandma Smith: 555-0202');

-- Insert teacher assignment
INSERT INTO teacher_assignments (id, teacher_id, child_id, assigned_date, status, notes) VALUES
(uuid_generate_v4(), 'f8745e5e-d84b-41ec-8076-54744b93d875', (SELECT id FROM children WHERE first_name = 'Oliver' AND last_name = 'Smith'), '2024-01-15', 'active', 'Primary teacher for Oliver');

-- Insert daily log for today
INSERT INTO daily_logs (id, child_id, teacher_id, date, meals, drinks, naps, activities, notes, mood, behavior, bathroom_visits, diaper_changes, photos) VALUES
(uuid_generate_v4(), (SELECT id FROM children WHERE first_name = 'Oliver' AND last_name = 'Smith'), 'f8745e5e-d84b-41ec-8076-54744b93d875', CURRENT_DATE, 
 '[{"type": "breakfast", "time": "08:30", "eaten": "most"}, {"type": "lunch", "time": "12:00", "eaten": "all"}]'::jsonb,
 '[{"type": "water", "time": "09:00", "amount": "4oz"}, {"type": "milk", "time": "12:30", "amount": "6oz"}]'::jsonb,
 '{"afternoon_start": "13:00", "afternoon_end": "14:30"}'::jsonb,
 ARRAY['circle time', 'outdoor play', 'art project'], 'Had a great day! Very engaged during story time.', 'happy', 'excellent', 3, 2, ARRAY[]::TEXT[]);

-- Insert attendance record
INSERT INTO attendance (id, child_id, date, check_in_time, check_out_time, status, notes, recorded_by) VALUES
(uuid_generate_v4(), (SELECT id FROM children WHERE first_name = 'Oliver' AND last_name = 'Smith'), CURRENT_DATE, '08:00', '17:00', 'present', 'On time', 'f8745e5e-d84b-41ec-8076-54744b93d875');

-- Insert portfolio entry
INSERT INTO portfolio_entries (id, child_id, title, description, category, date, photos, teacher_notes) VALUES
(uuid_generate_v4(), (SELECT id FROM children WHERE first_name = 'Oliver' AND last_name = 'Smith'), 'First Painting', 'Oliver created his first finger painting using blue and yellow colors', 'art', CURRENT_DATE - INTERVAL '2 days', ARRAY[]::TEXT[], 'Showed great creativity and color recognition');

-- Insert development milestone
INSERT INTO development_milestones (id, child_id, category, milestone, achieved_date, notes) VALUES
(uuid_generate_v4(), (SELECT id FROM children WHERE first_name = 'Oliver' AND last_name = 'Smith'), 'physical', 'Walking independently', '2023-03-15', 'Started walking confidently without support');

-- Insert incident report
INSERT INTO incident_reports (id, child_id, date, time, type, description, action_taken, parent_notified, parent_notification_time, reported_by, severity, follow_up_required, photos) VALUES
(uuid_generate_v4(), (SELECT id FROM children WHERE first_name = 'Oliver' AND last_name = 'Smith'), CURRENT_DATE - INTERVAL '1 day', '14:30', 'injury', 'Small scrape on knee during outdoor play', 'Cleaned wound and applied bandage. Comforted child.', true, NOW() - INTERVAL '1 day' + INTERVAL '15 minutes', 'f8745e5e-d84b-41ec-8076-54744b93d875', 'low', false, ARRAY[]::TEXT[]);

-- Insert planned activities (created by teacher)
INSERT INTO planned_activities (id, name, description, category, start_time, end_time, age_groups, max_participants, materials_needed, learning_objectives, teacher_notes, date, status, weather_dependent, created_by) VALUES
(uuid_generate_v4(), 'Circle Time', 'Morning circle time with songs and stories', 'learning', '09:00', '09:30', ARRAY['toddler', 'preschool'], 12, ARRAY['picture books', 'song cards'], ARRAY['language development', 'social skills'], 'Great way to start the day', CURRENT_DATE, 'completed', false, 'f8745e5e-d84b-41ec-8076-54744b93d875'),
(uuid_generate_v4(), 'Art Exploration', 'Finger painting and texture exploration', 'art', '15:00', '15:45', ARRAY['toddler', 'preschool'], 8, ARRAY['finger paints', 'paper', 'smocks'], ARRAY['creativity', 'fine motor skills'], 'Prepare for mess!', CURRENT_DATE + INTERVAL '1 day', 'planned', false, 'f8745e5e-d84b-41ec-8076-54744b93d875');

-- Insert daily schedules
INSERT INTO daily_schedules (id, date, age_group, meals, naps) VALUES
(uuid_generate_v4(), CURRENT_DATE, 'infant', '{"breakfast_time": "08:00", "lunch_time": "11:30", "snack_time": "15:00"}'::jsonb, '{"morning_start": "09:30", "morning_end": "11:00", "afternoon_start": "13:30", "afternoon_end": "15:00"}'::jsonb),
(uuid_generate_v4(), CURRENT_DATE, 'toddler', '{"breakfast_time": "08:30", "lunch_time": "12:00", "snack_time": "15:30"}'::jsonb, '{"afternoon_start": "13:00", "afternoon_end": "14:30"}'::jsonb),
(uuid_generate_v4(), CURRENT_DATE, 'preschool', '{"breakfast_time": "08:30", "lunch_time": "12:15", "snack_time": "15:30"}'::jsonb, '{"afternoon_start": "13:15", "afternoon_end": "14:15"}'::jsonb);

-- Insert sample activities
INSERT INTO activities (id, name, description, category, age_groups, materials_needed, learning_objectives) VALUES
(uuid_generate_v4(), 'Block Building', 'Building structures with various sized blocks', 'learning', ARRAY['toddler', 'preschool'], ARRAY['wooden blocks', 'soft blocks'], ARRAY['spatial reasoning', 'fine motor skills', 'creativity']),
(uuid_generate_v4(), 'Tummy Time', 'Supervised tummy time for infants', 'physical', ARRAY['infant'], ARRAY['soft mats', 'colorful toys'], ARRAY['neck strength', 'motor development']),
(uuid_generate_v4(), 'Story Reading', 'Interactive story time with picture books', 'learning', ARRAY['toddler', 'preschool'], ARRAY['picture books', 'props'], ARRAY['language development', 'listening skills', 'imagination']);

-- Insert announcements (created by admin and teacher)
INSERT INTO announcements (id, title, content, type, target_audience, age_group, created_by) VALUES
(uuid_generate_v4(), 'Holiday Schedule Update', 'Please note that the daycare will be closed on Monday, February 19th for Presidents Day. Regular hours resume Tuesday, February 20th.', 'reminder', 'all', NULL, '48abd6fc-eb67-4170-83fd-a3f5670412fd'),
(uuid_generate_v4(), 'Picture Day Notice', 'Professional photos will be taken next Friday, February 16th. Please dress your child in their favorite outfit!', 'event', 'parents', NULL, 'f8745e5e-d84b-41ec-8076-54744b93d875');

-- Insert messages between users
INSERT INTO messages (id, sender_id, recipient_id, subject, content, read) VALUES
(uuid_generate_v4(), 'f8745e5e-d84b-41ec-8076-54744b93d875', 'f5c5bef8-c2c5-4703-b6fb-e63952bf8214', 'Oliver had a great day!', 'Hi Michael, just wanted to let you know that Oliver had a wonderful day today. He was very engaged during circle time and loved the art activity. He ate all of his lunch and took a good nap. See you at pickup!', false),
(uuid_generate_v4(), 'f5c5bef8-c2c5-4703-b6fb-e63952bf8214', 'f8745e5e-d84b-41ec-8076-54744b93d875', 'Thank you!', 'Thank you so much for the update, Emma! It''s wonderful to hear Oliver is doing so well. We appreciate all you do for him.', true),
(uuid_generate_v4(), '48abd6fc-eb67-4170-83fd-a3f5670412fd', 'f8745e5e-d84b-41ec-8076-54744b93d875', 'Staff Meeting Reminder', 'Don''t forget about our monthly staff meeting this Friday at 6 PM. We''ll be discussing the new curriculum updates.', false);

-- Insert contact submission
INSERT INTO contact_submissions (id, name, email, phone, subject, message, status) VALUES
(uuid_generate_v4(), 'Jennifer Lopez', 'jennifer@email.com', '555-0701', 'Enrollment Inquiry', 'Hi, I am interested in enrolling my 2-year-old daughter starting in March. Do you have any openings in your toddler program?', 'new');

-- Insert enrollment application (for the parent)
INSERT INTO enrollment_applications (id, parent_id, child_first_name, child_last_name, child_date_of_birth, preferred_start_date, age_group, status, application_date, reviewed_by, review_date, review_notes, priority_score) VALUES
(uuid_generate_v4(), 'f5c5bef8-c2c5-4703-b6fb-e63952bf8214', 'Emma', 'Smith', '2023-01-15', '2024-03-01', 'toddler', 'approved', '2024-02-01', '48abd6fc-eb67-4170-83fd-a3f5670412fd', '2024-02-03', 'All requirements met, good fit for our program', 85);

-- Insert billing record (for the parent and Oliver)
INSERT INTO billing (id, parent_id, child_id, billing_period_start, billing_period_end, amount, status, due_date, paid_date, payment_method, late_fees, discounts, notes) VALUES
(uuid_generate_v4(), 'f5c5bef8-c2c5-4703-b6fb-e63952bf8214', (SELECT id FROM children WHERE first_name = 'Oliver' AND last_name = 'Smith'), '2024-02-01', '2024-02-29', 1200.00, 'paid', '2024-02-15', '2024-02-10', 'card', 0, 0, 'February tuition - paid early');