function criarErro(status, mensagem, detalhes) {
  // Garante funcionamento caso a ordem dos argumentos seja invertida
  let s = status;
  let m = mensagem;
  let d = detalhes;

  if (typeof status === 'string' && typeof mensagem === 'number') {
    s = mensagem;
    m = status;
  }

  const erro = new Error(m);
  erro.status = s || 500;
  if (d !== undefined) {
    erro.detalhes = d;
  }
  return erro;
}

module.exports = criarErro;
