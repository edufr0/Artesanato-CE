-- Remova as tabelas e visões existentes, se necessário, para evitar conflitos
DROP VIEW IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "orders" CASCADE;
DROP TABLE IF EXISTS "files" CASCADE;
DROP TABLE IF EXISTS "products_with_deleted" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;
DROP TABLE IF EXISTS "session" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Remova a função trigger_set_timestamp se já existir
DROP FUNCTION IF EXISTS trigger_set_timestamp();

-- Criação da tabela de produtos
CREATE TABLE "products" (
  "id" SERIAL PRIMARY KEY,
  "category_id" int NOT NULL,
  "user_id" int,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "old_price" int,
  "price" int NOT NULL,
  "quantity" int DEFAULT 0,
  "status" int DEFAULT 1,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now()),
  "deleted_at" timestamp
);

-- Criação da tabela de categorias
CREATE TABLE "categories" (
  "id" SERIAL PRIMARY KEY,
  "name" text NOT NULL
);

-- Inserção de dados na tabela de categorias
INSERT INTO categories("name") VALUES
('Acessórios'),
('Casa e Decoração'),
('Moda e Vestuário'),
('Papelaria e Personalizados'),
('Brinquedos e Jogos'),
('Arte e Pintura'),
('Bijuterias e Joias Artesanais'),
('Presentes e Lembrancinhas'),
('Eco-Friendly e Sustentáveis');

-- Criação da tabela de arquivos
CREATE TABLE "files" (
  "id" SERIAL PRIMARY KEY,
  "name" text,
  "path" text NOT NULL,
  "product_id" int
);

-- Adição de chaves estrangeiras
ALTER TABLE "products" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("id");
ALTER TABLE "files" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id");

-- Criação da tabela de usuários
CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "name" text NOT NULL,
  "email" text UNIQUE NOT NULL,
  "password" text NOT NULL,
  "cpf_cnpj" text UNIQUE NOT NULL,
  "cep" text,
  "address" text,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

-- Adição de chave estrangeira
ALTER TABLE "products" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

-- Função para atualizar o campo updated_at automaticamente
CREATE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Tabela de sessão (pg-simple)
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
) WITH (OIDS=FALSE);
ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

-- Campos para recuperação de senha
ALTER TABLE "users" ADD COLUMN reset_token text;
ALTER TABLE "users" ADD COLUMN reset_token_expires text;

-- Efeito de cascata para exclusão de produtos e arquivos
ALTER TABLE "products"
DROP CONSTRAINT IF EXISTS products_user_id_fkey,
ADD CONSTRAINT products_user_id_fkey
FOREIGN KEY ("user_id")
REFERENCES "users" ("id")
ON DELETE CASCADE;

ALTER TABLE "files"
DROP CONSTRAINT IF EXISTS files_product_id_fkey,
ADD CONSTRAINT files_product_id_fkey
FOREIGN KEY ("product_id")
REFERENCES "products" ("id")
ON DELETE CASCADE;

-- Limpeza de dados e reinício das sequências para cada tabela
DELETE FROM users;
DELETE FROM products;
DELETE FROM files;

-- Reiniciar as sequências com os nomes corretos
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE products_id_seq RESTART WITH 1;
ALTER SEQUENCE files_id_seq RESTART WITH 1;

-- Criação da tabela de pedidos
CREATE TABLE "orders" (
  "id" SERIAL PRIMARY KEY,
  "seller_id" int NOT NULL,
  "buyer_id" int NOT NULL,
  "product_id" int NOT NULL,
  "price" int NOT NULL,
  "quantity" int DEFAULT 0,
  "total" int NOT NULL,
  "status" text NOT NULL,
  "created_at" timestamp DEFAULT (now()),
  "updated_at" timestamp DEFAULT (now())
);

-- Adição de chaves estrangeiras em orders
ALTER TABLE "orders" ADD FOREIGN KEY ("seller_id") REFERENCES "users" ("id");
ALTER TABLE "orders" ADD FOREIGN KEY ("buyer_id") REFERENCES "users" ("id");
ALTER TABLE "orders" ADD FOREIGN KEY ("product_id") REFERENCES "products" ("id");

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Implementação de soft delete em produtos
CREATE OR REPLACE RULE delete_products AS
ON DELETE TO products DO INSTEAD
UPDATE products
SET deleted_at = now()
WHERE products.id = old.id;

-- Criar uma visão para exibir apenas produtos ativos
CREATE VIEW products_active AS
SELECT * FROM products WHERE deleted_at IS NULL;
