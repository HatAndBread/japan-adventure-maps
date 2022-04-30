class LikesController < ApplicationController
  def create
    return unless current_user
    return flash[:alert] = 'You can only like one time.' if liked_before?

    succeeded if Like.create!(like_params)
  end

  private

  def like_params
    params.permit(:likeable_type, :likeable_id, :user_id)
  end

  def liked_before?
    !like_params[:likeable_type].constantize.find_by(id: params[:likeable_id])&.likes&.pluck(:user_id)&.size&.zero?
  end
end
