import exec from '@actions/exec';
import io from '@actions/io';
import { SUPPORTED_PRODUCTS } from '../constants';

const fetchRevProduct = async (rev: string, dir: string, product: string) => {
  const fbUrl = `https://www.facebook.com/btarchive/${encodeURIComponent(rev)}/${product}`;
  await io.mkdirP('./working/archives/');
  let exit = await exec.exec('curl', [fbUrl, '-o', `./working/archive/${product}.zip`]);
  if (exit !== 0) {
    return false;
  }
  await io.mkdirP(`${dir}/${product}/`);
  exit = await exec.exec('tar', ['-xzf', `./working/archive/${product}.zip`, `${dir}/${product}/`]);
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