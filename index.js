import express from 'express';
const app = express();
const port = 3000;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.get('/user/:id', (req, res) => {
    const usuario = UsuarioDao.pegar(req.params.id);
    res.json(usuario);
});

app.get('/produtos', async (req, res) => {
    const produtos = await ProdutosDao.listar()
    res.json(produtos);
});

app.get('/carrinho/:id',async (req, res) => {
    const carrinho = await CarrinhoDao.pegar(req.params.id);
    res.json(carrinho);
});

app.post('/carrinho/:id/atualizar/:produtoId',async (req, res) => {
    await CarrinhoDao.atualizar(req.params.id, req.params.produtoId, req.body.quantidade);
    res.json({ situacao: 'ok' });
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

const ProdutosDao = {
    listar: async () => [
        { id: 1, nome: 'Produto 1', preco: 10.00, img: 'http://localhost:3000/img/produto1.jpg', descricao: 'Descrição do produto 1' },
        { id: 2, nome: 'Produto 2', preco: 20.00, img: 'http://localhost:3000/img/produto2.jpg', descricao: 'Descrição do produto 2' },
        { id: 3, nome: 'Produto 3', preco: 30.00, img: 'http://localhost:3000/img/produto3.jpg', descricao: 'Descrição do produto 3' }
    ]
}

const UsuarioDao = {
    pegar: async id => ({ id, nome: 'Jeferson Alves', carrinhoAtual: 1 })
}

const carrinhos = {
    1: {
        id: 1,
        produtos: [
            { id: 1, nome: 'Produto 1', preco: 10.00, quantidade: 1 },
            { id: 2, nome: 'Produto 2', preco: 20.00, quantidade: 1 }
        ]
    }
}

const CarrinhoDao = {
    pegar: async id => (carrinhos[id] ?? { id }),
    atualizar: async (id, produtoId, quantidade) => {
        carrinhos[id].produtos.find(p => p.id === produtoId).quantidade = quantidade;
    }
}

