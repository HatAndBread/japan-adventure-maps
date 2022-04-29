FactoryBot.define do
  factory :user do
    username { 'Example_Username' }
    email { 'example@example.com' }
    password { 'password' }
  end

  factory :ride do
    user { build(:user) }
    route { [] }
    popups { [] }
  end
end
