CREATE INDEX idx_dinosaurs_species_id ON dinosaurs(species_id);
CREATE INDEX idx_dinosaurs_era_id ON dinosaurs(era_id);
CREATE INDEX idx_dinosaurs_diet_id ON dinosaurs(diet_id);
CREATE INDEX idx_dinosaur_categories_group_id ON dinosaur_categories(group_id);
CREATE INDEX idx_dinosaur_environments_environment_id ON dinosaur_environments(environment_id);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_dinosaur_id ON favorites(dinosaur_id);

CREATE INDEX idx_votes_user_id ON votes(user_id);
CREATE INDEX idx_votes_vote_session_id ON votes(vote_session_id);
CREATE INDEX idx_votes_dinosaur_id ON votes(dinosaur_id);

CREATE INDEX idx_vote_sessions_choice1_id ON vote_sessions(choice1_id);
CREATE INDEX idx_vote_sessions_choice2_id ON vote_sessions(choice2_id);

CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);

CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_dinosaurs_created_at ON dinosaurs(created_at);
CREATE INDEX idx_dinosaurs_name ON dinosaurs(name);

CREATE INDEX idx_vote_sessions_created_at ON vote_sessions(created_at);

CREATE INDEX idx_votes_created_at ON votes(created_at);

CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at);

