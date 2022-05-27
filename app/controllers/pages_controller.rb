class PagesController < ApplicationController
  skip_before_action :authenticate_user!
  def home
    top_hikes = Ride.top(limit: 10, filter: { ride_type: :hiking })
    top_rides = Ride.top(limit: 10, filter: { ride_type: :cycling })
    @featured_routes = top_hikes.map.with_index do |r, i|
      [r, top_rides[i]]
    end.flatten.compact
  end

  def three_d_demo
    use_react
  end

  def delete_account; end

  def privacy_policy; end
end
