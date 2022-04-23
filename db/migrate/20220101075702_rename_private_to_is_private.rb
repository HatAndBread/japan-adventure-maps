class RenamePrivateToIsPrivate < ActiveRecord::Migration[6.1]
  def change
    rename_column :rides, :private, :is_private
  end
end
