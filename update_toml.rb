require 'bundler/setup'
Bundler.require

Dotenv.load

TOML_PATH = 'shopify.app.toml'

def update_toml_from_env
  begin
    # Carrega arquivo toml
    puts "Lendo Arquivo TOML..."
    toml_content = File.read(TOML_PATH)
    toml_data = PerfectTOML.parse(toml_content)
    puts "Arquivo TOML lido com sucesso!"

    # Carrega .env e verifica se a variável PRODUCTION_URL está definida
    production_url = ENV['PRODUCTION_URL']
    unless production_url
      puts "Variável PRODUCTION_URL não encontrada."
      return
    end
    puts "PRODUCTION_URL: #{production_url}"

    puts "Atualizando arquivo toml..."

    # Atualiza application_url
    puts "application_url: #{toml_data['application_url']} -> #{production_url}"
    toml_data['application_url'] = production_url

    production_url = production_url.chomp('/')

    # Atualiza [auth] redirect_urls
    if toml_data['auth'] && toml_data['auth']['redirect_urls']
      toml_data['auth']['redirect_urls'].map! do |redirect_url|
        new_url = redirect_url.gsub(/https:\/\/[^\/]+/, production_url)
        puts "redirect_url: #{redirect_url} -> #{new_url}"
        new_url
      end
    else
      puts "auth.redirect_urls não encontrado."
    end

    # Atualiza [app_proxy] url
    if toml_data['app_proxy']
      puts "Atualizando [app_proxy] url..."
      toml_data['app_proxy']['url'] = production_url
      puts "app_proxy.url: #{toml_data['app_proxy']['url']}"
    else
      puts "Seção [app_proxy] não encontrada."
    end

    # Salva o arquivo toml
    puts "Salvando arquivo .toml atualizado..."
    File.write(TOML_PATH, PerfectTOML.generate(toml_data))
    puts "Arquivo #{TOML_PATH} atualizado com sucesso!"
  rescue => e
    puts "Erro ao atualizar arquivo TOML: #{e}"
    puts e.backtrace.join("\n")
  end
end

update_toml_from_env
