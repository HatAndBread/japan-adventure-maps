class RideSerializer
  include JSONAPI::Serializer
  attributes :title, :description, :user_id, :route, :popups, :map_image_url, :start_lng, :start_lat, :distance, :ride_type, :elevation_gain, :max_elevation, :elevation_change, :user_id, :likes_count
end
