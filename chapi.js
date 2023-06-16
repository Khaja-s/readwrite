const express = require('express');
const fs = require('fs');
const path = require('path');
const dataFilePath = path.join(__dirname, 'data.json');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Helper function to read data from the JSON file
function readDataFromFile() {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data file:', error);
    return { checklists: [] };
  }
}

// Helper function to write data to the JSON file
function writeDataToFile(data) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing data to file:', error);
  }
}

// Get all checklists
app.get('/checklists', (req, res) => {
  const data = readDataFromFile();
  const checklists = data.checklists;
  res.json(checklists);
});

// Get a specific checklist by name
app.get('/checklists/:name', (req, res) => {
  const name = req.params.name;
  const data = readDataFromFile();
  const checklist = data.checklists.find((item) => item.name === name);

  if (checklist) {
    res.json(checklist);
  } else {
    res.status(404).json({ error: 'Checklist not found' });
  }
});

// Add a new checklist
app.post('/checklists', (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  const data = readDataFromFile();
  const newChecklist = { name, items: [] };
  data.checklists.push(newChecklist);
  writeDataToFile(data);

  res.status(201).json(newChecklist);
});

// Add an item to a checklist
app.post('/checklists/:name/items', (req, res) => {
  const name = req.params.name;
  const { itemName, itemSerial } = req.body;

  if (!itemName || !itemSerial) {
    res.status(400).json({ error: 'Item name and serial are required' });
    return;
  }

  const data = readDataFromFile();
  const checklist = data.checklists.find((item) => item.name === name);

  if (checklist) {
    const newItem = { name: itemName, serial: itemSerial };
    checklist.items.push(newItem);
    writeDataToFile(data);
    res.status(201).json(newItem);
  } else {
    res.status(404).json({ error: 'Checklist not found' });
  }
});

// Delete a checklist
app.delete('/checklists/:name', (req, res) => {
  const name = req.params.name;
  const data = readDataFromFile();
  const index = data.checklists.findIndex((item) => item.name === name);

  if (index !== -1) {
    data.checklists.splice(index, 1);
    writeDataToFile(data);
    res.sendStatus(204);
  } else {
    res.status(404).json({ error: 'Checklist not found' });
  }
});

// Delete an item from a checklist
app.delete('/checklists/:name/items/:serial', (req, res) => {
  const name = req.params.name;
  const serial = req.params.serial;
  const data = readDataFromFile();
  const checklist = data.checklists.find((item) => item.name === name);

  if (checklist) {
    const index = checklist.items.findIndex((item) => item.serial === serial);

    if (index !== -1) {
      checklist.items.splice(index, 1);
      writeDataToFile(data);
      res.sendStatus(204);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } else {
    res.status(404).json({ error: 'Checklist not found' });
  }
});

// Start the server
app.listen(3000, () => {
  console.log('API server listening on port 3000');
});
