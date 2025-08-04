-- ============================================
-- DAYCARE MANAGEMENT SYSTEM - DATABASE SEED
-- ============================================
-- This file contains dummy data to populate the Supabase database
-- Run this after creating your tables and setting up RLS policies

-- ============================================
-- 1. PROFILES (Users: Admin, Teachers, Parents)
-- ============================================

INSERT INTO profiles (id, email, full_name, site_role, phone, address, emergency_contact, active_status, last_login, created_at, updated_at) VALUES
-- Admin Users
('admin-001', 'admin@littlesteps.com', 'Sarah Admin', 'admin', '(555) 100-0001', '123 Admin St, City, State 12345', 'Emergency Admin (555) 900-0001', true, '2024-08-04T10:00:00Z', NOW(), NOW()),
('admin-002', 'director@littlesteps.com', 'Michael Director', 'admin', '(555) 100-0002', '456 Director Ave, City, State 12345', 'Emergency Director (555) 900-0002', true, '2024-08-04T09:30:00Z', NOW(), NOW()),

-- Teachers
('teacher-001', 'sarah.johnson@littlesteps.com', 'Sarah Johnson', 'teacher', '(555) 200-0001', '789 Teacher Ln, City, State 12345', 'John Johnson (Husband) (555) 800-0001', true, '2024-08-04T08:00:00Z', NOW(), NOW()),
('teacher-002', 'michael.chen@littlesteps.com', 'Michael Chen', 'teacher', '(555) 200-0002', '321 Education Dr, City, State 12345', 'Lisa Chen (Wife) (555) 800-0002', true, '2024-08-04T08:15:00Z', NOW(), NOW()),
('teacher-003', 'emily.davis@littlesteps.com', 'Emily Davis', 'teacher', '(555) 200-0003', '654 Teaching St, City, State 12345', 'Robert Davis (Brother) (555) 800-0003', true, '2024-08-04T07:45:00Z', NOW(), NOW()),
('teacher-004', 'james.wilson@littlesteps.com', 'James Wilson', 'teacher', '(555) 200-0004', '987 Childcare Ave, City, State 12345', 'Maria Wilson (Sister) (555) 800-0004', true, '2024-08-04T08:30:00Z', NOW(), NOW()),
('teacher-005', 'lisa.garcia@littlesteps.com', 'Lisa Garcia', 'teacher', '(555) 200-0005', '147 Learning Blvd, City, State 12345', 'Carlos Garcia (Spouse) (555) 800-0005', false, '2024-08-03T16:00:00Z', NOW(), NOW()),

-- Parents
('parent-001', 'john.smith@email.com', 'John Smith', 'parent', '(555) 300-0001', '123 Parent St, City, State 12345', 'Jane Smith (Wife) (555) 700-0001', true, '2024-08-04T07:30:00Z', NOW(), NOW()),
('parent-002', 'maria.garcia@email.com', 'Maria Garcia', 'parent', '(555) 300-0002', '456 Family Ave, City, State 12345', 'Pedro Garcia (Husband) (555) 700-0002', true, '2024-08-03T18:45:00Z', NOW(), NOW()),
('parent-003', 'david.wilson@email.com', 'David Wilson', 'parent', '(555) 300-0003', '789 Home Rd, City, State 12345', 'Sarah Wilson (Wife) (555) 700-0003', true, '2024-08-04T06:15:00Z', NOW(), NOW()),
('parent-004', 'jennifer.brown@email.com', 'Jennifer Brown', 'parent', '(555) 300-0004', '321 Guardian Dr, City, State 12345', 'Michael Brown (Husband) (555) 700-0004', true, '2024-08-03T19:20:00Z', NOW(), NOW()),
('parent-005', 'robert.jones@email.com', 'Robert Jones', 'parent', '(555) 300-0005', '654 Caregiver St, City, State 12345', 'Linda Jones (Wife) (555) 700-0005', true, '2024-08-04T07:00:00Z', NOW(), NOW()),
('parent-006', 'amanda.taylor@email.com', 'Amanda Taylor', 'parent', '(555) 300-0006', '987 Mother Ave, City, State 12345', 'James Taylor (Husband) (555) 700-0006', false, '2024-08-02T17:30:00Z', NOW(), NOW()),
('parent-007', 'christopher.lee@email.com', 'Christopher Lee', 'parent', '(555) 300-0007', '147 Father Blvd, City, State 12345', 'Michelle Lee (Wife) (555) 700-0007', true, '2024-08-04T08:45:00Z', NOW(), NOW()),
('parent-008', 'stephanie.white@email.com', 'Stephanie White', 'parent', '(555) 300-0008', '258 Single Parent Dr, City, State 12345', 'Mom White (Mother) (555) 700-0008', true, '2024-08-03T20:10:00Z', NOW(), NOW());

-- ============================================
-- 2. CHILDREN
-- ============================================

