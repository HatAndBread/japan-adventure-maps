require 'rails_helper'
require Rails.root.join "spec/concerns/likeable_spec.rb"

RSpec.describe Ride, type: :model do
  it_behaves_like 'likeable'
end
