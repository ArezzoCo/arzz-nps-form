#!bin/bash

# Obtém o nome da branch atual
current_branch=$(git symbolic-ref --short HEAD)

# Verifica se a branch atual é a "main"
if [ "$current_branch" != "main" ]; then
  echo "Script de atualização do .toml ignorado: branch atual é '$current_branch' (somente executado na branch 'main')."
  exit 0
fi

echo "Atualizando arquivo shopify.app.toml"
bundle exec ruby update_toml.rb

if [ $? -ne 0 ]; then
  echo "Erro ao executar o script de atualização do .toml. Abortando push."
  exit 1
fi

echo "Adicionando arquivo .toml atualizado ao commit..."
git add shopify.app.toml

echo "Confirmando alterações..."
git commit --amend --no-edit

echo "Hook pre-push concluído com sucesso!"