require 'spec_helper'

shared_examples_for 'likeable' do
  describe '#top' do
    let(:model) { create(described_class.to_s.downcase) }
    let(:model1) { create(described_class.to_s.downcase) }
    let!(:model2) { create(described_class.to_s.downcase) }

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

      actual = described_class.top(limit: 2)
      expect(actual.to_a.size).to eq(2)
      expect(actual.first.likes_count).to eq(3)
      expect(actual.second.likes_count).to eq(2)
    end

    it 'filters liked objects according to the provided filters' do
      3.times { create(:like, likeable_type: model.class, likeable_id: model.id) }
      2.times { create(:like, likeable_type: model1.class, likeable_id: model1.id) }
      create(:like, likeable_type: model2.class, likeable_id: model2.id)
      model.update!(created_at: 2.days.ago)
      model1.update!(created_at: 2.days.ago)

      arr = described_class.top(filter: { created_at: 2.days.ago.all_day }).to_a
      expect(arr.count).to eq(2)
      expect(arr.pluck(:created_at).map(&:to_date).uniq).to eq([2.days.ago.to_date])
    end

    it 'includes objects with zero likes if they fall within the limit' do
      3.times { create(:like, likeable_type: model.class, likeable_id: model.id) }
      2.times { create(:like, likeable_type: model1.class, likeable_id: model1.id) }
      actual = described_class.top(limit: 3)
      expect(actual.map(&:likes_count)).to eq([3, 2, 0])
    end
  end

  describe '#likes_count' do
    let(:model) { create(described_class.to_s.downcase) }
    it 'returns the number of likes the object has' do
      create(:like, likeable_type: model.class, likeable_id: model.id)
      create(:like, likeable_type: model.class, likeable_id: model.id)

      expect(model.likes_count).to eq(2)
    end
  end
end