INSERT INTO children (id, first_name, last_name, date_of_birth, age_group, parent_id, teacher_id, status, enrollment_date, allergies, medical_notes, emergency_contact, created_at, updated_at) VALUES
-- Infants (0-12 months)
('child-001', 'Emma', 'Smith', '2023-10-15', 'infant', 'parent-001', 'teacher-003', 'active', '2024-01-15', '{"peanuts", "dairy"}', 'Mild eczema - apply moisturizer daily', '(555) 999-0001', NOW(), NOW()),
('child-002', 'Oliver', 'Garcia', '2023-12-03', 'infant', 'parent-002', 'teacher-003', 'active', '2024-02-01', '{}', 'Premature birth - monitor feeding schedule', '(555) 999-0002', NOW(), NOW()),
('child-003', 'Sophia', 'Wilson', '2024-01-20', 'infant', 'parent-003', 'teacher-003', 'active', '2024-03-01', '{"eggs"}', 'Reflux - keep upright after feeding', '(555) 999-0003', NOW(), NOW()),

-- Toddlers (1-3 years)
('child-004', 'Liam', 'Brown', '2022-05-12', 'toddler', 'parent-004', 'teacher-001', 'active', '2024-01-08', '{}', 'No medical concerns', '(555) 999-0004', NOW(), NOW()),
('child-005', 'Ava', 'Jones', '2022-08-28', 'toddler', 'parent-005', 'teacher-001', 'active', '2024-01-22', '{"shellfish"}', 'EpiPen in medical bag - severe allergy', '(555) 999-0005', NOW(), NOW()),
('child-006', 'Noah', 'Taylor', '2021-11-07', 'toddler', 'parent-006', 'teacher-001', 'inactive', '2024-02-15', '{}', 'Asthma - inhaler as needed', '(555) 999-0006', NOW(), NOW()),
('child-007', 'Isabella', 'Lee', '2022-03-18', 'toddler', 'parent-007', 'teacher-002', 'active', '2024-01-29', '{"milk", "soy"}', 'Lactose intolerant - soy alternatives only', '(555) 999-0007', NOW(), NOW()),
('child-008', 'Mason', 'White', '2022-07-09', 'toddler', 'parent-008', 'teacher-002', 'active', '2024-02-12', '{}', 'Speech therapy twice a week', '(555) 999-0008', NOW(), NOW()),

-- Preschoolers (3-5 years)
('child-009', 'Charlotte', 'Smith', '2020-04-22', 'preschool', 'parent-001', 'teacher-004', 'active', '2024-01-03', '{}', 'ADHD - needs structured activities', '(555) 999-0009', NOW(), NOW()),
('child-010', 'Ethan', 'Garcia', '2021-02-14', 'preschool', 'parent-002', 'teacher-004', 'active', '2024-01-18', '{"nuts"}', 'Mild autism spectrum - prefers routine', '(555) 999-0010', NOW(), NOW()),
('child-011', 'Amelia', 'Wilson', '2020-09-30', 'preschool', 'parent-003', 'teacher-004', 'active', '2024-01-11', '{}', 'Wears glasses - handle with care', '(555) 999-0011', NOW(), NOW()),
('child-012', 'Lucas', 'Brown', '2021-06-05', 'preschool', 'parent-004', 'teacher-002', 'waitlist', '2024-03-01', '{"peanuts", "tree nuts"}', 'Severe nut allergy - EpiPen required', '(555) 999-0012', NOW(), NOW());

-- ============================================
-- 3. TEACHER ASSIGNMENTS
-- ============================================

INSERT INTO teacher_assignments (id, teacher_id, child_id, assigned_date, status, notes, created_at, updated_at) VALUES
('assign-001', 'teacher-003', 'child-001', '2024-01-15', 'active', 'Primary caregiver for infant room', NOW(), NOW()),
('assign-002', 'teacher-003', 'child-002', '2024-02-01', 'active', 'Monitor feeding schedule closely', NOW(), NOW()),
('assign-003', 'teacher-003', 'child-003', '2024-03-01', 'active', 'Handle reflux with extra care', NOW(), NOW()),
('assign-004', 'teacher-001', 'child-004', '2024-01-08', 'active', 'Excellent with social activities', NOW(), NOW()),
('assign-005', 'teacher-001', 'child-005', '2024-01-22', 'active', 'EpiPen trained - emergency contact ready', NOW(), NOW()),
('assign-006', 'teacher-001', 'child-006', '2024-02-15', 'inactive', 'Child currently inactive', NOW(), NOW()),
('assign-007', 'teacher-002', 'child-007', '2024-01-29', 'active', 'Dietary restrictions carefully monitored', NOW(), NOW()),
('assign-008', 'teacher-002', 'child-008', '2024-02-12', 'active', 'Speech therapy coordination', NOW(), NOW()),
('assign-009', 'teacher-004', 'child-009', '2024-01-03', 'active', 'ADHD management strategies in place', NOW(), NOW()),
('assign-010', 'teacher-004', 'child-010', '2024-01-18', 'active', 'Autism support - routine maintenance', NOW(), NOW()),
('assign-011', 'teacher-004', 'child-011', '2024-01-11', 'active', 'Glasses care instructions followed', NOW(), NOW()),
('assign-012', 'teacher-002', 'child-012', '2024-03-01', 'active', 'Waitlisted - nut allergy protocols ready', NOW(), NOW());

