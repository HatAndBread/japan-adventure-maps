class HeatMap
  class << self
    def create
      %w[hiking cycling].each do |ride_type|
        routes = Ride.where(ride_type:).pluck(:route)
        puts "Building #{ride_type} heat map..."
        geojson = routes.each_with_object({type: 'FeatureCollection', features: []}) do |route, hash|
          route = JSON.parse(route, symbolize_names: true)
          hash[:features] << { type: 'Feature', geometry: { type: 'LineString', coordinates: route.map { |point| [point[:lng], point[:lat]] }} }
        end
        puts 'Converting to JSON...'
        stringified_json = geojson.to_json
        puts 'Writing to file...'
        File.write("heatmap-#{ride_type}.geojson", stringified_json)
        puts "Uploading heatmap to transfer.sh"
        puts `cat #{Rails.root}/heatmap-#{ride_type}.geojson | curl -X PUT -T "-" https://transfer.sh/heatmap-#{ride_type}-#{Time.now.to_i}.geojson`
        puts "Download the new #{ride_type} heatmap geojson at this url ⬆"
      end
    end
  end
end
