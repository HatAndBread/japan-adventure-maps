class ChangeStringToDateTime < ActiveRecord::Migration[6.1]
  def change
    remove_column :profiles, :birthday
    add_column :profiles, :birthday, :datetime
  end
end
