function randomString(len = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

module.exports = {
  generateUser: function (context, events, done) {
    const rnd = randomString(12);
    context.vars.user = {
      name: 'Perf',
      lastname: 'User',
      email: `perf_${rnd}@example.com`,
      password: `Pass_${rnd}!`,
    };
    return done();
  },
};