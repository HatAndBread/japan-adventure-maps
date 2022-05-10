Rails.application.routes.draw do
  devise_for :users, controllers: { omniauth_callbacks: 'users/omniauth_callbacks' }
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  root to: 'pages#home'

  resources :rides do
    resources :comments, only: [:create]
    member do
      get :three_d, to: 'rides#three_d'
      post :copy, to: 'rides#copy'
    end
  end

  resources :profiles, only: %i[show edit update]
  resources :likes, only: %i[create]
  get '/privacy_policy', to: 'pages#privacy_policy'
  get '/delete_account', to: 'pages#delete_account'
  get '/find_a_ride', to: 'rides#find_a_ride'
  post '/participate', to: 'rides#participate'

  get '/api/user_location', to: 'api#user_location'
  post '/api/search_rides', to: 'api#search_rides'
  post '/api/post_ride_with', to: 'api#post_ride_with'
end
