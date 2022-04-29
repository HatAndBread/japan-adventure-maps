class ApplicationController < ActionController::Base
  before_action :add_controller_action_names, except: %i[create update destroy]
  before_action :authenticate_user!
  before_action :configure_permitted_parameters, if: :devise_controller?
  before_action :no_react

  private

  def add_controller_action_names
    @controller_action = "#{controller_name}##{action_name}"
    @model_name = controller_name.classify
  end

  def configure_permitted_parameters
    # For additional fields in app/views/devise/registrations/new.html.erb
    devise_parameter_sanitizer.permit(:sign_up, keys: %i[username email])
    devise_parameter_sanitizer.permit(:sign_in, keys: %i[username email])
    devise_parameter_sanitizer.permit(:account_update, keys: %i[username email])
  end

  def after_sign_in_path_for(_resource)
    if current_user.profile.start_lat
      root_path
    else
      edit_profile_path(current_user.id)
    end
  end

  def failed
    render json: { success: false }.to_json
  end

  def succeeded
    render json: { success: true }.to_json
  end

  def use_react
    @use_react = true
  end

  def no_react
    @use_react = false
  end
end
