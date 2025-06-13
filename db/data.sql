INSERT INTO eras (name, start_date, end_date, description) VALUES
('Triassic', '2500-01-01', '2000-01-01', 'First era of dinosaurs.'),
('Jurassic', '2000-01-01', '1450-01-01', 'Era dominated by large herbivores and theropods.'),
('Cretaceous', '1450-01-01', '660-01-01', 'Last period before mass extinction.'),
('Permian', '2990-01-01', '2500-01-01', 'Pre-dinosaur era, ended with mass extinction.'),
('Paleogene', '660-01-02', '230-01-01', 'Post-dinosaur era, rise of mammals.');

INSERT INTO species (name, description) VALUES
('Tyrannosaurus rex', 'Large carnivorous dinosaur with massive jaws.'),
('Triceratops horridus', 'Herbivore with three facial horns and a bony frill.'),
('Velociraptor mongoliensis', 'Small, fast predator with a sickle-shaped claw.'),
('Brachiosaurus altithorax', 'Huge, long-necked herbivore.'),
('Stegosaurus stenops', 'Herbivore with plates along its back and spiked tail.'),
('Ankylosaurus magniventris', 'Armored dinosaur with clubbed tail.'),
('Spinosaurus aegyptiacus', 'Large carnivore with sail-like structure.'),
('Allosaurus fragilis', 'Large Jurassic predator.'),
('Diplodocus longus', 'Long-necked, whip-tailed herbivore.'),
('Pachycephalosaurus wyomingensis', 'Dome-headed herbivore.'),
('Parasaurolophus walkeri', 'Crested herbivore.'),
('Iguanodon bernissartensis', 'Large herbivore with thumb spikes.'),
('Carnotaurus sastrei', 'Carnivore with horns above eyes.'),
('Compsognathus longipes', 'Small, agile carnivore.'),
('Pteranodon longiceps', 'Large flying reptile.'),
('Oviraptor philoceratops', 'Egg-eating dinosaur.'),
('Deinonychus antirrhopus', 'Agile, sickle-clawed predator.'),
('Gallimimus bullatus', 'Fast, ostrich-like dinosaur.'),
('Dryosaurus altus', 'Small, fast Jurassic herbivore.'),
('Erlikosaurus andrewsi', 'Therizinosaur with long claws from the Cretaceous.'),
('Suchomimus tenerensis', 'Spinosaurid with crocodile-like snout.'),
('Proceratosaurus bradleyi', 'Early tyrannosauroid from the Jurassic.'),
('Tyrannotitan chubutensis', 'Large carcharodontosaurid predator.'),
('Sinoceratops zhuchengensis', 'Horned ceratopsian from China.'),
('Utahraptor ostrommaysorum', 'Large dromaeosaurid predator.'),
('Titanosaurus indicus', 'Large sauropod from the Cretaceous.'),
('Cotylorhynchus romeri', 'Large, early Permian synapsid.'),
('Aquilops americanus', 'Small ceratopsian from the Cretaceous.'),
('Quetzalcoatlus northropi', 'Giant pterosaur from the Cretaceous.'),
('Dimetrodon grandis', 'Sail-backed Permian synapsid.'),
('Stygimoloch spinifer', 'Pachycephalosaur with spikes.'),
('Gigantspinosaurus sichuanensis', 'Stegosaur with huge shoulder spines.'),
('Dilophosaurus wetherilli', 'Early Jurassic predator with double crest.');

INSERT INTO diets (name, description) VALUES
('carnivore', 'Eats other animals.'),
('herbivore', 'Feeds on plants.'),
('omnivore', 'Eats both plants and animals.'),
('insectivore', 'Feeds primarily on insects.');

INSERT INTO categories (name, description) VALUES
('Theropods', 'Bipedal carnivorous dinosaurs.'),
('Ceratopsians', 'Herbivores with beaked faces and horns.'),
('Dromaeosaurs', 'Fast, agile predators with claws.'),
('Sauropods', 'Long-necked, massive herbivores.'),
('Stegosaurs', 'Dinosaurs with plates and spikes.'),
('Hadrosaurs', 'Duck-billed herbivores.'),
('Ankylosaurs', 'Armored dinosaurs.'),
('Pterosaurs', 'Flying reptiles.'),
('Nodosaurs', 'Armored, no tail club.'),
('Ornithomimids', 'Ostrich-like dinosaurs.');