-- ============================================
-- 4. DAILY LOGS
-- ============================================

INSERT INTO daily_logs (id, child_id, date, teacher_id, meals, drinks, naps, activities, notes, mood, behavior, sickness, medications, bathroom_visits, diaper_changes, photos, created_at, updated_at) VALUES
-- Recent logs for active children
('log-001', 'child-001', '2024-08-04', 'teacher-003', 
 '[{"type": "breakfast", "food": "Oat cereal with formula", "quantity": "4", "unit": "oz", "time": "08:30"}, {"type": "snack", "food": "Banana puree", "quantity": "2", "unit": "tbsp", "time": "10:00"}, {"type": "lunch", "food": "Sweet potato and chicken", "quantity": "3", "unit": "oz", "time": "12:00"}]',
 '[{"type": "formula", "quantity": "6", "unit": "oz", "time": "09:00"}, {"type": "water", "quantity": "2", "unit": "oz", "time": "14:00"}]',
 '{"morning_start": "09:30", "morning_end": "10:30", "afternoon_start": "13:00", "afternoon_end": "14:30"}',
 '["Tummy time", "Sensory play with soft toys", "Music and movement"]',
 'Emma had a great day! She rolled over during tummy time and smiled a lot during music time.',
 'happy', 'excellent', null, null, 0, 6, '["photo1.jpg", "photo2.jpg"]', NOW(), NOW()),

('log-002', 'child-004', '2024-08-04', 'teacher-001',
 '[{"type": "breakfast", "food": "Scrambled eggs and toast", "quantity": "1", "unit": "serving", "time": "08:00"}, {"type": "snack", "food": "Apple slices and cheese", "quantity": "1", "unit": "serving", "time": "10:30"}, {"type": "lunch", "food": "Mac and cheese with broccoli", "quantity": "1", "unit": "serving", "time": "12:30"}]',
 '[{"type": "milk", "quantity": "8", "unit": "oz", "time": "08:00"}, {"type": "water", "quantity": "12", "unit": "oz", "time": "11:00"}, {"type": "water", "quantity": "8", "unit": "oz", "time": "15:00"}]',
 '{"morning_start": null, "morning_end": null, "afternoon_start": "13:30", "afternoon_end": "14:30"}',
 '["Circle time", "Art and crafts", "Outdoor playground", "Block building"]',
 'Liam was very engaged today. He helped clean up after art time and played well with others.',
 'energetic', 'good', null, null, 5, null, '["outdoor_play.jpg"]', NOW(), NOW()),

('log-003', 'child-009', '2024-08-04', 'teacher-004',
 '[{"type": "breakfast", "food": "Pancakes with syrup", "quantity": "2", "unit": "pieces", "time": "08:00"}, {"type": "snack", "food": "Goldfish crackers", "quantity": "1", "unit": "cup", "time": "10:00"}, {"type": "lunch", "food": "Grilled chicken and rice", "quantity": "1", "unit": "serving", "time": "12:00"}]',
 '[{"type": "milk", "quantity": "8", "unit": "oz", "time": "08:00"}, {"type": "water", "quantity": "16", "unit": "oz", "time": "12:00"}]',
 '{"morning_start": null, "morning_end": null, "afternoon_start": "13:00", "afternoon_end": "14:00"}',
 '["Reading time", "Science experiment", "Dramatic play", "Music and dance"]',
 'Charlotte showed great focus during science time. She asked lots of questions about plants.',
 'happy', 'excellent', null, null, 3, null, '["science_time.jpg", "reading.jpg"]', NOW(), NOW());

-- Previous day logs
INSERT INTO daily_logs (id, child_id, date, teacher_id, meals, drinks, naps, activities, notes, mood, behavior, sickness, medications, bathroom_visits, diaper_changes, photos, created_at, updated_at) VALUES
('log-004', 'child-001', '2024-08-03', 'teacher-003',
 '[{"type": "breakfast", "food": "Rice cereal", "quantity": "3", "unit": "oz", "time": "08:45"}, {"type": "lunch", "food": "Pureed peas and carrots", "quantity": "2", "unit": "oz", "time": "12:15"}]',
 '[{"type": "formula", "quantity": "5", "unit": "oz", "time": "09:30"}, {"type": "formula", "quantity": "4", "unit": "oz", "time": "15:00"}]',
 '{"morning_start": "09:45", "morning_end": "10:45", "afternoon_start": "13:30", "afternoon_end": "14:45"}',
 '["Tummy time", "Peek-a-boo games", "Soft book reading"]',
 'Emma was a bit fussy during afternoon feeding but settled well for nap.',
 'fussy', 'fair', null, null, 0, 5, null, NOW(), NOW()),

