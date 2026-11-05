// Load an optional package on demand. If it is not installed (for example the host used
// `npm install --omit=optional`), the user gets a clear one-line message instead of a crash.
import { AppError } from '../utils/errors.js';

export async function needPkg(name) {
  try { return await import(name); }
  catch (err) {
    if (err?.code === 'ERR_MODULE_NOT_FOUND' || /Cannot find (package|module)/i.test(err?.message || '')) {
      const msg = `The "${name}" package is not installed on this host. Run: npm install ${name}`;
      throw new AppError(msg, { kind: 'config', userMessage: `📦 *Package missing*\n\n${msg}` });
    }
    throw err;
  }
}
