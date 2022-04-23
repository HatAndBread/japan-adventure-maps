class AddIsEventToRide < ActiveRecord::Migration[6.1]
  def change
    add_column :rides, :is_event, :boolean, default: false
  end
end
