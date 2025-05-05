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
('Tyrannosaurus', 1, 'Fearsome apex predator of the late Cretaceous.', 3, 1, '12m', '8000kg', 'trex.jpg'),
('Triceratops', 2, 'Iconic horned herbivore from the Cretaceous.', 3, 2, '9m', '6000kg', 'triceratops.jpg'),
('Velociraptor', 3, 'Fast, intelligent pack hunter.', 3, 1, '2m', '15kg', 'velociraptor.jpg');

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
('admin', 'admin@dinux.com', 'admin', 'admin'),
('user', 'user@dinux.com', 'user', 'user'),
('hubert', 'hubert@dinux.com', 'hubert', 'user');

INSERT INTO favorites (user_id, dinosaur_id) VALUES
(2, 1),
(2, 2), 
(3, 3);

INSERT INTO vote_sessions (title, description) VALUES
('Best Dinosaur', 'Vote for your all-time favorite dino!'),
('Most Dangerous Carnivore', 'Which meat-eater would you not want to meet?');


INSERT INTO votes (user_id, dinosaur_id, vote_session_id) VALUES
(2, 1, 1),
(2, 2, 1),
(3, 3, 2);