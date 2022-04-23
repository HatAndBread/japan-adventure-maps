class AddAvatarToProfile < ActiveRecord::Migration[6.1]
  def change
    add_column :profiles, :avatar, :string
  end
end
