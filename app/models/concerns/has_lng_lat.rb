module HasLngLat
  extend ActiveSupport::Concern

  class_methods do
    def within_bbox(bounds)
      where('lng < ? AND lng > ? AND lat < ? AND lat > ?', bounds['_ne'], bounds['_sw'], bounds['_ne'],
            bounds['_sw'])
    end
  end
end
