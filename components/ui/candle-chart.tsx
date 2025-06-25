import { createChart, CrosshairMode, IChartApi, ISeriesApi, LineStyle, Time, CandlestickSeries, LineSeries } from "lightweight-charts";
import { forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import { formatPrice } from "./price-formatter";
import { useTheme } from "next-themes";
import { parseInterval } from "@/lib/utils";

export const Chart = forwardRef(({ onMove, initialData, chartInterval = '1m' }: {
   initialData: Record<string, number>;
   chartInterval?: string;
   onMove?: (price?: number, y?: number, width?: number) => void;
}, ref) => {
   const dataRef = useRef<Record<string, number>>(initialData);
   const priceSeriesRef = useRef<Record<string, ISeriesApi<'Line'>>>({});
   const limitSeriesRef = useRef<Record<string, ISeriesApi<'Line'>>>({});
   const chartRef = useRef<HTMLDivElement>(null);
   const chartApiRef = useRef<IChartApi | null>(null);
   const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
   const previousRangeRef = useRef({ from: 0, to: 0 });
   const { theme } = useTheme();

   useEffect(() => {
      dataRef.current = initialData;
   }, [initialData])

   useImperativeHandle(ref, () => ({
      addPrice(price: number) {
         if (!candleSeriesRef.current || !dataRef.current) {
            return
         }
         dataRef.current[String(Date.now())] = Number(price);
         const newDataPoints = getChartData(dataRef.current, chartInterval)

         // eslint-disable-next-line
         candleSeriesRef.current.setData(newDataPoints as any);
      },
      addLimitLine: (type: 'long' | 'short', amount: number, price: number) => {
         const label = `${type}${amount}${price}`;
         if (!chartApiRef.current || price === 0) return;

         if (!!type && !limitSeriesRef.current[label]) {
            const color = type === 'long' ? '#17b979' : '#e54c67';
            limitSeriesRef.current[label] = chartApiRef.current.addSeries(LineSeries, {
               color: color,
               lineWidth: 1,
               lineStyle: LineStyle.Solid,
               lastValueVisible: true,
               priceLineVisible: true,
               priceLineWidth: 1,
               priceLineColor: color,
               priceLineStyle: LineStyle.Solid,
               crosshairMarkerVisible: false,
            });
         }

         limitSeriesRef.current[label].update({
            time: 0,
            value: Number(price)
         });
      },
      addPositionLine: (type: 'long' | 'short', amount: number, price: number) => {
         const label = `${type}${amount}${price}`;
         if (!chartApiRef.current || price === 0) return;

         if (!!type && !limitSeriesRef.current[label]) {
            const color = type === 'long' ? '#17b979' : '#e54c67';
            limitSeriesRef.current[label] = chartApiRef.current.addSeries(LineSeries, {
               color: color,
               lineWidth: 1,
               lineStyle: LineStyle.Solid,
               lastValueVisible: true,
               priceLineVisible: true,
               priceLineWidth: 1,
               priceLineColor: color,
               priceLineStyle: LineStyle.Solid,
               crosshairMarkerVisible: false,
            });
         }

         limitSeriesRef.current[label].update({
            time: 0 as Time,
            value: Number(price)
         });
      },
      addPriceLine: (label: string, price: number) => {
         if (!chartApiRef.current || !price) return;

         if (!priceSeriesRef.current[label]) {
            const color = getLabelColor(label);
            priceSeriesRef.current[label] = chartApiRef.current.addSeries(LineSeries, {
               color: color,
               lineWidth: 1,
               lineStyle: LineStyle.Solid,
               lastValueVisible: true,
               priceLineVisible: true,
               priceLineWidth: 1,
               priceLineColor: color,
               priceLineStyle: LineStyle.Solid,
               crosshairMarkerVisible: false,
               title: label,
            });
         }

         priceSeriesRef.current[label].update({
            time: 0 as Time,
            value: price
         });
      },
      reflow: () => {
         if (!candleSeriesRef.current) {
            return
         }
         const newDataPoints = getChartData(dataRef.current, chartInterval)
         // eslint-disable-next-line
         candleSeriesRef.current.setData(newDataPoints as any);
      },

      priceToY: (price: number): number | undefined => {
         if (!candleSeriesRef.current || !chartApiRef.current) {
            return undefined;
         }
         return candleSeriesRef.current.priceToCoordinate(price) as number | undefined;
      },

      subscribeToScaleChanges: (callback: () => void): (() => void) => {
         if (!chartApiRef.current || !candleSeriesRef.current) {
            return () => { };
         }

         // Subscribe to time scale changes (X-axis)
         chartApiRef.current.timeScale().subscribeVisibleTimeRangeChange(callback);
         chartApiRef.current.timeScale().subscribeSizeChange(callback);
         chartApiRef.current.timeScale().subscribeVisibleLogicalRangeChange(callback);
         const checkVisibleRange = () => {
            try {
            if (!candleSeriesRef.current) {
               return
            }

            const priceScale = candleSeriesRef.current.priceScale?.();

            if (!priceScale) {
               return
            }

            const currentRange = priceScale.getVisibleRange();
            const previousRange = previousRangeRef.current;

            if (
               !currentRange ||
               !previousRange ||
               currentRange.from !== previousRange?.from ||
               currentRange.to !== previousRange?.to
            ) {
               callback();
               previousRangeRef.current = currentRange!;
            }
            } catch {}
         };

         const intervalId = setInterval(checkVisibleRange, 200);

         return () => {
            if (!chartApiRef.current) {
               return;
            }
            chartApiRef.current.timeScale().unsubscribeVisibleTimeRangeChange(callback);
            chartApiRef.current.timeScale().unsubscribeVisibleLogicalRangeChange(callback);
            chartApiRef.current.timeScale().unsubscribeSizeChange(callback);

            clearInterval(intervalId)
         };
      }
   }));

   useEffect(() => {
      if (!chartRef.current) return;

      const containerWidth = chartRef.current.clientWidth;
      const containerHeight = chartRef.current.clientHeight || 400;

      chartApiRef.current = createChart(chartRef.current, {
         width: containerWidth,
         height: containerHeight,
         layout: {
            background: { color: (theme === 'dark' ? '#0a0a0a' : '#ffffff') },
            textColor: theme === 'dark' ? '#d1d4dc' : '#333333',
         },
         grid: {
            vertLines: {
               color: theme === 'dark' ? '#262626' : '#e6e6e6',
            },
            horzLines: {
               color: theme === 'dark' ? '#262626' : '#e6e6e6',
            },
         },
         rightPriceScale: {
            visible: true,
            borderColor: theme === 'dark' ? '#262626' : '#e6e6e6',
            formatter: (price: number) => formatPrice(price),
            // eslint-disable-next-line
         } as any,
         leftPriceScale: {
            borderColor: theme === 'dark' ? '#262626' : '#e6e6e6',
            formatter: (price: number) => formatPrice(price),
            // eslint-disable-next-line
         } as any,
         timeScale: {
            rightOffset: 5,
            barSpacing: 20,
            timeVisible: true,
            secondsVisible: false,
            tickMarkFormatter: (time: number) => {
               const date = new Date(time * 1000);
               return date.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
               });
            },
         },
         crosshair: {
            mode: CrosshairMode.Normal,
         },
      });

      candleSeriesRef.current = chartApiRef.current.addSeries(CandlestickSeries, {
         upColor: '#3f9383',
         downColor: '#cb485e',
         borderUpColor: '#4caf50',
         borderDownColor: '#f44336',
         wickUpColor: '#4caf50',
         wickDownColor: '#f44336',
         priceFormat: {
            type: 'custom',
            formatter: (price: number) => formatPrice(price),
         },
      });

      // Add crosshair move handler
      chartApiRef.current.subscribeCrosshairMove((param) => {
         if (!candleSeriesRef.current || !chartRef.current) {
            return;
         }
         if (!param.point) {
            onMove?.(undefined, undefined, undefined)
            return;
         }
         const y = param.point.y;
         const price = candleSeriesRef.current.coordinateToPrice(y);
         const chartRect = chartRef.current.getBoundingClientRect();
         const width = chartRect.width
         if (price && onMove) {
            onMove(price, y, width);
         }
      });

      // Set initial data
      if (candleSeriesRef.current) {
         const newDataPoints = getChartData(dataRef.current, chartInterval);
         // eslint-disable-next-line
         candleSeriesRef.current.setData(newDataPoints as any);
      }

      // Handle window resize
      const handleResize = () => {
         if (chartApiRef.current && chartRef.current) {
            chartApiRef.current.resize(
               chartRef.current.clientWidth,
               chartRef.current.clientHeight
            );
         }
      };

      window.addEventListener('resize', handleResize);

      // Cleanup function
      return () => {
         window.removeEventListener('resize', handleResize);
         if (chartApiRef.current) {
            chartApiRef.current.remove();
            chartApiRef.current = null;
         }
      };
   }, [theme, chartInterval, onMove]);

   // Update chart when theme changes
   useEffect(() => {
      if (chartApiRef.current) {
         chartApiRef.current.applyOptions({
            layout: {
               background: { color: (theme === 'dark' ? '#0a0a0a' : '#ffffff') },
               textColor: theme === 'dark' ? '#d1d4dc' : '#333333',
            },
            grid: {
               vertLines: {
                  color: theme === 'dark' ? '#262626' : '#e6e6e6',
               },
               horzLines: {
                  color: theme === 'dark' ? '#262626' : '#e6e6e6',
               },
            },
         });
      }
   }, [theme]);

   return (
      <div
         ref={chartRef}
         data-chart-container
         style={{
            width: '100%',
            height: '100%',
            flex: '1 1 auto',
            minHeight: '300px',
            minWidth: '200px',
            position: 'relative'
         }}
      />
   );
});

