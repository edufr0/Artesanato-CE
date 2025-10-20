
## Tópicos 

[Sobre a CE-Artesanato](#sobre-a-CE-Artesanato)

[Funcionalidades](#funcionalidades)

[Tecnologias e Ferramentas](#tecnologias-e-ferramentas)

[Instalação e uso](#instalação-e-uso)


<br>

## Sobre a CE-Artesanato

CE-Artesanato é um projeto de e-commerce, onde foram podemos comercializar produtos artesanais com maior facilidade e acessivel para todos.


## Funcionalidades

- [X] Cadastro de usuários.
- [X] Criação de anúncios.
- [X] Realização de pedidos.
- [X] Carrinho de compras.
- [X] Buscar produtos.
- [X] Upload de imagems com Multer.
- [X] Páginas dinâmicas com Nunjucks.
- [X] Banco de dados PostgreSQL.
- [X] Sistema de login e recuperação de senha.

<br>

## Tecnologias e Ferramentas

As seguintes tecnologias foram utilizadas no desenvolvimento do projeto:

- [HTML](https://devdocs.io/html/)
- [CSS](https://devdocs.io/css/)
- [JavaScript](https://devdocs.io/javascript/)
- [Nunjucks](https://mozilla.github.io/nunjucks/)
- [NodeJS](https://nodejs.org/en/)
- [Nodemailer](https://nodemailer.com/about/)
- [Express](https://expressjs.com/)
- [Express Session](https://github.com/expressjs/session)
- [Multer](https://github.com/expressjs/multer)
- [PostgreSQL](https://www.postgresql.org/)
- [BcryptJS](https://github.com/dcodeIO/bcrypt.js)
- [Faker.js](https://github.com/Marak/Faker.js)
- [Lottie](https://airbnb.design/lottie/)

<br>

## Instalação e Uso

Para rodar a aplicação, você precisa instalar o [Node](https://nodejs.org/en/) e o banco de dados [Postgres](https://www.postgresql.org/).

Siga os passos abaixo:

```bash
# Abra um terminal e copie este repositório com o comando
$ git clone https://github.com/Ivo-Aragao/Ce-Artesanato
# ou use a opção de download.

# Crie um .env na pasta do server.js e escreva:
 SMTP_HOST=smtp.gmail.com
 SMTP_PORT=587
 SMTP_USER=SEU EMAIL
 SMTP_PASS=SUA SENHA  # Gerar no Google Account > Security > App Passwords
 SMTP_FROM=SUA EMPRESA <SEU EMAIL>
 APP_URL=http://localhost:5000  # Ou seu domínio em 

# Instale as dependências
$ npm install

# Crie o banco de dados e as tabelas utilizando os comandos
# inclusos no arquivo "database.sql".
    
# Conexão com o banco de dados:
# Abra e edite o arquivo "db.js" dentro da pasta "src/config"
# com o seu user e password do Postgres.

# Popule o banco de dados usando o aquivo "seed.js":
$ node seed.js

# Rode a aplicação
$ npm start
```

**Importante:** Cuidado ao alterar/excluir a imagem de placeholder da pasta `plublic/images`, pois os produtos gerados pelo `seed.js` compartilham esse arquivo entre si.

<br>

## Licença
<br>

Esse projeto está sob a licença MIT. Veja o arquivo [LICENSE](/LICENSE) para mais detalhes.

---

Feito com :purple_heart: by [Ivo Aragão, Eduardo, Igor, Joacir]

