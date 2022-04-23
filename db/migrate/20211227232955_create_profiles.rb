class CreateProfiles < ActiveRecord::Migration[6.1]
  def change
    create_table :profiles do |t|
      t.text :intro, null: false, default: ''
      t.decimal :start_lng, precision: 10, scale: 6
      t.decimal :start_lat, precision: 10, scale: 6
      t.timestamps
    end
  end
end
