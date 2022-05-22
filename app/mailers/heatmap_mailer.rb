class HeatmapMailer < ApplicationMailer
  def mailer
    path = "#{Rails.root}/heatmap.geojson"
    puts path
    attachments['heatmap.geojson'] = File.read(path)
    mail(to: 'spaceprophet@gmail.com', subject: 'Here is a fresh heatmap!', body: '')
  end
end
