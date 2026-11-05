import { makeFormatCommand, needPkg } from '../../lib/helpers/formatConvert.js';
export default makeFormatCommand({ name: 'json2yaml', alias: ['j2y'], description: 'Convert JSON text to YAML. Usage: .json2yaml <json>', example: '{"name":"Paxton"}',
  async convert(t) { const y = await needPkg('js-yaml'); return (y.default || y).dump(JSON.parse(t)); } });
