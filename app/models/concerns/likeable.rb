module Likeable
  extend ActiveSupport::Concern

  class_methods do
    def top(limit: nil, filter: nil)
      joins(:likes)
        .select("#{table_name}.*, COUNT(likes.id) as likes_count")
        .group("#{table_name}.id")
        .order(likes_count: :desc)
        .where(filter)
        .limit(limit)
    end
  end

  def likes_count
    likes.count
  end
end
