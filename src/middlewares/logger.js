function logger(req, res, next) {
  const agora = new Date().toLocaleTimeString();
  console.log(`[${agora}] ${req.method} ${req.url}`);
  next();
}

module.exports = logger;
