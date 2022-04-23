class RemoveMapUrlFromRoutes < ActiveRecord::Migration[6.1]
  def change
    remove_column :rides, :map_url
  end
end
