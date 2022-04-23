class AddPrivateToRide < ActiveRecord::Migration[6.1]
  def change
    add_column :rides, :private, :boolean, default: false
  end
end
