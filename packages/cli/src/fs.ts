import { readdir, stat } from 'fs/promises'

export async function nestedFiles(folder: string, results: string[] = []) {
  const files = await readdir(folder)
  const paths = files.map(inner => `${folder}/${inner}`)
  for (const path of paths)
    if ((await stat(path)).isDirectory()) await nestedFiles(path, results)
    else results.push(path)
  return results
}
