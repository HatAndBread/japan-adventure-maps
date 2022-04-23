class Comment < ApplicationRecord
  belongs_to :ride
  belongs_to :user

  def with_user
    user = User.find(self.user_id)
    user.attributes.merge(self.attributes)
  end
end
