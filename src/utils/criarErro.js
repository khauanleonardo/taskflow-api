function criarErro(mensagem, status = 500) {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
}

module.exports = criarErro;
