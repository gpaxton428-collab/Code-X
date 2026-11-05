import { makeFormatCommand, needPkg } from '../../lib/helpers/formatConvert.js';
export default makeFormatCommand({ name: 'yaml2json', alias: ['y2j'], description: 'Convert YAML text to JSON. Usage: .yaml2json <yaml>', example: 'name: Paxton',
  async convert(t) { const y = await needPkg('js-yaml'); return JSON.stringify((y.default || y).load(t), null, 2); } });
