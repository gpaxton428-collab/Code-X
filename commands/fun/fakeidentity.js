import { needPkg } from '../../lib/helpers/needPkg.js';
import { reply, replyError } from '../../lib/helpers/reply.js';

export default {
  name: 'fakeidentity',
  alias: ['fakeperson', 'randomuser', 'fakeid'],
  description: 'Generate a made-up person (name, email, city, job). For fun and testing. Usage: .fakeidentity',
  async execute(sock, msg) {
    try {
      const { faker } = await needPkg('@faker-js/faker');
      const f = faker;
      await reply(sock, msg, `🎭 *Fake identity* _(not a real person)_\n\n👤 ${f.person.fullName()}\n🎂 ${f.date.birthdate({ min: 18, max: 60, mode: 'age' }).toDateString()}\n📧 ${f.internet.email()}\n🆔 @${f.internet.username()}\n📍 ${f.location.city()}, ${f.location.country()}\n💼 ${f.person.jobTitle()} at ${f.company.name()}\n📞 ${f.phone.number()}`);
    } catch (err) { await replyError(sock, msg, err, 'fakeidentity'); }
  }
};
