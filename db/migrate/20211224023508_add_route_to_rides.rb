class AddRouteToRides < ActiveRecord::Migration[6.1]
  def change
    add_column :rides, :route, :binary
  end
end