Chart.displayName = 'Chart';

// Keep the getChartData function as is
interface ChartDataPoint {
   time: number;
   open: number;
   high: number;
   low: number;
   close: number;
}

const getChartData = (
   chartData: Record<string, number>,
   chartInterval: string,
) => {
   const intervalSeconds = parseInterval(chartInterval);

   const entries = Object.entries(chartData);
   entries.sort(([timestampA], [timestampB]) => parseInt(timestampA) - parseInt(timestampB));

   const groupedData: Record<number, number[]> = {};

   for (const [timestamp, value] of entries) {
      const time = parseInt(timestamp, 10) / 1000;
      const intervalIndex = Math.floor(time / intervalSeconds);
      if (!groupedData[intervalIndex]) {
         groupedData[intervalIndex] = [];
      }
      groupedData[intervalIndex].push(value);
   }

   const newDataPoints: ChartDataPoint[] = [];
   const intervalIndices = Object.keys(groupedData)
      .map(Number)
      .sort((a, b) => a - b);

   for (const intervalIndex of intervalIndices) {
      const values = groupedData[intervalIndex];
      const time = intervalIndex * intervalSeconds;
      const open = values[0] || 0;
      const close = values[values.length - 1] || 0;
      const high = Math.max(...values);
      const low = Math.min(...values);
      if (time) {
         newDataPoints.push({ time, open, high, low, close });
      }
   }
   return newDataPoints;
};

function getLabelColor(label: string) {
   switch (label) {
      case 'ray_v4': return '#FFC107'
      case 'orca': return '#9C27B0'
      default: return '#262626'
   }
}
