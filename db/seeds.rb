class Seed
  class << self
    def call
      folders.each do |folder|
        send(folder, files_in_folder(folder))
      end
    end

    def camps(data); end

    def huts(data); end

    def peaks(data)
      data.each do |file|
        file[:features].each do |feature|
          properties = feature[:properties]
          attrs = {
            lng: feature[:geometry][:coordinates][0],
            lat: feature[:geometry][:coordinates][1],
            elevation: properties[:ele]&.to_i,
            prominence: properties[:prominence]&.to_i,
            ja_name: properties[:name],
            en_name: properties[:name_en],
            en_wiki_url: wiki_url(properties, 'en'),
            ja_wiki_url: wiki_url(properties, 'ja'),
            wikidata: properties[:wikidata],
            area: nil
          }
          MountainPeak.create!(attrs)
        end
      end
    end

    def folders
      dotless(Dir.entries(base_path))
    end

    def files_in_folder(folder)
      path = base_path + folder
      dotless(Dir.entries(path)).map do |file_name|
        JSON.parse(File.read("#{path}/#{file_name}"), symbolize_names: true)
      end
    end

    def base_path
      "#{Rails.root}/db/seed_data/"
    end

    def dotless(result)
      result.reject { |f| ['..', '.'].include?(f) }
    end

    def wiki_url(properties, lang)
      return unless properties[:wikipedia]

      if lang == 'ja' && properties[:wikipedia].match(/^en:/)
        "https://ja.wikipedia.org/wiki/#{properties[:name]}"
      elsif properties[:wikipedia].match("^#{lang}:")
        "https://#{lang}.wikipedia.org/wiki/#{properties[:wikipedia].split("#{lang}:").second}"
      end
    end
  end
end

Seed.call
