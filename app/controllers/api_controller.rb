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
    rides = Ride.top(limit: 10, filter: "start_lng < #{ne['lng']} AND start_lng > #{sw['lng']} AND start_lat < #{ne['lat']} AND start_lat > #{sw['lat']}")
    render json: RideSerializer.new(rides).serializable_hash.to_json
  end

  def user_location
    # render json: request.location.coordinates.to_json
    # Let's localize to Japan for now.
    render json: [138.2529, 38]
  end
end
