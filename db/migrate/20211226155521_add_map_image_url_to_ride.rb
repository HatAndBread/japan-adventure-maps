class AddMapImageUrlToRide < ActiveRecord::Migration[6.1]
  def change
    add_column :rides, :map_image_url, :string
  end
end
