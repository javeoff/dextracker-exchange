import { createChart, CrosshairMode, IChartApi, ISeriesApi, LineStyle, Time, CandlestickSeries, LineSeries, HistogramSeries, CandlestickData, HistogramData, BarPrice } from "lightweight-charts";
import { forwardRef, useImperativeHandle, useRef, useEffect, useState } from "react";
import { formatPrice } from "./price-formatter";
import { useTheme } from "next-themes";
import { getBigNumber } from "@/lib/utils";

export type CandleData = {
   time: number;
   open: number;
   high: number;
   low: number;
   close: number;
   volume?: number;
   source?: string;
};

export const Chart = forwardRef(({ onMove, initialData, chartInterval = '1m' }: {
   initialData: CandleData[];
   chartInterval?: string;
   onMove?: (price?: number, y?: number, width?: number) => void;
}, ref) => {
   const [hoverInfo, setHoverInfo] = useState<{
      min?: number;
      max?: number;
      volumeInUsd?: number;
      visible: boolean;
   }>({ visible: false });
   const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
   const dataRef = useRef<CandleData[]>(initialData);
   const priceSeriesRef = useRef<Record<string, ISeriesApi<'Line'>>>({});
   const limitSeriesRef = useRef<Record<string, ISeriesApi<'Line'>>>({});
   const chartRef = useRef<HTMLDivElement>(null);
   const chartApiRef = useRef<IChartApi | null>(null);
   const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
   const previousRangeRef = useRef({ from: 0, to: 0 });
   const { resolvedTheme: theme } = useTheme();

   useEffect(() => {
      dataRef.current = initialData;
      if (candleSeriesRef.current) {
         candleSeriesRef.current.setData(initialData as CandlestickData[]);
      }
   }, [initialData]);

   useImperativeHandle(ref, () => ({
      addPrice(price: number) {
         if (!candleSeriesRef.current || !dataRef.current) {
            return;
         }
         const nowSec = Date.now();
         const newData = [...dataRef.current.filter((d) => d.time !== nowSec), {
            time: nowSec,
            open: price,
            high: price,
            low: price,
            close: price,
         }];
         candleSeriesRef.current.setData(newData as CandlestickData[]);
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
            time: 0 as Time,
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
            return;
         }
         candleSeriesRef.current.setData(dataRef.current as CandlestickData[]);
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

         chartApiRef.current.timeScale().subscribeVisibleTimeRangeChange(callback);
         chartApiRef.current.timeScale().subscribeSizeChange(callback);
         chartApiRef.current.timeScale().subscribeVisibleLogicalRangeChange(callback);

         const checkVisibleRange = () => {
            try {
               if (!candleSeriesRef.current) {
                  return;
               }

               const priceScale = candleSeriesRef.current.priceScale?.();

               if (!priceScale) {
                  return;
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
            } catch { }
         };

         const intervalId = setInterval(checkVisibleRange, 200);

         return () => {
            if (!chartApiRef.current) {
               return;
            }
            chartApiRef.current.timeScale().unsubscribeVisibleTimeRangeChange(callback);
            chartApiRef.current.timeScale().unsubscribeVisibleLogicalRangeChange(callback);
            chartApiRef.current.timeScale().unsubscribeSizeChange(callback);

            clearInterval(intervalId);
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
            scaleMargins: {
               top: 0,
               bottom: 0,
            },
         },
         leftPriceScale: {
            borderColor: theme === 'dark' ? '#262626' : '#e6e6e6',
         },
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
         upColor: '#535ef9',
         downColor: '#ef2770',
         borderUpColor: '#535ef9',
         borderDownColor: '#ef2770',
         wickUpColor: '#535ef9',
         wickDownColor: '#ef2770',
         priceFormat: {
            type: 'custom',
            formatter: (price: number) => formatPrice(price),
         },
      });

      volumeSeriesRef.current = chartApiRef.current.addSeries(HistogramSeries, {
         priceFormat: {
            type: 'volume',
         },
         priceScaleId: 'volume',
         color: '#26a69a',
      });
      chartApiRef.current.priceScale('volume').applyOptions({
         scaleMargins: {
            top: 0.9,
            bottom: 0,
         },
      });

      // Set initial data
      const volumeData = dataRef.current.map(candle => ({
         time: candle.time,
         value: candle.volume || 0,
         color: candle.close >= candle.open ? '#26a69a' : '#ef5350',
      }));

      candleSeriesRef.current.setData(dataRef.current as CandlestickData[]);
      volumeSeriesRef.current.setData(volumeData as HistogramData[]);

      chartApiRef.current.subscribeCrosshairMove((param) => {
         if (!candleSeriesRef.current || !chartRef.current) {
            return;
         }
         if (!param.point) {
            onMove?.(undefined, undefined, undefined);
            return;
         }
         const y = param.point.y;
         const price = candleSeriesRef.current.coordinateToPrice(y);
         if (onMove) {
            onMove(price as BarPrice, y, chartRef.current.clientWidth);
         }
      });

      chartApiRef.current.subscribeCrosshairMove((param) => {
         if (!param.time || !param.seriesData || !volumeSeriesRef.current || !candleSeriesRef.current) {
            setHoverInfo({ visible: false });
            return;
         }

         const { low, high, close } = param.seriesData.get(candleSeriesRef.current) as {
            open: number;
            high: number;
            low: number;
            close: number;
            volume?: number;
         };
         const { value: volume } = param.seriesData.get(volumeSeriesRef.current) as {
            value: number;
            time: number
         };

         const volumeInUsd = volume && close ? volume * close : undefined;

         setHoverInfo({
            min: low,
            max: high,
            volumeInUsd,
            visible: true,
         });
      });

      return () => {
         if (chartApiRef.current) {
            chartApiRef.current.remove();
            chartApiRef.current = null;
         }
      };
   }, [initialData, theme, chartInterval, onMove]);

   // Вспомогательная функция цвета для линий
   function getLabelColor(label: string) {
      if (label.toLowerCase().includes("long")) {
         return "#17b979";
      } else if (label.toLowerCase().includes("short")) {
         return "#e54c67";
      }
      return "#555";
   }

   return (
      <>
         <div
            ref={chartRef}
            data-chart-container
            style={{
               width: '100%',
               height: '100%',
               flex: '1 1 auto',
               minHeight: '300px',
               minWidth: '200px',
               position: 'relative',
            }}
         >
         </div>
         <div
            style={{
               gap: '5px',
               position: 'absolute',
               top: 0,
               left: 0,
               padding: '8px',
               color: theme === 'dark' ? '#fff' : '#000',
               fontSize: '12px',
               pointerEvents: 'none',
               userSelect: 'none',
               display: hoverInfo.visible ? 'flex' : 'none',
               zIndex: 10,
            }}
         >
            <div className="text-foreground/80">Min: ${hoverInfo.min?.toFixed(6)}</div>
            <div className="text-foreground/80">Max: ${hoverInfo.max?.toFixed(6)}</div>
            {!!hoverInfo.volumeInUsd && (<div className="text-foreground/80">Volume: ${getBigNumber(hoverInfo.volumeInUsd)}</div>)}
         </div>
      </>
   );
});

Chart.displayName = 'Chart';
