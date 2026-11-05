import { makeFormatCommand, needPkg } from '../../lib/helpers/formatConvert.js';
export default makeFormatCommand({ name: 'xml2json', alias: ['x2j'], description: 'Convert XML text to JSON. Usage: .xml2json <xml>', example: '<a><b>1</b></a>',
  async convert(t) { const { XMLParser } = await needPkg('fast-xml-parser'); return JSON.stringify(new XMLParser().parse(t), null, 2); } });
