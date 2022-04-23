class ChangeStartTimeToDateTime < ActiveRecord::Migration[6.1]
  def change
    remove_column :rides, :start_time
    add_column :rides, :start_time, :datetime
  end
end
