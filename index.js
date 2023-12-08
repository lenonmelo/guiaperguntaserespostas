const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const connection = require("./database/database");
const Pergunta = require("./database/Pergunta");
const Resposta = require("./database/Resposta");

//Database
connection
    .authenticate()
    .then(() => {
        console.log("COnexão realizada com sucesso");
    })
    .catch((msgErro) => {
        console.log(msgErro);
    })

app.set('view engine', 'ejs');
app.use(express.static('public'));

//Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    Pergunta.findAll({
        raw: true, order: [
            ['id', 'DESC']
        ]
    }).then(perguntas => {
        res.render("index", { perguntas: perguntas });
    });

});

app.get("/perguntar", (req, res) => {
    res.render("perguntar");
});

//Rota para salvar a pergunta no banco de dados
app.post('/salvarpergunta', (req, res) => {
    var titulo = req.body.titulo;
    var descricao = req.body.descricao;

    Pergunta.create({
        titulo: titulo,
        descricao: descricao
    }).then(() => {
        res.redirect("/");
    });
})


app.get("/pergunta/:id", (req, res) => {
    var id = req.params.id;
    Pergunta.findOne({
        where: {
            id: id
        }
    }).then(pergunta => {
        if (pergunta != undefined) { // Pergunta encontrada
            Resposta.findAll({
                where: { pergunta_id: id },
                order: [
                    ["id", "DESC"]
                ]
            }).then(respostas => {
                res.render('pergunta', {
                    pergunta: pergunta,
                    respostas: respostas
                });
            });
        } else { //Não encontrada
            res.redirect('/');
        }
    });
});

app.post("/responder", (req, res) => {

    var corpo = req.body.corpo
    var perguntaId = req.body.pergunta_id

    console.log(perguntaId);
    Resposta.create({
        corpo: corpo,
        pergunta_id: perguntaId
    }).then(() => {
        res.redirect("/pergunta/" + perguntaId);
    });

});
app.listen(8080, () => {
    console.log("App rodando");
})