('log-005', 'child-005', '2024-08-03', 'teacher-001',
 '[{"type": "breakfast", "food": "Oatmeal with berries", "quantity": "1", "unit": "bowl", "time": "08:15"}, {"type": "lunch", "food": "Turkey sandwich", "quantity": "1", "unit": "half", "time": "12:00"}]',
 '[{"type": "water", "quantity": "10", "unit": "oz", "time": "10:00"}, {"type": "milk", "quantity": "6", "unit": "oz", "time": "14:00"}]',
 '{"morning_start": null, "morning_end": null, "afternoon_start": "13:00", "afternoon_end": "14:15"}',
 '["Puzzle time", "Sand table play", "Story reading", "Dance party"]',
 'Ava had a wonderful day. No allergy incidents and she ate well.',
 'happy', 'excellent', null, null, 4, null, '["puzzle_success.jpg"]', NOW(), NOW());

-- ============================================
-- 5. PORTFOLIO ENTRIES
-- ============================================

INSERT INTO portfolio_entries (id, child_id, title, description, category, date, photos, teacher_notes, created_at, updated_at) VALUES
('portfolio-001', 'child-001', 'First Smile', 'Emma gave us her first real social smile today during tummy time!', 'milestone', '2024-07-15', '["first_smile.jpg"]', 'This is a significant developmental milestone. Emma is right on track for social development.', NOW(), NOW()),

('portfolio-002', 'child-004', 'Art Creation', 'Liam painted his first masterpiece using finger paints', 'art', '2024-08-01', '["finger_painting1.jpg", "finger_painting2.jpg"]', 'Liam showed great creativity and was very focused during this activity. He mixed colors independently.', NOW(), NOW()),

('portfolio-003', 'child-009', 'Reading Achievement', 'Charlotte read her first complete book independently!', 'learning', '2024-07-28', '["reading_book.jpg"]', 'Charlotte has made tremendous progress in reading. She sounded out all the words and understood the story.', NOW(), NOW()),

('portfolio-004', 'child-010', 'Social Interaction', 'Ethan played cooperatively with three friends today', 'social', '2024-08-02', '["group_play.jpg"]', 'This is a big step for Ethan. He initiated play and took turns without prompting.', NOW(), NOW()),

('portfolio-005', 'child-005', 'Physical Development', 'Ava successfully climbed the big playground structure', 'physical', '2024-07-30', '["playground_climb.jpg"]', 'Ava showed great determination and physical coordination. She was very proud of her achievement.', NOW(), NOW());

-- ============================================
-- 6. DEVELOPMENT MILESTONES
-- ============================================

INSERT INTO development_milestones (id, child_id, category, milestone, achieved_date, notes, created_at, updated_at) VALUES
('milestone-001', 'child-001', 'physical', 'Rolling over from back to tummy', '2024-07-20', 'Emma rolled over independently during play time. Great motor development!', NOW(), NOW()),
('milestone-002', 'child-001', 'social', 'Social smiling', '2024-07-15', 'First genuine social smile in response to interaction.', NOW(), NOW()),

('milestone-003', 'child-004', 'language', 'Speaking in 3-word sentences', '2024-07-25', 'Liam is now consistently using 3-word sentences like "I want milk."', NOW(), NOW()),
('milestone-004', 'child-004', 'physical', 'Jumping with both feet', '2024-08-01', 'Liam can now jump and land with both feet together.', NOW(), NOW()),

('milestone-005', 'child-009', 'cognitive', 'Reading simple words', '2024-07-28', 'Charlotte can now read basic sight words independently.', NOW(), NOW()),
('milestone-006', 'child-009', 'social', 'Sharing toys willingly', '2024-07-22', 'Shows improved social skills and empathy with peers.', NOW(), NOW()),

('milestone-007', 'child-010', 'social', 'Playing cooperatively', '2024-08-02', 'First time playing cooperatively with multiple children for extended period.', NOW(), NOW()),
('milestone-008', 'child-011', 'physical', 'Pedaling tricycle', '2024-07-18', 'Amelia learned to pedal the tricycle independently.', NOW(), NOW());

-- ============================================
-- 7. PLANNED ACTIVITIES
-- ============================================

INSERT INTO planned_activities (id, name, description, category, start_time, end_time, age_groups, max_participants, materials_needed, learning_objectives, teacher_notes, date, status, weather_dependent, created_by, created_at, updated_at) VALUES
-- Today's activities
('activity-001', 'Morning Circle Time', 'Welcome song, weather discussion, and daily schedule review', 'learning', '09:00', '09:30', '["toddler", "preschool"]', 15, '["Calendar", "Weather chart", "Song cards"]', '["Social skills", "Language development", "Routine awareness"]', 'Great for building community and communication skills', '2024-08-04', 'completed', false, 'teacher-001', NOW(), NOW()),

('activity-002', 'Water Play Exploration', 'Sensory water table with measuring cups and floating toys', 'sensory', '10:00', '11:00', '["toddler"]', 6, '["Water table", "Measuring cups", "Floating toys", "Towels"]', '["Fine motor skills", "Sensory development", "Math concepts"]', 'Always supervise closely around water', '2024-08-04', 'completed', false, 'teacher-001', NOW(), NOW()),

('activity-003', 'Outdoor Nature Walk', 'Exploring the playground and collecting leaves', 'outdoor', '10:30', '11:30', '["preschool"]', 12, '["Collection bags", "Magnifying glasses", "Nature identification cards"]', '["Gross motor skills", "Nature awareness", "Observation skills"]', 'Check weather conditions before starting', '2024-08-04', 'completed', true, 'teacher-004', NOW(), NOW()),

