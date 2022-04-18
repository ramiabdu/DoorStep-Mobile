const fs = require('fs');
const path = require('path');
const seed = require('./seed');

const clone = value => JSON.parse(JSON.stringify(value));

class JsonStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.ensureDataFile();
  }

  ensureDataFile() {
    fs.mkdirSync(path.dirname(this.filePath), {recursive: true});

    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify(seed, null, 2));
    }
  }

  read() {
    const raw = fs.readFileSync(this.filePath, 'utf8');
    return JSON.parse(raw);
  }

  write(nextData) {
    fs.writeFileSync(this.filePath, JSON.stringify(nextData, null, 2));
    return nextData;
  }

  transact(mutator) {
    const data = this.read();
    const result = mutator(data);
    this.write(data);
    return result;
  }

  snapshot() {
    return clone(this.read());
  }
}

module.exports = {
  JsonStore,
};
