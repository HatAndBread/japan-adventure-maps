class RidesController < ApplicationController
  skip_before_action :authenticate_user!, only: %i[show new find_a_ride three_d all_rides]
  before_action :fetch_ride, only: %i[show update edit destroy three_d]
  before_action :authorize!, only: %i[update edit destroy]

  def index
    if current_user&.id
      redirect_to profile_path(current_user.id)
    else
      redirect_to root_path
    end
  end

  def find_a_ride
    use_react
  end

  def show
    @participants = @ride.riders
    @likes = @ride.likes
    @comments = @ride.comments.order(created_at: :asc).map(&:with_user)
    use_react
  end

  def new
    use_react
    @ride = Ride.new
  end

  def create
    @ride = Ride.new(ride_params)
    if @ride.save!
      save_as_leader
      render json: { success: true, ride_id: @ride.id }.to_json
    else
      alert_failure
    end
  end

  def edit
    use_react
  end

  def update
    if @ride.update(ride_params)
      save_as_leader
      render json: { success: true, ride_id: @ride.id }.to_json
    else
      alert_failure
    end
  end

  def destroy
    alert_failure unless @ride.destroy!
  end

  def participate
    return alert_failure unless Participant.create!(participant_params)

    render json: { success: true, participants: Ride.find(params[:ride_id]).riders }.to_json
  end

  def three_d
    use_react
  end

  def copy
    @ride = Ride.find(params[:id])
    copied_ride = Ride.new(user_id: current_user.id, title: "#{@ride.title} copy", start_lng: @ride.start_lng, start_lat: @ride.start_lat, route: @ride.route, popups: @ride.popups, map_image_url: @ride.map_image_url, distance: @ride.distance, ride_type: @ride.ride_type, max_elevation: @ride.max_elevation, elevation_gain: @ride.elevation_gain, is_event: false)
    if copied_ride.save!
      render json: { success: true, id: copied_ride.id }.to_json
    else
      failed
    end
  end

  def all_rides
    render json: RideSerializer.new(Ride.where(is_private: false)).serializable_hash.to_json
  end

  private

  def ride_params
    params.require(:ride).permit(
      :title,
      :start_lng,
      :start_lat,
      :start_time,
      :description,
      :route,
      :popups,
      :map_image_url,
      :user_id,
      :distance,
      :ride_type,
      :max_elevation,
      :elevation_gain,
      :elevation_change,
      :is_private,
      :start_location_en,
      :start_location_jp
    )
  end

  def participant_params
    params.permit(:user_id, :ride_id)
  end

  def alert_failure
    flash[:alert] = 'Something went wrong ????'
  end

  def fetch_ride
    @ride = Ride.includes(:likes).find(params[:id])
  end

  def save_as_leader
    if @ride.event? && !@ride.leaders.include?(current_user)
      Participant.create!(user_id: current_user.id, ride_id: @ride.id,
                          is_leader: true)
    end
  end

  def authorize!
    Rails.logger.debug "hello ! #{@ride.inspect}"
    redirect_to root_path unless current_user&.id == @ride&.user_id
  end
end
