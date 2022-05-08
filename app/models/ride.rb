class Ride < ApplicationRecord
  include Likeable

  belongs_to :user
  has_many :participants, dependent: :destroy
  has_many :comments, dependent: :destroy
  has_many :likes, as: :likeable

  def leaders
    self.participants.where(is_leader: true).map{ |p| p.user}
  end

  def event?
    self.is_event
  end

  def riders
    self.participants.map{|p| p.user.attributes.merge(is_leader: p.is_leader, user_id: p.user_id)}
  end

  def featured_images
    imgs = popup_images
    imgs << map_image_url if map_image_url
    imgs
  end

  def popup_images
    popups.scan(/https:\/\/res\.cloudinary\.com\/hatandbread\/image\/upload\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+\.[a-z]{3}/)
  end

  def self.select_simple_ride_data
    self.select(:title,
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
                :is_event,
                :user_id
     )
  end
end
