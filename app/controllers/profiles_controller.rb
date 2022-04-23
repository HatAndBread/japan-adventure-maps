class ProfilesController < ApplicationController
  before_action :fetch_profile, only: %i[show edit update]
  before_action :authenticate!, only: %i[edit update]

  def show
    use_react
    include_rides!
  end

  def edit
    use_react
  end

  def update
    @profile_being_viewed.update!(profile_params)
    if params[:avatar]
      current_user.avatar = params[:avatar]
      current_user.save!
    end
  end

  private

  def fetch_profile
    @profile_being_viewed = Profile.find(params[:id])
  end

  def profile_params
    params.require(:profile).permit(:start_lng, :start_lat, :location, :birthday, :bikes, :intro, :avatar)
  end

  def authenticate!
    redirect_to root_path unless current_user&.id == @profile_being_viewed.user_id
  end

  def include_rides!
    profile_belongs_to_current_user = @profile_being_viewed.user_id == current_user.id
    @profile_user = User.find(@profile_being_viewed.user_id)
    @routes = Ride.select_simple_ride_data.order(updated_at: :desc)
                  .where(user_id: @profile_being_viewed.user_id)
    @routes = @routes.where.not(is_private: true) unless profile_belongs_to_current_user
    @upcoming_rides = Ride.select_simple_ride_data
                          .order(start_time: :asc)
                          .where('start_time > ?', Time.current)
                          .where(id: Participant.where(user_id: @profile_being_viewed.user_id).pluck(:ride_id))
  end
end
