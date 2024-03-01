import * as exec from '@actions/exec';
import * as io from '@actions/io';
import * as fs from 'fs';
import { SUPPORTED_PRODUCTS } from '../constants';

const fetchRevProduct = async (rev: string, dir: string, product: string) => {
  const fbUrl = `https://www.facebook.com/btarchive/${encodeURIComponent(rev)}/${product}`;
  await io.mkdirP('./working/archive/');
  const archiveFile = `./working/archive/${product}.zip`;
  let fd = fs.openSync(archiveFile, 'w');
  fs.closeSync(fd);
  let exit = await exec.exec('curl', [fbUrl, '-L', '-o', archiveFile]);
  if (exit !== 0) {
    return false;
  }
  await io.mkdirP(`${dir}/${product}/`);
  exit = await exec.exec('unzip', [archiveFile, '-d', `${dir}/${product}/`]);
  return exit === 0;
}

const fetchRev = async (rev: string, dir: string) => {
  let promises: Promise<boolean>[] = [];
  for (const product of SUPPORTED_PRODUCTS) {
    promises.push(fetchRevProduct(rev, dir, product));
  }
  return (await Promise.all(promises)).every(x => x);
}

export default fetchRev;