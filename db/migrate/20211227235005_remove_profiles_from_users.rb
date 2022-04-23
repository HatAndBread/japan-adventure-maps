class RemoveProfilesFromUsers < ActiveRecord::Migration[6.1]
  def change
    remove_column :users, :profile_id
  end
end
