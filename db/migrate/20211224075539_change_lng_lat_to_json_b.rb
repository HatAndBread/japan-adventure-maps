class ChangeLngLatToJsonB < ActiveRecord::Migration[6.1]
  def change
    remove_column :rides, :lng
    remove_column :rides, :lat
    add_column :rides, :start_lng_lat, :jsonb
  end
end
