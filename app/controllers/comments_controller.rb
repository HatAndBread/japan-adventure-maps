class CommentsController < ApplicationController
  def create
    user = User.find(comment_params[:user_id])
    return failed unless Comment.create(comment_params.merge(username: user.username))

    comments = Comment.where(ride_id: comment_params[:ride_id]).order(created_at: :asc).map { |c| c.with_user }
    render json: { success: true, comments: comments }.to_json
  end

  private

  def comment_params
    params.permit(:user_id, :ride_id, :content)
  end
end
