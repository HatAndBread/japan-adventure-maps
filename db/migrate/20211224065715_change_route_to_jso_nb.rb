class ChangeRouteToJsoNb < ActiveRecord::Migration[6.1]
  def change
    remove_column :rides, :route
    add_column :rides, :route, :jsonb, null: false, default: '[]'
  end
end
