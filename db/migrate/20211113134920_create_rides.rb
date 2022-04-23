class CreateRides < ActiveRecord::Migration[6.1]
  def change
    create_table :rides do |t|
      t.string :title
      t.string :lat
      t.string :lng
      t.string :map_url
      t.time :start_time
      t.text :description
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
