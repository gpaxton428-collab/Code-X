import { makeFormatCommand, needPkg } from '../../lib/helpers/formatConvert.js';
export default makeFormatCommand({ name: 'csv2json', alias: ['c2j'], description: 'Convert CSV text (first row = headers) to JSON. Usage: .csv2json <csv>', example: 'name,age\nPaxton,20',
  async convert(t) { const m = await needPkg('papaparse'); const Papa = m.default || m; return JSON.stringify(Papa.parse(t, { header: true, skipEmptyLines: true }).data, null, 2); } });
