const fs = require('fs');
const path = require('path');
const express = require('express');
const { animals } = require('./data/animals');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));


function filterByQuery(query, animalsArray) {
    let personalityTraitsArray = [];
    // note that we save the animalsArray as a filtered results here:
    let filteredResults = animalsArray;
    if (query.personalityTraits) {
        //save personalityTraits as a dedicated array
        //if personalityTraits is a string, pace it in a new array
        if (typeof query.personalityTraits === 'string'){
            personalityTraits = [query.personalityTraits];
        } else {
            personalityTraitsArray = query.personalityTraits;
        }
        //loop through each trait in the personalityTraits array
        personalityTraitsArray.foreach(trait => {
            // Check the trait against each animal in the filteredResults array.
            // Remember, it is initially a copy of the animalsArray,
            // but here we're updating it for each trait in the .forEach() loop.
            // For each trait being targeted by the filter, the filteredResults
            // array will then contain only the entries that contain the trait,
            // so at the end we'll have an array of animals that have every one 
            // of the traits when the .forEach() loop is finished.
            filteredResults = filteredResults.filter(
                animal => animal.personalityTraits.indexOf(trait) !== -1
            );
        });
    }
    if (query.diet) {
        filteredResults = filteredResults.filter(animal => animal.diet === query.diet);
    }
    if (query.speces) {
        filteredResults = filteredResults.filter(animal => animal.species === query.species);
    }
    if (query.name) {
        filteredResults = filteredResults.filter(animal => animal.name === query.name);
    }
    return filteredResults;
}

function findById(id, animalsArray) {
    const result = animalsArray.filter(animal => animal.id === id)[0];
    return result;
  }
  
  app.get('/api/animals', (req, res) => {
    let results = animals;
    if (req.query) {
      results = filterByQuery(req.query, results);
    }
    res.json(results);
  });
  
  app.get('/api/animals/:id', (req, res) => {
    const result = findById(req.params.id, animals);
    if (result) {
      res.json(result);
    } else {
      res.send(404);
    }
});

//function accepts post routes req.body value and array we want to add data to
function createNewAnimal(body, animalsArray) {
  const animal = body;
  animalsArray.push(animal);

  fs.writeFileSync(
    path.join(__dirname, './data/animals.json'),
    JSON.stringify({ animals: animalsArray}, null, 2)
  );
  //return finished code to post route for response
  return animal;
}

function validateAnimal(animal) {
  if(!animal.name || typeof animal.name !== 'string'){
    return false;
  }
  if(!animal.species || typeof animal.species !== 'string') {
    return false;
  }

  if(!animal.diet || typeof animal.diet !== 'string') {
    return false;
  }

  if(!animal.personalityTraits || !Array.isArray(animal.personalityTraits)) {
    return false;
  }

  return true;
}

// another method of the app object that allows us to create routes - listening for POST requests
app.post('/api/animals', (req, res) => {
      //set id based on what the next index of the array will be 
      req.body.id = animals.length.toString();

      //if any data in req.body is incorrect, send 400 error baack
      if (!validateAnimal(req.body)) {
        res.status(400).send('The animal is not properly formatted.');
      } else {
        //add animal to json file and animals array in this function
        const animal = createNewAnimal(req.body, animals);
        res.json(animal);
      }
});

// parse incoming string or array data
app.use(express.urlencoded({ extended: true }));

// parse incoming JSON data
app.use(express.json());

// route to the server - respond with an HTML page to display in the browser
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/animals', (req,res) => {
  res.sendFile(path.join(__dirname, './public/animals.html'));
});

app.get('/zookeepers', (req, res) => {
  res.sendFile(path.join(__dirname, './public/zookeepers.html'));
});

//* means any route not previously defined will fall under this request
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});
  
