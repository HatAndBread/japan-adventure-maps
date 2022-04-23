class AddLeaderToParticipant < ActiveRecord::Migration[6.1]
  def change
    add_column :participants, :is_leader, :boolean, default: false
  end
end
