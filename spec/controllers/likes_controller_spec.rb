require "rails_helper"

RSpec.describe LikesController do
  describe 'POST#create' do
    describe 'Ride' do
      context 'when a user has not liked a particular ride before' do
        let!(:ride) { create(:ride) }
        it 'allows the user to like the ride' do
          liker = create(:user, username: 'example', email: 'liker@example.com')
          login_user liker
          post :create, params: { user_id: liker.id, likeable_id: ride.id, likeable_type: 'Ride' }
          expect(JSON.parse(response.body)).to include('success' => true)
        end
      end

      context 'when a user has liked a particular ride before' do
        let!(:ride) { create(:ride) }
        it 'does not allow the user to like the ride' do
          liker = create(:user, username: 'example', email: 'liker@example.com')
          Like.create!(user_id: liker.id, likeable_type: 'Ride', likeable_id: ride.id)
          login_user liker
          post :create, params: { user_id: liker.id, likeable_id: ride.id, likeable_type: 'Ride' }
          expect(flash[:alert]).to eq('You can only like one time.')
        end
      end

      context 'when a user is not signed in' do
        let!(:ride) { create(:ride) }
        it 'alerts the user to sign in' do
          post :create, params: { user_id: nil, likeable_id: ride.id, likeable_type: 'Ride' }
          expect(flash[:alert]).to eq('You need to sign in or sign up before continuing.')
        end
      end
    end
  end
end
