import { Route } from './map-logic';
import { saveAs } from 'file-saver';
import { last, first } from 'lodash';
import { routeDistance } from './map-logic';

export default class Exporter {
  route: Route;
  routeName: string;
  constructor(args: { route: Route; routeName: string }) {
    this.route = args.route;
    this.routeName = args.routeName;
  }
  toGpx() {
    const rows = [
      '<?xml version="1.0" encoding="UTF-8"?>\n',
      '<gpx xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.topografix.com/GPX/1/1" xmlns:gpxdata="http://www.cluetrust.com/XML/GPXDATA/1/0" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd http://www.cluetrust.com/XML/GPXDATA/1/0 http://www.cluetrust.com/Schemas/gpxdata10.xsd" version="1.1" creator="http://joinaride.com/">\n',
      '  <metadata>\n',
      `    <name>${this.routeName}</name>\n`,
      '  </metadata>\n',
      `  <trk>\n`,
      `    <name>${this.routeName}</name>\n`,
      '    <trkseg>\n',
    ];
    this.route.forEach((point) => {
      rows.push(`      <trkpt lat="${point.lat}" lon="${point.lng}">\n        <ele>${point.e}</ele>\n      </trkpt>\n`);
    });
    rows.push('    </trkseg>\n  </trk>\n</gpx>');
    return rows.join('');
  }
  toTcx() {
    const name = this.routeName.replace(/\s/g, '-').slice(0, 15);
    const rows = [
      `<?xml version="1.0" encoding="UTF-8"?>,
      <TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd">,
      <Folders><Courses><CourseFolder Name="Courses"><CourseNameRef><Id>${name}</Id></CourseNameRef></CourseFolder></Courses></Folders>,
      <Courses><Course><Name>${name}</Name>,
      <Lap><TotalTimeSeconds>0</TotalTimeSeconds><DistanceMeters>${
        Math.round(routeDistance(this.route)) * 1000
      }.0</DistanceMeters>,
      <BeginPosition><LatitudeDegrees>${first(this.route).lat}</LatitudeDegrees><LongitudeDegrees>${
        first(this.route).lng
      }</LongitudeDegrees></BeginPosition>,
      <EndPosition><LatitudeDegrees>${last(this.route).lat}</LatitudeDegrees><LongitudeDegrees>${
        last(this.route).lng
      }</LongitudeDegrees></EndPosition>,
      \n<Intensity>Active</Intensity></Lap>,
      <Track>`,
    ];
    this.route.forEach((point, i) =>
      rows.push(
        `
        <Trackpoint>
          <Time>${new Date(Date.now() + i).toISOString()}}</Time>
          <Position>
            <LatitudeDegrees>${point.lat}</LatitudeDegrees>
            <LongitudeDegrees>${point.lng}</LongitudeDegrees>
          </Position>
          <AltitudeMeters>${point.e}</AltitudeMeters>
          <DistanceMeters>${routeDistance(this.route.slice(0, i + 1))}</DistanceMeters>
        </Trackpoint>
      `
      )
    );
    rows.push('</Track>');
    this.route.forEach((point, i) => {
      let noteAndName = !i ? 'Start' : 'Turn left';
      if (i === this.route.length - 1) noteAndName = 'end';
      rows.push(
        // PointType will be direction such as left right straight etc
        `
      <CoursePoint>
        <Name>${noteAndName}</Name>
        <Time>${new Date(Date.now() + i).toISOString()}</Time>
        <Position>
          <LatitudeDegrees>${this.route[i].lat}</LatitudeDegrees>
          <LongitudeDegrees>${this.route[i].lng}</LongitudeDegrees>
        </Position>
        <PointType>Generic</PointType> 
        <Notes>${noteAndName}</Notes>
      </CoursePoint>
      `
      );
    });
    rows.push('</Course></Courses></TrainingCenterDatabase>');
    return rows.join('');
  }
  toKml() {
    const rows = [
      '<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2">\n<Document>\n',
      `<description>An Amazing Bicycle Route</description>\n<name>${this.routeName}</name>`,
      `\n<Style id="default_style"><LineStyle><color>ff0000ff</color><width>2</width></LineStyle></Style>`,
      `\n<Placemark>\n<description>An Amazing Bicycle Route</description>\n<name>${this.routeName}</name><visibility>1</visibility><flyToView>1</flyToView><styleUrl>#default_style</styleUrl>`,
      `<LineString><extrude>1</extrude><tessellate>1</tessellate><altitudeMode>clampedToGround</altitudeMode>\n<coordinates>`,
    ];
    const end = '\n</coordinates></LineString></Placemark></Document></kml>';
    this.route.forEach((point) => rows.push(`\n${point.lng},${point.lat},${point.e}`));
    rows.push(end);
    return rows.join('');
  }
  conversionFunction(fileType: string) {
    if (fileType === '.gpx') return this.toGpx();
    if (fileType === '.tcx') return this.toTcx();
    if (fileType === '.kml') return this.toKml();
    return this.toGpx();
  }
  toFile(fileType: string) {
    const data = new Blob([this.conversionFunction(fileType)], { type: 'text/plain;charset=utf-8' });
    return window.URL.createObjectURL(data);
  }
  download(fileType: string) {
    const file = this.toFile(fileType);
    saveAs(file, `${this.routeName || 'pedal-party-ride'}${fileType}`);
  }
}
