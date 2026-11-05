import { runPing } from '../../lib/helpers/statusText.js';

export default {
  name: 'ping',
  alias: ['ping2', 'speed', 'p', 'pong', 'latency'],
  description: 'Check response time, runtime, plugin count and connection status. Usage: .ping',
  async execute(sock, msg, args, prefix, ctx) { await runPing(sock, msg, ctx); }
};
