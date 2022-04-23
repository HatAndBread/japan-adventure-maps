require 'json'

class GeoJsonCombiner
  class << self
    def call
      send(:combine, files_in_folder(ARGV[0]))
    end

    def combine(files)
      base = {
        type: 'FeatureCollection',
        features: []
      }
      files.each do |file|
        file[:features].each do |feature|
          feature[:properties] = { @id => feature[:properties][:@id] } if ARGV[1] == 'limit'
          base[:features] << feature
        end
      end
      save_results(base)
    end

    def save_results(data)
      File.write("./#{ARGV[0]}-#{Time.now.to_i}.geojson", data.to_json)
    end

    def folders
      dotless(Dir.entries(base_path))
    end

    def files_in_folder(folder)
      path = base_path + folder
      dotless(Dir.entries(path)).map do |file_name|
        puts file_name
        JSON.parse(File.read("#{path}/#{file_name}"), symbolize_names: true)
      end
    end

    def base_path
      'seed_data/'
    end

    def dotless(result)
      result.reject { |f| ['..', '.', '.DS_Store'].include?(f) }
    end
  end
end

GeoJsonCombiner.call
