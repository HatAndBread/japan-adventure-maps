class RemoveProfileIdFromUsers < ActiveRecord::Migration[6.1]
  def change
    remove_foreign_key :users, column: :profile_id
  end
end
