import fs, { promises as fsp } from 'fs';

/**
 * Create resource
 * @param {string} dir
 */
export const createResource = async (dir: string): Promise<void> => {
  try {
    const isExist = await isResourceExist(dir);
    if (!isExist) {
      await fsp.mkdir(dir, { recursive: true });
      await fsp.chmod(dir, 0o777);
    }
  } catch (e) {}
};

/**
 * Check if file or path exist
 * @param {string} path
 * @return Promise<void>
 */
const isResourceExist = async (path: string): Promise<boolean> =>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  !!(await fs.promises.stat(path).catch((e) => false));

/**
 * Delete file in directory
 * @param {string} file
 * @return Promise<void>
 */
export const deleteResource = async (file: string): Promise<void> => {
  try {
    return await fsp.unlink(file);
  } catch (e) {}
};
