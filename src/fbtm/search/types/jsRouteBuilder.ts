import { SearchType } from "../../../types";
import * as exec from '@actions/exec';
import * as fs from 'fs';

const jsRoutePathSearch: SearchType = {
  filename: 'js-route-builder.js',
  supportedPlatforms: [
    'facebook',
    'instagram',
    'messenger',
    'whatsapp' // i don't know if whatsapp uses this but might as well
  ],
  shouldDiff: true,
  performSearch: async (targetDirectory, outputFile) => {
    const outputStream = fs.createWriteStream(outputFile, {flags: 'a'});
    const result = await exec.exec('grep', ['-Rh', '"jsRouteBuilder\\")(\\""', targetDirectory], {
      outStream: outputStream
    });
    return result === 0;
  }
};

export default jsRoutePathSearch;