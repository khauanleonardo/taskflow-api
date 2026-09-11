function middlewareFixo (req, res, next) {
    next();
}

app.use(middlewareFixo);

function criarMiddleware(configuracao) {
    return function(req, res, next) {
        if (configuracao.bloquear) {
            return res.status (403).json ({ erro: "Bloqueado" });
        }
        next();
    };
}

app.use("/admin", criarMiddleware({ bloquear: false }));
app.use("/restrito", criarMiddleware({ bloquear: true }));