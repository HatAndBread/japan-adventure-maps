class AddElevationChangeToRide < ActiveRecord::Migration[6.1]
  def change
    add_column :rides, :elevation_change, :integer
  end
end
