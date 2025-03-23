import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());

app.get('/', (req, res) => {
  res.send('Welcome to Dinux!');
});

const dinos = [
    { id: 1, name: 'Tyrannosaurus Rex', diet: 'carnivore' },
    { id: 2, name: 'Velociraptor', diet: 'carnivore' },
    { id: 3, name: 'Stegosaurus', diet: 'herbivore' },
    { id: 4, name: 'Triceratops', diet: 'herbivore' },
    { id: 5, name: 'Brachiosaurus', diet: 'herbivore' },
    { id: 6, name: 'Spinosaurus', diet: 'carnivore' },
    { id: 7, name: 'Ankylosaurus', diet: 'herbivore' },
    { id: 8, name: 'Pteranodon', diet: 'carnivore' },
    { id: 9, name: 'Allosaurus', diet: 'carnivore' },
    { id: 10, name: 'Diplodocus', diet: 'herbivore' },
]

app.get('/dinos', (req, res) => {
    res.json(dinos.map(d => ({ id: d.id, name: d.name })));
    }
);  

app.get('/dinos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const dino = dinos.find(d => d.id === id);
    if (dino) {
        res.json(dino);
    } else {
        res.status(404).send('Dino not found');
    }
    }
);

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
    }
);