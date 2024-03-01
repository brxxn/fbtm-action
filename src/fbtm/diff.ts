import io from '@actions/io';
import fs from 'fs';
import searchRegistry from './search/registry';
import { SUPPORTED_PRODUCTS } from '../constants';


const diffFile = async (oldFile: string, newFile: string, outputFile: string) => {
  // TODO: rework this!!
  // I believe it is incredibly inefficient in terms of both memory and CPU
  // and something better can definitely be done here.
  const oldContent = fs.readFileSync(oldFile, 'utf-8').split('\n');
  const newContent = fs.readFileSync(newFile, 'utf-8').split('\n');
  const added = newContent.filter(x => !oldContent.includes(x))
  const removed = oldContent.filter(x => !newContent.includes(x));
  const content = `// new lines (count = ${added.length}):\n\n${added.join('\n')}\n\n// old lines (count = ${removed.length})\n\n${removed.join('\n')}`
  fs.writeFileSync(outputFile, content, { encoding: 'utf-8', mode: 'a' });
};

const performDiffForProduct = async (oldRev: string, newRev: string, product: string) => {
  const oldSearchRoot = `./search/${product}/${oldRev}/`;
  const newSearchRoot = `./search/${product}/${newRev}/`;
  const outputRoot = `./diff/${product}/${oldRev}-${newRev}/`;
  await io.mkdirP(outputRoot);
  let promises: Promise<void>[] = [];
  for (const searchType of searchRegistry) {
    const oldSearchFile = oldSearchRoot + searchType.filename;
    if (!fs.existsSync(oldSearchFile)) {
      return false;
    }
    const newSearchFile = newSearchRoot + searchType.filename;
    promises.push(diffFile(oldSearchFile, newSearchFile, outputRoot + searchType.filename));
  }
  return true;
};

const performDiff = async (oldRev: string, newRev: string) => {
  let promises: Promise<boolean>[] = [];
  for (const product of SUPPORTED_PRODUCTS) {
    promises.push(performDiffForProduct(oldRev, newRev, product));
  }
  return (await Promise.all(promises)).every(x => x);
};

export default performDiff;