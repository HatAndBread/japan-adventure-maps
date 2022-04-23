class AddDistanceTypeElevationGainMaxElevationToRides < ActiveRecord::Migration[6.1]
  def change
    add_column :rides, :distance, :string
    add_column :rides, :ride_type, :string
    add_column :rides, :elevation_gain, :integer
    add_column :rides, :max_elevation, :integer
  end
end
