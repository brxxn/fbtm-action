import { SUPPORTED_PRODUCTS } from "../constants";
import searchRegistry from "./search/registry";
import * as core from '@actions/core';
import * as io from '@actions/io';

const performSearchForProduct = async (rev: string, path: string, product: string) => {
  await io.mkdirP(`./searches/${product}/${rev}/`);
  let promises: Promise<boolean>[] = [];
  for (const searchType of searchRegistry) {
    if (!searchType.supportedPlatforms.includes(product)) {
      continue;
    }
    const outputFile = `./searches/${product}/${rev}/${searchType.filename}`;
    console.log(`Searching ${path}/${product}/ to ${outputFile}`);
    promises.push(searchType.performSearch(`${path}/${product}/`, outputFile));
  }
  return (await Promise.all(promises)).every(x => x);
}

const performSearch = async (rev: string, path: string) => {
  try {
    let promises: Promise<boolean>[] = [];
    for (const product of SUPPORTED_PRODUCTS) {
      promises.push(performSearchForProduct(rev, path, product));
    }
    return (await Promise.all(promises)).every(x => x);
  } catch (exception) {
    // probably not supposed to do this but idgaf
    core.warning(exception as string);
    return false;
  }
}

export default performSearch;