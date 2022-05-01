module Likeable
  extend ActiveSupport::Concern

  class_methods do
    def top(limit = nil)
      joins(:likes)
        .select("#{table_name}.*, COUNT(likes.id) as likes_count")
        .group("#{table_name}.id")
        .order(likes_count: :desc)
        .limit(limit)
    end
  end
end