('activity-004', 'Art: Finger Painting', 'Creative expression through finger painting', 'art', '14:00', '14:45', '["toddler", "preschool"]', 8, '["Finger paints", "Paper", "Smocks", "Wet wipes"]', '["Creativity", "Fine motor skills", "Color recognition"]', 'Have cleanup supplies ready', '2024-08-04', 'in_progress', false, 'teacher-002', NOW(), NOW()),

('activity-005', 'Infant Tummy Time', 'Supervised tummy time with sensory toys', 'physical', '15:00', '15:20', '["infant"]', 4, '["Soft mats", "Colorful toys", "Mirrors"]', '["Motor development", "Neck strength", "Visual tracking"]', 'Monitor each baby individually', '2024-08-04', 'planned', false, 'teacher-003', NOW(), NOW()),

-- Tomorrow's planned activities
('activity-006', 'Music and Movement', 'Dancing and singing with instruments', 'music', '09:30', '10:15', '["toddler", "preschool"]', 20, '["Musical instruments", "Scarves", "Music player"]', '["Rhythm", "Gross motor skills", "Self-expression"]', 'Encourage all children to participate at their comfort level', '2024-08-05', 'planned', false, 'teacher-002', NOW(), NOW()),

('activity-007', 'Science: Sink or Float', 'Experimenting with different objects in water', 'science', '10:30', '11:15', '["preschool"]', 8, '["Water bins", "Various objects", "Recording sheets", "Towels"]', '["Scientific thinking", "Prediction skills", "Observation"]', 'Great for developing hypothesis skills', '2024-08-05', 'planned', false, 'teacher-004', NOW(), NOW()),

('activity-008', 'Dramatic Play: Restaurant', 'Setting up a pretend restaurant in dramatic play area', 'dramatic_play', '14:00', '15:00', '["preschool"]', 10, '["Play food", "Menus", "Order pads", "Play money", "Aprons"]', '["Social skills", "Language development", "Math concepts"]', 'Rotate roles so everyone gets to be customer and server', '2024-08-05', 'planned', false, 'teacher-001', NOW(), NOW());

-- ============================================
-- 8. DAILY SCHEDULES
-- ============================================

INSERT INTO daily_schedules (id, date, age_group, meals, naps, created_at, updated_at) VALUES
('schedule-001', '2024-08-04', 'infant', 
 '{"breakfast_time": "08:00", "lunch_time": "12:00", "snack_time": "15:30"}',
 '{"morning_start": "09:30", "morning_end": "10:30", "afternoon_start": "13:00", "afternoon_end": "14:30"}',
 NOW(), NOW()),

('schedule-002', '2024-08-04', 'toddler',
 '{"breakfast_time": "08:00", "lunch_time": "12:00", "snack_time": "15:00"}',
 '{"morning_start": "", "morning_end": "", "afternoon_start": "13:00", "afternoon_end": "14:00"}',
 NOW(), NOW()),

('schedule-003', '2024-08-04', 'preschool',
 '{"breakfast_time": "08:00", "lunch_time": "12:00", "snack_time": "15:00"}',
 '{"morning_start": "", "morning_end": "", "afternoon_start": "13:00", "afternoon_end": "14:00"}',
 NOW(), NOW()),

-- Tomorrow's schedules
('schedule-004', '2024-08-05', 'infant',
 '{"breakfast_time": "08:00", "lunch_time": "12:00", "snack_time": "15:30"}',
 '{"morning_start": "09:30", "morning_end": "10:30", "afternoon_start": "13:00", "afternoon_end": "14:30"}',
 NOW(), NOW()),

('schedule-005', '2024-08-05', 'toddler',
 '{"breakfast_time": "08:00", "lunch_time": "12:00", "snack_time": "15:00"}',
 '{"morning_start": "", "morning_end": "", "afternoon_start": "13:00", "afternoon_end": "14:00"}',
 NOW(), NOW()),

('schedule-006', '2024-08-05', 'preschool',
 '{"breakfast_time": "08:00", "lunch_time": "12:00", "snack_time": "15:00"}',
 '{"morning_start": "", "morning_end": "", "afternoon_start": "13:00", "afternoon_end": "14:00"}',
 NOW(), NOW());

-- ============================================
-- 9. ACTIVITIES (Template Library)
-- ============================================

INSERT INTO activities (id, name, description, category, age_groups, materials_needed, learning_objectives, created_at, updated_at) VALUES
('template-001', 'Bubble Play', 'Blowing and chasing bubbles for sensory fun', 'sensory', '["infant", "toddler"]', '["Bubble solution", "Bubble wands", "Towels"]', '["Visual tracking", "Gross motor skills", "Cause and effect"]', NOW(), NOW()),

('template-002', 'Story Time Circle', 'Interactive reading with props and songs', 'learning', '["toddler", "preschool"]', '["Picture books", "Props", "Cushions"]', '["Language development", "Listening skills", "Imagination"]', NOW(), NOW()),

