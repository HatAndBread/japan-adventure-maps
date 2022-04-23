class RideWithImport
  include Interactor

  def call
    error_message = { message: 'Unable to import from RWGPS' }
    context.fail! unless context.url

    response = HTTParty.get(context.url)
    if valid_ride_with_response?(response)
      response['track_points'] = simplified_track_points(response['track_points'])
      response.delete('course_points')
      context.response = response
    else
      context.fail!(error_message)
    end
  end

  private

  def simplified_track_points(track_points)
    track_points.map.with_index do |point, index|
      { lng: point['x'], lat: point['y'], e: point['e'] } if (index % 2).zero?
    end.compact
  end

  def valid_ride_with_response?(response)
    return false unless response

    essential_keys = %w[id distance elevation_gain elevation_loss first_lng first_lat track_points]
    essential_keys.each { |key| return false unless response[key] }
    true
  end
end
