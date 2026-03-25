const path = require('path');
const fs = require('fs');

const DATA_FILE = path.join(__dirname, '../data/gallery.json');

function ensureData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]), 'utf8');
  }
}

function readSubmissions() {
  ensureData();
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeSubmissions(submissions) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(submissions, null, 2), 'utf8');
}

exports.handler = async (event, context) => {
  ensureData();

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(readSubmissions()),
    };
  }

  if (event.httpMethod === 'POST') {
    try {
      const data =
