class LikesController < ApplicationController
  def create
    return render json: { success: false, message: 'You must be logged in to like.' }.to_json unless current_user
    return render json: { success: false, message: 'You can only like one time.' }.to_json if liked_before?

    succeeded if Like.create!(like_params)
  end

  private

  def like_params
    params.require(:like).permit(:likeable_type, :likeable_id, :user_id)
  end

  def liked_before?
    user_ids = like_params[:likeable_type].constantize.find_by(id: like_params[:likeable_id])&.likes&.pluck(:user_id) || []
    user_ids.include?(like_params[:user_id]&.to_i)
  end
end
