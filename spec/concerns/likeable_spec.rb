require 'spec_helper'

shared_examples_for 'likeable' do
  let(:model) { create(described_class.to_s.downcase) }
  let(:model1) { create(described_class.to_s.downcase) }
  let(:model2) { create(described_class.to_s.downcase) }

  describe '#top' do
    it 'returns all the most liked objects in order when called without any arguements' do
      3.times { create(:like, likeable_type: model.class, likeable_id: model.id) }
      2.times { create(:like, likeable_type: model1.class, likeable_id: model1.id) }
      create(:like, likeable_type: model2.class, likeable_id: model2.id)

      actual = described_class.top
      expect(actual.first.likes_count).to eq(3)
      expect(actual.second.likes_count).to eq(2)
      expect(actual.third.likes_count).to eq(1)
    end

    it 'returns the number of liked objects specificied in order' do
      3.times { create(:like, likeable_type: model.class, likeable_id: model.id) }
      2.times { create(:like, likeable_type: model1.class, likeable_id: model1.id) }
      create(:like, likeable_type: model2.class, likeable_id: model2.id)

      actual = described_class.top(2)
      expect(actual.to_a.size).to eq(2)
      expect(actual.first.likes_count).to eq(3)
      expect(actual.second.likes_count).to eq(2)
    end
  end
end
