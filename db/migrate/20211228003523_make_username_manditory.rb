class MakeUsernameManditory < ActiveRecord::Migration[6.1]
  def change
    change_column :users, :username, :string, unique: true, null: false
  end
end
