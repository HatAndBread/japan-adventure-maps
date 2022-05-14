class AddRideLocationToRide < ActiveRecord::Migration[7.0]
  def change
    add_column :rides, :start_location_en, :string
    add_column :rides, :start_location_jp, :string
  end
end
