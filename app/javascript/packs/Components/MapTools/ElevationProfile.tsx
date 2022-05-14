import React, { useRef, useEffect, useState, useMemo } from 'react';
import { getElevation, Route } from '../../../lib/map-logic';
import { distanceBetween, routeDistance } from '../../../lib/map-logic';
import Chart from 'chart.js/auto';
import annotation from 'chartjs-plugin-annotation';
import { lineStrings } from '@turf/helpers';
import { getElevationGain } from '../../../lib/geojson-elevation.js';
Chart.register(annotation);
Chart.defaults.color = 'white';

type HoveringPoint = null | { elevation: number; distance: number; x: number; y: number };
let hp: HoveringPoint = null;
const ElevationProfile = ({ route, hoveringPoint }: { route: Route; hoveringPoint: HoveringPoint }) => {
  hp = hoveringPoint;
  const [chart, setChart] = useState<Chart | undefined>();
  const chartRef = useRef<HTMLCanvasElement>();

  const overShootFill = (overShotDistance: number, lastElevation: number, nextElevation: number) => {
    const iterations = Math.round(overShotDistance / 0.1);
    const fills = [];
    const isUpHill = nextElevation > lastElevation;
    for (let i = 0; i < iterations; i++) {
      const d = isUpHill ? iterations + i : iterations - 1;
      const ele = lastElevation + (nextElevation - lastElevation) / d;
      fills.push(ele);
    }
    return fills;
  };

  const isTruthish = (value: any) => !!value || value === 0;

  const pointOne = (num: number) => Math.round(num * 10) / 10;
  const elevations = useMemo(() => {
    let lastMarkedDistance = 0;
    const elevations: number[] = [];
    for (let i = 0; i < route?.length - 1; i++) {
      if (i === 0) {
        elevations.push(route[i].e);
        continue;
      }
      const distanceFromStart = pointOne(routeDistance(route.slice(0, i)));
      if (distanceFromStart !== lastMarkedDistance) {
        const overShoot = pointOne(distanceFromStart - lastMarkedDistance);
        if (overShoot > 0.2) {
          const overShotDistances = overShootFill(overShoot, elevations[elevations.length - 1], route[i].e);
          overShotDistances.forEach((d) => elevations.push(d));
        } else {
          elevations.push(route[i].e);
        }
        lastMarkedDistance = distanceFromStart;
      }
    }
    return elevations;
  }, [route]);

  const xFunc = () => {
    if (isTruthish(hp?.distance)) return Math.floor(hp.distance * 10);
    return 0;
  };
  useEffect(() => {
    if (chart) {
      chart.data.datasets.forEach((set) => {
        set.data = elevations;
      });
      chart.data.labels = [...Array(elevations.length)].map((_, i) => (i / 10).toFixed(1) + 'km');
      chart.update();
    }
  }, [elevations, chart, hoveringPoint]);
  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      const labels = [0];
      var grd = ctx.createLinearGradient(0, 0, 0, 170);
      grd.addColorStop(0, 'white');
      grd.addColorStop(1, 'rgb(100,100,100)');
      const data = {
        labels: labels,
        datasets: [
          {
            label: 'Elevation',
            backgroundColor: grd,
            borderColor: 'rgb(50, 50, 50)',
            borderWidth: 0,
            pointStyle: 'line',
            fill: {
              target: 'origin',
            },
            data: [0],
          },
        ],
      };
      const plugin = {
        id: 'custom_canvas_background_color',
        beforeDraw: (chart: Chart) => {
          ctx.save();
          ctx.globalCompositeOperation = 'destination-over';
          ctx.fillStyle = 'rgba(50,50,50, 0.8)';
          ctx.fillRect(0, 0, chart.width, chart.height);
          ctx.restore();
        },
      };
      const c = new Chart(ctx, {
        type: 'line',
        data: data,
        plugins: [plugin],
        options: {
          plugins: {
            annotation: {
              annotations: {
                hoveringPointLine: {
                  drawTime: 'afterDatasetsDraw',
                  type: 'line',
                  xMin: xFunc,
                  xMax: xFunc,
                  borderColor: 'rgb(50, 50, 50)',
                  borderWidth: 1,
                  label: {
                    content: () => {
                      if (isTruthish(hp?.elevation)) return `Elevation: ${Math.round(hp.elevation)}m`;
                      return '';
                    },
                    enabled: true,
                    position: 'top',
                  },
                },
              },
            },
            legend: {
              display: false,
            },
          },
          elements: {
            point: { radius: 0, hitRadius: 30 },
            line: {
              tension: 0,
            },
          },
          maintainAspectRatio: false,
          scales: {
            y: {
              grace: 20,
              beginAtZero: true,
              grid: {
                display: true,
                borderColor: 'rgb(50,50,50)',
                borderWidth: 1,
              },
            },
            x: {
              grid: {
                display: true,
                borderColor: 'rgb(50,50,50)',
                borderWidth: 1,
              },
            },
          },
        },
      });
      setChart(c);
    }
  }, [chartRef]);
  return (
    <div>
      <div className='ride-stats'>
        <i className='fas fa-arrows-alt-h'></i>&nbsp;{Math.floor(routeDistance(route))}km total, &nbsp;
        <i className='fas fa-arrow-up'></i>&nbsp;{Math.floor(getElevationGain(route))}m gain
      </div>
      <div
        className='ElevationProfile'
        style={{ height: '14vh', width: '100vw', resize: 'vertical', overflow: 'hidden' }}>
        <canvas id='elevation-chart' ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default ElevationProfile;
