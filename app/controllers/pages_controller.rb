class PagesController < ApplicationController
  skip_before_action :authenticate_user!
  def home
    redirect_to profile_path(current_user.profile) if current_user
  end

  def delete_account; end

  def privacy_policy; end
end
