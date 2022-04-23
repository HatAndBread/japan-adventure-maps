class RemoveStuffFromUser < ActiveRecord::Migration[6.1]
  def change
    remove_column :users, :uid
    remove_column :users, :provider
  end
end