INSERT INTO environments (name, description) VALUES
('Forest', 'Dense vegetation, home to many herbivores.'),
('Desert', 'Arid region with scarce vegetation.'),
('Plains', 'Open, grassy areas.'),
('Mountain', 'Rocky, elevated terrain.'),
('Swamp', 'Wet, marshy lowlands.'),
('Lake', 'Freshwater habitat.'),
('Coast', 'Near the sea.');

INSERT INTO dinosaurs (name, species_id, description, era_id, diet_id, size, weight, image_url) VALUES
('Tyrannosaurus', 1, 'Fearsome apex predator of the late Cretaceous.', 3, 1, '12m', '8000kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/16-Tyrannotitan-qm41zrhkocqswpxka04ka2ldh2q27d906nuvp9aosg.jpeg'),
('Triceratops', 2, 'Iconic horned herbivore from the Cretaceous.', 3, 2, '9m', '6000kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/06-Triceratops-qm420fxdm1o9aky2baov2wfcx3dlrhy0y0ti6gagao.jpg'),
('Velociraptor', 3, 'Fast, intelligent pack hunter.', 3, 1, '2m', '15kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/21-Velociraptor-qm421jell36au7cpwrr6zmgpv9z0qsar3g7wc2nx1c.jpeg'),
('Brachiosaurus', 4, 'Massive, long-necked herbivore from the Jurassic.', 2, 2, '22m', '35000kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/18-Brachiosaurus-qm4211jnz8hupm2nt21a68yykyf1ojbuozto7teebk.jpg'),
('Stegosaurus', 5, 'Plated herbivore with spiked tail.', 2, 2, '9m', '3100kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/dinosaurio-stegosaurus-dinosaurland-r1n5jvppvyq7ahgc8fksp9wkzqen5sq9cnu2l3cav4.jpg'),
('Ankylosaurus', 6, 'Armored tank with clubbed tail.', 3, 2, '7m', '6000kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/dinosaurio-ankylosaurio-r2gca70xou3m2eme4kcf3fpppnbh2jkozj8tubvzls.jpg'),
('Spinosaurus', 7, 'Sail-backed river predator.', 3, 1, '15m', '9000kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/dinosaurio-pinosaurus-dinosaurland-r03enx835upwzbn6kcsjwan84pe948cdugy7os3xmo.jpg'),
('Allosaurus', 8, 'Large Jurassic predator.', 2, 1, '10m', '2200kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/03-Allosaurus-qm4212hi62j5181ankfwqqqf6caew8fl14h5p3d05c.jpg'),
('Diplodocus', 9, 'Long-necked, whip-tailed herbivore.', 2, 2, '25m', '15000kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/08-Diplodocus-qm41z6t4hzyhtarlmr6rr7t8eljzi0ywrti7565clc.jpeg'),
('Pachycephalosaurus', 10, 'Dome-headed herbivore.', 3, 2, '5m', '450kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/pachycephalosaurus-dinosaurland-r62up0oxc3vi9j8dtzbwfc0vwxv96hv0ys9mes4xz4.jpg'),
('Parasaurolophus', 11, 'Crested, duck-billed herbivore.', 3, 2, '10m', '2500kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/dinosaurio-parasaurolophus-dinosaurland-r03eo3syhoyx8ldmhxmxvqzgaehtm42i7dim1pu6f4.jpg'),
('Iguanodon', 12, 'Large herbivore with thumb spikes.', 2, 2, '10m', '3500kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/dinosaurio-iguanodon-dinosaurland-r2cxpiqvr7hcbua01nue7gjjreturqk9ytnwvsls00.jpg'),
('Carnotaurus', 13, 'Carnivore with horns above eyes.', 3, 1, '8m', '1500kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/dinosaurio-carnotaurus-dinosaurland-r03enx835upwzbn6kcsjwan84pe948cdugy7os3xmo.jpg'),
('Compsognathus', 14, 'Small, agile carnivore.', 2, 1, '1m', '3kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/32-Compsognathus-qmi38pwo0i1y8bgijs2p5nhfc9oa6x57xmx7umcm4g.webp'),
('Pteranodon', 15, 'Large flying reptile.', 3, 3, '7m', '25kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/34-Pteranodon-qm420u0ygk7k4qdl0ys9mav9tvg3yyhzzylsdlpjpc.jpg'),
('Oviraptor', 16, 'Egg-eating dinosaur.', 3, 3, '2m', '20kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/39-Oviraptor-qm420vwmu8a4ryaupzlirae70n6uecpgo7wrc5mrcw.jpg'),
('Deinonychus', 17, 'Agile, sickle-clawed predator.', 3, 1, '3m', '70kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/22-Deinonychus-qm41yzaezbo78f2iunxr79pjnil1sg522sabayghz4.jpeg'),
('Gallimimus', 18, 'Fast, ostrich-like dinosaur.', 3, 3, '6m', '440kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/15-Gallimimus-qm41zsfev6s38bw74ij6ukcu2glff2cqisid6j9am8.jpeg'),
('Dryosaurus', 19, 'Small, fast Jurassic herbivore.', 2, 2, '3m', '80kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/40-Dryosaurus-qm41z08965phk115p6cdrrh08wgf058sewxss8f3sw.jpeg'),
('Erlikosaurus', 20, 'Therizinosaur with long claws.', 3, 2, '4m', '150kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/09-Erlikosaurus-qm4209cia7f91b7mdpuh3g34rea19m7wl493tik7i8.jpeg'),
('Suchomimus', 21, 'Spinosaurid with crocodile-like snout.', 3, 1, '11m', '3500kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/13-Suchomimus-qm41qnfwf69qct62hkbrlvdi5lmyl02olk6f7ot340.jpeg'),
('Proceratosaurus', 22, 'Early tyrannosauroid.', 2, 1, '3m', '40kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/20-Proceratosaurus-qm41zkwpcihsng74cfa6am95bdmhphivtrahcbkg00.jpeg'),
('Tyrannotitan', 23, 'Large carcharodontosaurid predator.', 3, 1, '13m', '7000kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/16-Tyrannotitan-qm41zrhkocqswpxka04ka2ldh2q27d906nuvp9aosg.jpeg'),
('Sinoceratops Zhuchengensis', 24, 'Horned ceratopsian from China.', 3, 2, '6m', '2000kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/01-Sinoceratops-qm41z4xg4bvx62ubxqdim8ab7tt92mrg3k786m84xs.jpeg'),
('Utahraptor', 25, 'Large dromaeosaurid predator.', 3, 1, '7m', '500kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/19-Utahraptor-qm41zmsdq6kdao4e1g3ffls2i5d84vqci0lgavhnnk.jpeg'),
('Titanosaurus', 26, 'Large sauropod.', 3, 2, '12m', '13000kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/17-Titanosaurus-qm41qfx6whzfrxgzph2r1x9teio0vf8twiyjdh48hs.jpeg'),
('Cotylorhynchus', 27, 'Large, early Permian synapsid.', 4, 2, '6m', '2000kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/07-Cotylorinchus-qm420ezjf7myyyzfgsa8ienwbpi8jsualw60p6bugw.jpeg'),
('Aquilops', 28, 'Small ceratopsian.', 3, 2, '0.6m', '1.5kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/dinosaurio-aquilops-r62up3ifwlzd8d4adijs4tb9p3hctl67z682um0rgg.jpg'),
('Quetzalcoatlus', 29, 'Giant pterosaur.', 3, 3, '10m', '200kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/dinosaurio-quetzalcoatlus-dinosaurland-r3ur3tnxauwv45vpmdvsxq0ssq6etbjw6z1ysp2dc0.webp'),
('Dimetrodon', 30, 'Sail-backed Permian synapsid.', 4, 1, '3m', '250kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/dinosaurio-dimetrodon-dinosaurland-r35cook4ux37xorraelio94ohifrmzuakcl0hglssg.jpg'),
('Stygimoloch', 31, 'Pachycephalosaur with spikes.', 3, 2, '3m', '80kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/dinosaurio-stygimoloch-dinosaurland-r4tyonaz4qt315npzfa9yfspirst2ep4sh8sgstnnk.jpg'),
('Gigantspinosaurus', 32, 'Stegosaur with huge shoulder spines.', 2, 2, '4m', '700kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/dinosario-gigantspinosaurio-dinosaurland-r4s0qa5ogbct3vq3gui7jxtligi284ynvq88catudc.webp'),
('Dilophosaurus', 33, 'Early Jurassic predator with double crest.', 2, 1, '7m', '400kg', 'https://dinosaurland.es/wp-content/uploads/elementor/thumbs/dinosaurio-dilophosaurio-dinosaurland-r1n5kl3d0hoxzyfh48jq2li114xjxmj0g5g6jkao74.jpg');

