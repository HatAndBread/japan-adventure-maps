class AddUserToLike < ActiveRecord::Migration[6.1]
  def change
    add_reference :likes, :user
  end
end
