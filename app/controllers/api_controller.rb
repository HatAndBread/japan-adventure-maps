class ApiController < ApplicationController
  skip_before_action :authenticate_user!, only: %i[user_location search_rides]
  def post_ride_with
    result = RideWithImport.call(params)
    if result.success?
      render json: result.response
    else
      render json: { error: result.message }.to_json
    end
  end

  def search_rides
    sw = params[:bounds]['_sw']
    ne = params[:bounds]['_ne']
    rides = Ride.select(
      :title,
      :description,
      :id,
      :start_time,
      :created_at,
      :updated_at,
      :map_image_url,
      :start_lng,
      :start_lat,
      :distance,
      :ride_type,
      :max_elevation,
      :elevation_gain,
      :elevation_change,
      :is_event
    )
                .where(is_event: true)
                .where('start_time > ?', Date.yesterday)
                .where('start_lng < ? AND start_lng > ? AND start_lat < ? AND start_lat > ?', ne['lng'], sw['lng'], ne['lat'], sw['lat'])
    render json: rides.to_json
  end

  def user_location
    # render json: request.location.coordinates.to_json
    # Let's localize to Japan for now.
    render json: [138.2529, 38]
  end
end
