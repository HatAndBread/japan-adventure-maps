class RemoveStartLngLatFromRides < ActiveRecord::Migration[6.1]
  def change
    remove_column :rides, :start_lng_lat
    add_column :rides, :start_lng, :decimal, precision: 10, scale: 6
    add_column :rides, :start_lat, :decimal, precision: 10, scale: 6
  end
end
