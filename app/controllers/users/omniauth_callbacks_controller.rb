class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  include Devise::Controllers::Rememberable

  def facebook
    Rails.logger.debug "hello #{request.inspect}"
    @user = User.from_omniauth(request.env['omniauth.auth'])

    if @user.persisted?
      remember_me(@user)
      sign_in_and_redirect @user, event: :authentication # this will throw if @user is not activated
    else
      session['devise.facebook_data'] = request.env['omniauth.auth'].except(:extra) # Removing extra as it can overflow some session stores
      redirect_to new_user_registration_url
    end
  end

  def failure
    redirect_to root_path
  end
end
