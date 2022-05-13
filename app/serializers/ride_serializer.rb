class RideSerializer
  include JSONAPI::Serializer

  set_key_transform :camel_lower
  attributes :id, :title, :description, :user_id, :map_image_url, :start_lng, :start_lat, :distance, :ride_type, :elevation_gain, :max_elevation, :elevation_change, :user_id, :likes_count, :featured_images
end
