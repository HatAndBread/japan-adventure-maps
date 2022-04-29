class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,
         :omniauthable, omniauth_providers: %i[facebook]

  has_many :rides, dependent: :destroy
  has_many :participants, dependent: :destroy
  has_many :likes
  has_one :profile, dependent: :destroy

  validates :username, presence: true, uniqueness: true
  validates :email, uniqueness: true

  after_create :add_profile

  def self.from_omniauth(auth)
    user = User.where(email: auth.info.email).first
    user ||= User.create!(provider: auth.provider, uid: auth.uid, username: valid_name(auth.info.name),
                          email: auth.info.email, password: Devise.friendly_token[0, 20])
    user
  end

  def self.username_taken?(name)
    User.find_by(username: name).present?
  end

  def self.alternate_username(name)
    "#{name} #{(rand * 1_000_000).floor}"
  end

  def self.valid_name(name)
    return name unless username_taken?(name)

    try = alternate_username(name)
    try = alternate_username(name) while username_taken?(try)
    try
  end

  private

  def add_profile
    profile = Profile.new
    profile.id = id
    profile.user = self
    profile.save!
  end
end
