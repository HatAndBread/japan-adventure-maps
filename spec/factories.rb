FactoryBot.define do
  sequence :email do |n|
    "person#{n}@example.com"
  end

  sequence :username do |n|
    "username#{n}"
  end

  factory :user do
    email { generate :email }
    username { generate :username }
    password { "password" }
  end

  factory :ride do
    user { build(:user) }
    route { [] }
    popups { [] }
  end

  factory :like do
    user { build(:user) }
  end
end
