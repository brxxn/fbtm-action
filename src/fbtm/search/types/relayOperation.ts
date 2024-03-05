import { SearchType } from "../../../types";
import * as exec from '@actions/exec';
import * as fs from 'fs';

// don't need to export these interfaces, only used here
interface SearchResultMetadata {
  resultCount: number;
  invalidResultCount: number;
};

interface ModifiedDocumentResult {
  previousDocId: string;
  updatedDocId: string;
};

const relayOperationSearchType: SearchType = {
  filename: 'relay-operations.js',
  supportedPlatforms: [
    'facebook',
    'instagram',
    'messenger',
    'whatsapp' // i don't know if whatsapp uses this but might as well
  ],
  shouldDiff: true,
  performSearch: async (targetDirectory, outputFile) => {
    const result = await exec.getExecOutput('grep', ['-Rh', 'RelayOperation",\\[', targetDirectory], {
      silent: true
    });
    const lines = result.stdout.split('\n');
    let resultObject: {[key: string]: string|SearchResultMetadata} = {};
    let invalidResults = 0;
    for (const line of lines) {
      const nameMatch = line.match(/__d\("(([A-Z]|[a-z]|[0-9]|_)+)",\[/);
      if (nameMatch === null) {
        console.warn(`found invalid name match while diffing: ${line}`);
        invalidResults++;
        continue;
      }
      const exportsMatch = line.match(/\.exports\="(([0-9])+)"/);
      if (exportsMatch === null) {
        console.warn(`found invalid export match while diffing: ${line}`);
        invalidResults++;
        continue;
      }

      const name = nameMatch[1];
      const docId = exportsMatch[1];
      resultObject[name] = docId;
    }
    resultObject['__metadata'] = {
      resultCount: Object.keys(resultObject).length,
      invalidResultCount: invalidResults
    };
    const resultString = JSON.stringify(resultObject, null, 2);
    fs.writeFileSync(outputFile, resultString, { encoding: 'utf-8' });
    return true;
  },
  performDiff: async (oldFile, newFile, outputFile) => {
    const oldContent = fs.readFileSync(oldFile, 'utf-8');
    const newContent = fs.readFileSync(newFile, 'utf-8');
    let oldObject: {[key: string]: string} = {};
    let newObject: {[key: string]: string} = {};

    try {
      oldObject = JSON.parse(oldContent);
      newObject = JSON.parse(newContent);
    } catch (exception) {
      console.error(exception);
      return false;
    }

    // filter out metadata keys
    delete oldObject['__metadata'];
    delete newObject['__metadata'];

    // form our added, removed, updated objects
    let added: {[key: string]: string} = {};
    let removed: {[key: string]: string} = {};
    let updated: {[key: string]: ModifiedDocumentResult} = {};

    const newObjectKeys = Object.keys(newObject);
    const oldObjectKeys = Object.keys(oldObject);

    for (const newDocName of newObjectKeys.filter(x => !oldObjectKeys.includes(x))) {
      added[newDocName] = newObject[newDocName];
    }

    for (const newDocName of oldObjectKeys.filter(x => !newObjectKeys.includes(x))) {
      removed[newDocName] = oldObject[newDocName];
    }

    for (const sharedDocName of newObjectKeys.filter(x => oldObjectKeys.includes(x))) {
      if (newObject[sharedDocName] === oldObject[sharedDocName]) {
        continue;
      }
      updated[sharedDocName] = {
        previousDocId: oldObject[sharedDocName],
        updatedDocId: newObject[sharedDocName]
      };
    }

    // finally, write our results to a file
    const resultObject = { 
      __metadata: {
        addedCount: Object.keys(added).length,
        removedCount: Object.keys(removed).length,
        updatedCount: Object.keys(updated).length
      },
      added, removed, updated
    };
    const resultString = JSON.stringify(resultObject, null, 2);
    fs.writeFileSync(outputFile, resultString, { encoding: 'utf-8' });

    return true;
  },
};

export default relayOperationSearchType;