('template-003', 'Playdough Creations', 'Open-ended creative play with playdough', 'art', '["toddler", "preschool"]', '["Playdough", "Cookie cutters", "Rolling pins", "Mats"]', '["Fine motor skills", "Creativity", "Sensory exploration"]', NOW(), NOW()),

('template-004', 'Dance Party', 'Movement and dancing to various music', 'music', '["toddler", "preschool"]', '["Music player", "Scarves", "Instruments"]', '["Gross motor skills", "Rhythm", "Self-expression"]', NOW(), NOW()),

('template-005', 'Nature Scavenger Hunt', 'Finding specific items outdoors', 'outdoor', '["preschool"]', '["Picture lists", "Collection bags", "Magnifying glasses"]', '["Observation skills", "Following directions", "Nature awareness"]', NOW(), NOW());

-- ============================================
-- 10. ANNOUNCEMENTS
-- ============================================

INSERT INTO announcements (id, title, content, type, target_audience, age_group, created_by, created_at, updated_at) VALUES
('announce-001', 'Parent-Teacher Conferences', 'Parent-teacher conferences are scheduled for next week, August 12-16. Please check your email for your assigned time slot. We look forward to discussing your child''s progress and development.', 'event', 'parents', null, 'admin-001', NOW(), NOW()),

('announce-002', 'New Music Program Starting', 'We''re excited to announce our new music and movement program starting Monday, August 12th! Ms. Lisa will be leading special music sessions for all age groups twice a week.', 'general', 'all', null, 'admin-001', NOW(), NOW()),

('announce-003', 'Playground Maintenance', 'The playground will be closed for maintenance on August 8th from 9 AM to 2 PM. Outdoor activities will be moved to the covered pavilion area.', 'reminder', 'teachers', null, 'admin-002', NOW(), NOW()),

('announce-004', 'Lunch Menu Update', 'New lunch menu items have been added for next week! We now offer more vegetarian options and allergy-friendly alternatives. Menus are posted in each classroom.', 'general', 'parents', null, 'teacher-001', NOW(), NOW()),

('announce-005', 'Fire Drill Practice', 'We will be conducting our monthly fire drill practice on Friday, August 9th at 10:30 AM. Children will be prepared in advance to ensure a calm experience.', 'reminder', 'all', null, 'admin-001', NOW(), NOW());

-- ============================================
-- 11. MESSAGES
-- ============================================

INSERT INTO messages (id, sender_id, recipient_id, subject, content, read, created_at, updated_at) VALUES
('message-001', 'teacher-001', 'parent-004', 'Liam''s Great Day!', 'Hi Jennifer! Liam had such a wonderful day today. He was very engaged during our art activity and helped clean up without being asked. He''s showing such great independence! Have a lovely evening.', false, NOW(), NOW()),

('message-002', 'parent-005', 'teacher-001', 'Ava''s Allergy Information', 'Hi Sarah, I wanted to remind you that Ava''s allergist recommended we keep the EpiPen in the main office as well as the classroom. I''ve left an extra one with the front desk. Thank you for being so careful with her allergies!', true, NOW(), NOW()),

('message-003', 'teacher-004', 'parent-001', 'Charlotte''s Reading Progress', 'Hello John! I wanted to update you on Charlotte''s amazing reading progress. She finished another level today and is really building confidence. Would you like some suggestions for books to practice at home?', false, NOW(), NOW()),

('message-004', 'parent-007', 'teacher-002', 'Isabella''s Dietary Needs', 'Hi Michael, Isabella mentioned she was still hungry after lunch. Could we add an extra snack for her? I''ve packed some soy cheese crackers in her lunch box that she can have. Thanks!', true, NOW(), NOW()),

('message-005', 'admin-001', 'parent-003', 'Enrollment Confirmation', 'Dear David, We''re pleased to confirm Sophia and Amelia''s continued enrollment for the fall semester. Please complete the updated medical forms by August 15th. Thank you!', false, NOW(), NOW());

-- ============================================
-- 12. CONTACT SUBMISSIONS
-- ============================================

INSERT INTO contact_submissions (id, name, email, phone, subject, message, status, created_at, updated_at) VALUES
('contact-001', 'Michelle Rodriguez', 'michelle.r@email.com', '(555) 400-0001', 'Enrollment Inquiry', 'Hello, I''m interested in enrolling my 2-year-old daughter for the fall. Do you have any openings in the toddler program? I''d love to schedule a tour.', 'new', NOW(), NOW()),

('contact-002', 'Kevin Thompson', 'kevin.thompson@email.com', '(555) 400-0002', 'After School Program', 'Do you offer after-school care for elementary students? My son is 6 and would need care from 3:30 PM to 6:00 PM on weekdays.', 'read', NOW(), NOW()),

('contact-003', 'Lisa Anderson', 'lisa.anderson@email.com', null, 'Summer Program Information', 'I''m looking for summer programs for my 4-year-old. What activities do you offer during the summer months? Are there any themed weeks?', 'replied', NOW(), NOW()),

