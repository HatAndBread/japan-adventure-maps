class AddBikesBirthdayLocationToProfile < ActiveRecord::Migration[6.1]
  def change
    add_column :profiles, :birthday, :string
    add_column :profiles, :location, :string
    add_column :profiles, :bikes, :string
  end
end