INSERT INTO dinosaur_categories (dinosaur_id, group_id) VALUES
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 7), (7, 1), (8, 1), (9, 4), (10, 6),
(11, 6), (12, 6), (13, 1), (14, 1), (15, 8), (16, 1), (17, 3), (18, 10), (19, 6), (20, 1),
(21, 1), (22, 1), (23, 1), (24, 2), (25, 3), (26, 4), (27, 1), (28, 2), (29, 8), (30, 1), 
(31, 6), (32, 5), (33, 1);

INSERT INTO dinosaur_environments (dinosaur_id, environment_id) VALUES
(1, 3), (2, 1), (3, 3), (3, 2), (4, 4), (4, 3), (5, 1), (5, 5), (6, 1), (7, 6),
(8, 3), (9, 3), (10, 1), (11, 3), (12, 3), (13, 2), (14, 2), (15, 7), (16, 1), (17, 3), (18, 3), (19, 1), (20, 1),
(21, 6), (22, 1), (23, 2), (24, 1), (25, 3), (26, 3), (27, 4), (28, 1), (29, 7), (30, 4),
(31, 1), (32, 1), (33, 1);

INSERT INTO users (username, email, password, role, status) VALUES
('admin', 'admin@dinux.com', '$2b$10$.6SS8p44qKWdRXGyDEoKDuZyXWNKRfpRuLJEisS0aFFk6LKnKWDUK', 'admin', 'activated'),
('user', 'user@dinux.com', '$2b$10$uMMf.R72y6sTQkDn5mJ1UuXuYszrfOed64dgVBajvjfmI0AuoOCS2', 'user', 'blocked'),
('hubert', 'hubert@dinux.com', '$2b$10$uMMf.R72y6sTQkDn5mJ1UuXuYszrfOed64dgVBajvjfmI0AuoOCS2', 'user', 'activated'),
('eryk', 'eryk@dinux.com', '$2b$10$uMMf.R72y6sTQkDn5mJ1UuXuYszrfOed64dgVBajvjfmI0AuoOCS2', 'user', 'activated'),
('michał', 'michal@dinux.com', '$2b$10$uMMf.R72y6sTQkDn5mJ1UuXuYszrfOed64dgVBajvjfmI0AuoOCS2', 'user', 'activated'),
('carol', 'carol@dinux.com', '$2b$10$uMMf.R72y6sTQkDn5mJ1UuXuYszrfOed64dgVBajvjfmI0AuoOCS2', 'user', 'activated'),
('dave', 'dave@dinux.com', '$2b$10$uMMf.R72y6sTQkDn5mJ1UuXuYszrfOed64dgVBajvjfmI0AuoOCS2', 'user', 'activated'),
('eve', 'eve@dinux.com', '$2b$10$uMMf.R72y6sTQkDn5mJ1UuXuYszrfOed64dgVBajvjfmI0AuoOCS2', 'user', 'activated'),
('frank', 'frank@dinux.com', '$2b$10$uMMf.R72y6sTQkDn5mJ1UuXuYszrfOed64dgVBajvjfmI0AuoOCS2', 'user', 'activated'),
('grace', 'grace@dinux.com', '$2b$10$uMMf.R72y6sTQkDn5mJ1UuXuYszrfOed64dgVBajvjfmI0AuoOCS2', 'user', 'activated'),
('heidi', 'heidi@dinux.com', '$2b$10$uMMf.R72y6sTQkDn5mJ1UuXuYszrfOed64dgVBajvjfmI0AuoOCS2', 'user', 'activated'),
('ivan', 'ivan@dinux.com', '$2b$10$uMMf.R72y6sTQkDn5mJ1UuXuYszrfOed64dgVBajvjfmI0AuoOCS2', 'user', 'activated');

INSERT INTO favorites (user_id, dinosaur_id) VALUES
(1, 3), (2, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 7), (8, 8), (9, 9), (10, 10), (11, 11), (12, 12),
(3, 13), (4, 14), (5, 15), (6, 16), (7, 17), (8, 18), (9, 19), (10, 20), (11, 21), (12, 22);

INSERT INTO vote_sessions (title, description, choice1_id, choice2_id) VALUES
('Best Dinosaur', 'Vote for your all-time favorite dino!', 1, 2),
('Most Dangerous Carnivore', 'Which meat-eater would you not want to meet?', 1, 7),
('Gentlest Giant', 'Which herbivore would you want as a pet?', 4, 9),
('Coolest Crest', 'Which crested dino is best?', 11, 23),
('Best Armored Dino', 'Who has the best defense?', 6, 30);

INSERT INTO votes (user_id, dinosaur_id, vote_session_id) VALUES
(2, 1, 1), (3, 2, 1), (4, 1, 2), (5, 7, 2), (6, 4, 3), (7, 9, 3), (8, 11, 4), (9, 23, 4), (10, 6, 5), (11, 30, 5);