('contact-004', 'James Foster', 'james.foster@email.com', '(555) 400-0004', 'Dietary Accommodations', 'My daughter has celiac disease and requires gluten-free meals. Can you accommodate special dietary needs? What is your policy on food brought from home?', 'new', NOW(), NOW()),

('contact-005', 'Sarah Mitchell', 'sarah.mitchell@email.com', '(555) 400-0005', 'Volunteer Opportunities', 'I''m a retired teacher and would love to volunteer for reading time or special events. Do you have volunteer programs for community members?', 'resolved', NOW(), NOW());

-- ============================================
-- 13. ATTENDANCE
-- ============================================

INSERT INTO attendance (id, child_id, date, check_in_time, check_out_time, status, notes, recorded_by, created_at, updated_at) VALUES
-- Today's attendance
('attend-001', 'child-001', '2024-08-04', '08:15:00', null, 'present', 'Parent drop-off on time', 'teacher-003', NOW(), NOW()),
('attend-002', 'child-002', '2024-08-04', '08:30:00', null, 'present', 'Brought comfort blanket', 'teacher-003', NOW(), NOW()),
('attend-003', 'child-003', '2024-08-04', '09:00:00', null, 'late', 'Traffic delay - parent called ahead', 'teacher-003', NOW(), NOW()),
('attend-004', 'child-004', '2024-08-04', '08:00:00', null, 'present', 'Excited for art day', 'teacher-001', NOW(), NOW()),
('attend-005', 'child-005', '2024-08-04', '08:10:00', null, 'present', 'EpiPen check completed', 'teacher-001', NOW(), NOW()),
('attend-006', 'child-006', '2024-08-04', null, null, 'absent', 'Sick day - parent called', 'teacher-001', NOW(), NOW()),
('attend-007', 'child-007', '2024-08-04', '08:20:00', null, 'present', 'Soy milk provided', 'teacher-002', NOW(), NOW()),
('attend-008', 'child-008', '2024-08-04', '08:45:00', null, 'late', 'Speech therapy appointment ran late', 'teacher-002', NOW(), NOW()),
('attend-009', 'child-009', '2024-08-04', '07:55:00', null, 'present', 'Early arrival - ready for the day', 'teacher-004', NOW(), NOW()),
('attend-010', 'child-010', '2024-08-04', '08:05:00', null, 'present', 'Good morning routine', 'teacher-004', NOW(), NOW()),
('attend-011', 'child-011', '2024-08-04', '08:15:00', null, 'present', 'Glasses cleaned and secured', 'teacher-004', NOW(), NOW()),

-- Yesterday's attendance (with check-out times)
('attend-012', 'child-001', '2024-08-03', '08:20:00', '16:30:00', 'present', 'Full day attendance', 'teacher-003', NOW(), NOW()),
('attend-013', 'child-004', '2024-08-03', '08:00:00', '17:00:00', 'present', 'Parent pickup on time', 'teacher-001', NOW(), NOW()),
('attend-014', 'child-005', '2024-08-03', '08:15:00', '15:45:00', 'early_pickup', 'Doctor appointment', 'teacher-001', NOW(), NOW()),
('attend-015', 'child-009', '2024-08-03', '08:10:00', '16:45:00', 'present', 'Great day overall', 'teacher-004', NOW(), NOW());

-- ============================================
-- 14. INCIDENT REPORTS
-- ============================================

INSERT INTO incident_reports (id, child_id, date, time, type, description, action_taken, parent_notified, parent_notification_time, reported_by, severity, follow_up_required, photos, created_at, updated_at) VALUES
('incident-001', 'child-004', '2024-08-02', '10:30:00', 'injury', 'Liam fell while running on the playground and scraped his knee', 'Cleaned wound with soap and water, applied bandage. Liam was comforted and resumed play after 5 minutes.', true, '2024-08-02T10:45:00Z', 'teacher-001', 'low', false, '["scraped_knee_before.jpg", "scraped_knee_after.jpg"]', NOW(), NOW()),

('incident-002', 'child-010', '2024-07-30', '14:15:00', 'behavioral', 'Ethan had difficulty with transition from free play to clean-up time, became upset and threw blocks', 'Used calming strategies, gave Ethan extra time and support. Discussed feelings and appropriate ways to express frustration.', true, '2024-07-30T14:30:00Z', 'teacher-004', 'medium', true, null, NOW(), NOW()),

('incident-003', 'child-005', '2024-07-28', '12:45:00', 'medical', 'Ava accidentally consumed a snack containing shellfish, showed signs of allergic reaction', 'Immediately administered EpiPen as per action plan, called 911, contacted parents. Ava was taken to hospital as precaution.', true, '2024-07-28T12:47:00Z', 'teacher-001', 'high', true, null, NOW(), NOW()),

('incident-004', 'child-007', '2024-08-01', '15:20:00', 'accident', 'Isabella spilled water during snack time, slipped on wet floor', 'Helped Isabella up, checked for injuries (none found), cleaned up spill immediately. Reviewed safety procedures with all children.', false, null, 'teacher-002', 'low', false, null, NOW(), NOW());

