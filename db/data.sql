INSERT INTO eras (name, start_date, end_date, description) VALUES
('Triassic', '2500-01-01', '2000-01-01', 'First era of dinosaurs.'),
('Jurassic', '2000-01-01', '1450-01-01', 'Era dominated by large herbivores and theropods.'),
('Cretaceous', '1450-01-01', '660-01-01', 'Last period before mass extinction.');

INSERT INTO species (name, description) VALUES
('Tyrannosaurus rex', 'Large carnivorous dinosaur with massive jaws.'),
('Triceratops horridus', 'Herbivore with three facial horns and a bony frill.'),
('Velociraptor mongoliensis', 'Small, fast predator with a sickle-shaped claw.');

INSERT INTO diets (name, description) VALUES
('carnivore', 'Eats other animals.'),
('herbivore', 'Feeds on plants.'),
('omnivore', 'Eats both plants and animals.');

INSERT INTO categories (name, description) VALUES
('Theropods', 'Bipedal carnivorous dinosaurs.'),
('Ceratopsians', 'Herbivores with beaked faces and horns.'),
('Dromaeosaurs', 'Fast, agile predators with claws.'),
('Sauropods', 'Long-necked, massive herbivores.');

INSERT INTO environments (name, description) VALUES
('Forest', 'Dense vegetation, home to many herbivores.'),
('Desert', 'Arid region with scarce vegetation.'),
('Plains', 'Open, grassy areas.'),
('Mountain', 'Rocky, elevated terrain.');

INSERT INTO dinosaurs (name, species_id, description, era_id, diet_id, size, weight, image_url) VALUES
('Tyrannosaurus', 1, 'Fearsome apex predator of the late Cretaceous.', 3, 1, '12m', '8000kg', 'https://images.squarespace-cdn.com/content/v1/598d04984c0dbf67c441eb69/1542608295760-89WUAVEDKQGSMS7WEW9A/rjpalmer_newrex_001.jpg'),
('Triceratops', 2, 'Iconic horned herbivore from the Cretaceous.', 3, 2, '9m', '6000kg', 'https://wallpapercat.com/w/full/6/c/4/1024763-1920x2974-iphone-hd-triceratops-wallpaper.jpg'),
('Velociraptor', 3, 'Fast, intelligent pack hunter.', 3, 1, '2m', '15kg', 'https://static1.colliderimages.com/wordpress/wp-content/uploads/2021/06/jurassic-world-social.jpg');

INSERT INTO dinosaur_categories (dinosaur_id, group_id) VALUES
(1, 1),
(2, 2),
(3, 3);

INSERT INTO dinosaur_environments (dinosaur_id, environment_id) VALUES
(1, 3),
(2, 1),
(3, 3),
(3, 2);

INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@dinux.com', '$2b$10$.6SS8p44qKWdRXGyDEoKDuZyXWNKRfpRuLJEisS0aFFk6LKnKWDUK', 'admin'),
('user', 'user@dinux.com', '$2b$10$uMMf.R72y6sTQkDn5mJ1UuXuYszrfOed64dgVBajvjfmI0AuoOCS2', 'user'),
('hubert', 'hubert@dinux.com', '$2b$10$uMMf.R72y6sTQkDn5mJ1UuXuYszrfOed64dgVBajvjfmI0AuoOCS2', 'user');

INSERT INTO favorites (user_id, dinosaur_id) VALUES
(2, 1),
(2, 2), 
(3, 3);

INSERT INTO vote_sessions (title, description, choice1_id, choice2_id) VALUES
('Best Dinosaur', 'Vote for your all-time favorite dino!', 1, 2),
('Most Dangerous Carnivore', 'Which meat-eater would you not want to meet?', 1, 3);

INSERT INTO votes (user_id, dinosaur_id, vote_session_id) VALUES
(2, 1, 1),
(2, 1, 2),
(3, 3, 2);
