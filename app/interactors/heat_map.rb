class HeatMap
  class << self
    def create
      routes = Ride.all.pluck(:route)
      puts 'Building Heat Map...'
      geojson = routes.each_with_object({type: 'FeatureCollection', features: []}) do |route, hash|
        route = JSON.parse(route, symbolize_names: true)
        hash[:features] << { type: 'Feature', geometry: { type: 'LineString', coordinates: route.map { |point| [point[:lng], point[:lat]] }} }
      end
      puts 'Converting to JSON...'
      stringified_json = geojson.to_json
      puts 'Writing to file...'
      File.write('heatmap.geojson', stringified_json)
      puts "Uploading heatmap to transfer.sh"
      puts `cat #{Rails.root}/heatmap.geojson | curl -X PUT -T "-" https://transfer.sh/heatmap#{Time.now.to_i}.geojson.gpg`.green
      puts "Download the new heatmap geojson at this url ⬆"
    end
  end
end
