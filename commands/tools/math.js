import { needPkg } from '../../lib/helpers/needPkg.js';
import { reply, replyError, usage } from '../../lib/helpers/reply.js';

let instance;
async function getMath() {
  if (instance) return instance;
  const { create, all } = await needPkg('mathjs');
  const math = create(all);
  // Standard hardening for evaluating untrusted input, plus functions that could build huge matrices.
  const blocked = {};
  for (const fn of ['import', 'createUnit', 'evaluate', 'parse', 'simplify', 'derivative', 'resolve', 'ones', 'zeros', 'identity', 'range', 'diag', 'matrix', 'sparse', 'reshape', 'resize']) {
    blocked[fn] = () => { throw new Error(`"${fn}" is disabled`); };
  }
  const evaluate = math.evaluate.bind(math);
  math.import(blocked, { override: true });
  return (instance = { evaluate, math });
}

export default {
  name: 'math',
  alias: ['mathx', 'solve', 'evalmath'],
  description: 'Advanced calculator: units, trig, logs, fractions. Usage: .math 5 km to miles | sqrt(144) + sin(pi/2)',
  async execute(sock, msg, args, prefix) {
    const expr = args.join(' ').trim();
    if (!expr) return reply(sock, msg, usage(prefix, 'math <expression>', 'math 12 inch to cm'));
    if (expr.length > 150 || /\d{12,}/.test(expr)) return reply(sock, msg, '❌ That expression is too long or uses numbers that are too big.');
    try {
      const { evaluate, math } = await getMath();
      const result = evaluate(expr);
      const shown = typeof result === 'function' ? 'function' : math.format(result, { precision: 12 });
      await reply(sock, msg, `🧮 *${expr}*\n= ${shown}`);
    } catch (err) {
      if (err.kind === 'config') return replyError(sock, msg, err, 'math');
      await reply(sock, msg, `❌ ${String(err.message || err).slice(0, 140)}`);
    }
  }
};
