class AddUsernameToComment < ActiveRecord::Migration[6.1]
  def change
    add_column :comments, :username, :string, null: false
  end
end