-- ============================================
-- 15. ENROLLMENT APPLICATIONS
-- ============================================

INSERT INTO enrollment_applications (id, parent_id, child_first_name, child_last_name, child_date_of_birth, preferred_start_date, age_group, status, application_date, reviewed_by, review_date, review_notes, priority_score, created_at, updated_at) VALUES
('enroll-001', 'parent-006', 'Michael', 'Taylor', '2021-09-15', '2024-09-01', 'preschool', 'approved', '2024-07-15', 'admin-001', '2024-07-20', 'Child meets all requirements. Family has good references.', 85, NOW(), NOW()),

('enroll-002', 'parent-008', 'Emma', 'White', '2022-12-03', '2024-08-15', 'toddler', 'waitlisted', '2024-07-22', 'admin-001', '2024-07-25', 'Toddler room is full. Added to waitlist with priority due to single parent status.', 78, NOW(), NOW()),

('enroll-003', 'parent-001', 'Daniel', 'Smith', '2024-02-10', '2024-10-01', 'infant', 'pending', '2024-08-01', null, null, null, null, NOW(), NOW()),

('enroll-004', 'parent-002', 'Sofia', 'Garcia', '2021-04-20', '2024-09-15', 'preschool', 'rejected', '2024-06-30', 'admin-002', '2024-07-05', 'Child has special needs that exceed our current capabilities. Provided referrals to specialized programs.', 45, NOW(), NOW());

-- ============================================
-- 16. BILLING
-- ============================================

INSERT INTO billing (id, parent_id, child_id, billing_period_start, billing_period_end, amount, status, due_date, paid_date, payment_method, late_fees, discounts, notes, created_at, updated_at) VALUES
-- August 2024 billing
('bill-001', 'parent-001', 'child-001', '2024-08-01', '2024-08-31', 1200.00, 'pending', '2024-08-15', null, null, 0, 0, 'Monthly tuition for Emma - Infant Program', NOW(), NOW()),
('bill-002', 'parent-001', 'child-009', '2024-08-01', '2024-08-31', 1000.00, 'pending', '2024-08-15', null, null, 0, 100, 'Monthly tuition for Charlotte - Preschool Program (sibling discount applied)', NOW(), NOW()),

('bill-003', 'parent-002', 'child-002', '2024-08-01', '2024-08-31', 1200.00, 'paid', '2024-08-15', '2024-08-10', 'card', 0, 0, 'Monthly tuition for Oliver - Infant Program', NOW(), NOW()),
('bill-004', 'parent-002', 'child-010', '2024-08-01', '2024-08-31', 1000.00, 'paid', '2024-08-15', '2024-08-10', 'card', 0, 0, 'Monthly tuition for Ethan - Preschool Program', NOW(), NOW()),

('bill-005', 'parent-004', 'child-004', '2024-08-01', '2024-08-31', 950.00, 'paid', '2024-08-15', '2024-08-12', 'bank_transfer', 0, 0, 'Monthly tuition for Liam - Toddler Program', NOW(), NOW()),

('bill-006', 'parent-005', 'child-005', '2024-08-01', '2024-08-31', 950.00, 'overdue', '2024-08-15', null, null, 25.00, 0, 'Monthly tuition for Ava - Toddler Program (late fee applied)', NOW(), NOW()),

-- July 2024 billing (historical)
('bill-007', 'parent-001', 'child-001', '2024-07-01', '2024-07-31', 1200.00, 'paid', '2024-07-15', '2024-07-14', 'check', 0, 0, 'Monthly tuition for Emma - Infant Program', NOW(), NOW()),
('bill-008', 'parent-003', 'child-003', '2024-07-01', '2024-07-31', 1200.00, 'paid', '2024-07-15', '2024-07-20', 'cash', 5.00, 0, 'Monthly tuition for Sophia - Infant Program (paid 5 days late)', NOW(), NOW());

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

-- Insert completion message
DO $$ 
BEGIN 
    RAISE NOTICE 'Database seeding completed successfully!';
    RAISE NOTICE 'Created:';
    RAISE NOTICE '- 13 Profiles (2 Admin, 5 Teachers, 8 Parents)';
    RAISE NOTICE '- 12 Children (3 Infants, 5 Toddlers, 4 Preschoolers)';
    RAISE NOTICE '- 12 Teacher Assignments';
    RAISE NOTICE '- 7 Daily Logs (current and historical)';
    RAISE NOTICE '- 5 Portfolio Entries';
    RAISE NOTICE '- 8 Development Milestones';
    RAISE NOTICE '- 8 Planned Activities';
    RAISE NOTICE '- 6 Daily Schedules';
    RAISE NOTICE '- 5 Activity Templates';
    RAISE NOTICE '- 5 Announcements';
    RAISE NOTICE '- 5 Messages';
    RAISE NOTICE '- 5 Contact Submissions';
    RAISE NOTICE '- 15 Attendance Records';
    RAISE NOTICE '- 4 Incident Reports';
    RAISE NOTICE '- 4 Enrollment Applications';
    RAISE NOTICE '- 8 Billing Records';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now test all features of the daycare management system!';
END $$;
