import express from 'express';
import fs from 'fs';

const app = express();
const port = 8080;

app.get('/', (req, res) => {
    const indexHtml = fs.readFileSync('index.html', 'utf-8');

    res.setHeader('Content-Type', 'text/html');
    res.send(indexHtml);
});

app.post('/carrinho/:id/atualizar/:produtoId',async (req, res) => {
    await CarrinhoDao.atualizar(req.params.id, req.params.produtoId, req.body.quantidade);
    res.json({ situacao: 'ok' });
});

app.get('/tela/usuario/:id/carrinho', async (req, res) => {
    const usuario = await UsuarioDao.pegar(req.params.id);
    const carrinho = await CarrinhoDao.pegar(usuario.carrinhoAtual);
    const produtos = await ProdutosDao.listar();

    const tela = montarTela(usuario, carrinho, produtos);

    res.json(tela);
});

const montarTela = (usuario, carrinho, produtos) => {
    const totalCarrinho = carrinho.produtos.reduce((acc, p) => acc + p.preco * p.quantidade, 0).toFixed(2);
    
    const sidebar = {
        backButton: { text: '←', action: 'goBack' },
        title: 'Carrinho',
        details: { label: 'Total:', value: `R$ ${totalCarrinho}` },
        checkoutButton: {
            text: 'Finalizar compra',
            action: 'request',
            href: `/checkout/${carrinho.id}`,
            method: 'POST',
            onSuccess: { action: 'goTo', href: `/checkout/${carrinho.id}` }
        }
    };

    const main = {
        search: { placeholder: 'Pesquisar' },
        products: produtos.map(p => {
            const produto = carrinho.produtos.find(cp => cp.id === p.id) ?? { quantidade: 0 };
            return {
                id: p.id,
                image: p.img,
                title: p.nome,
                description: p.descricao,
                price: `R$ ${p.preco.toFixed(2)}`,
                quantity: { value: produto.quantidade, min: 0, max: 10 },
                buttons: {
                    quantityUpdate: {
                        action: 'request',
                        href: `/carrinho/${carrinho.id}/atualizar/${p.id}`,
                        method: 'POST',
                        onSuccess: { action: 'refresh' },
                        body: { quantidade: '::quantity::' }
                    },
                    product: { action: 'goTo', href: `/produto/${p.id}` }
                }
            }
        })
    };

    return { sidebar, main };
}

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
