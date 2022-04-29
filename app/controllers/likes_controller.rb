class LikesController < ApplicationController
  def create
    if has_not_liked_before? && Like.create!(like_params)
      succeeded
    else
      flash[:alert] = 'You can only like one time.'
    end
  end

  private

  def like_params
    params.permit(:likeable_type, :likeable_id, :user_id)
  end

  def has_not_liked_before?
    like_params[:likeable_type].constantize.find_by(id: params[:likeable_id])&.likes&.pluck(:user_id)&.size&.zero?
  end
end
