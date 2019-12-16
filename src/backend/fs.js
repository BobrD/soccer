const fs = require("fs");

const prettyJson = data => JSON.stringify(data, null, 2);

const saveToFile = (file, data) => fs.writeFileSync(file, data);

const saveJsonToFile = (file, data, petty = true) =>
  saveToFile(`${file}.json`, petty ? prettyJson(data) : JSON.stringify(data))
;

const readJsonFromFile = file => JSON.parse(fs.readFileSync(`${file}.json`, 'UTF-8'));

module.exports = {saveJsonToFile, readJsonFromFile, saveToFile};