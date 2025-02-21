import { useEffect, useState } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { useTheme, alpha as hexAlpha } from '@mui/material/styles';
import { Chart, useChart } from 'src/components/chart';
import type { ChartOptions } from 'src/components/chart';

// Define the structure of the API response
type MonthlyTimeSeries = {
  [date: string]: {
    '1. open': string;
    '2. high': string;
    '3. low': string;
    '4. close': string;
    '5. volume': string;
  };
};

type AlphaVantageResponse = {
  'Monthly Time Series': MonthlyTimeSeries;
};

type Props = {
  title?: string;
  subheader?: string;
  chart: {
    colors?: string[];
    categories?: string[];
    series: {
      name: string;
      data: number[];
    }[];
    options?: ChartOptions;
  };
};

function AnalyticsWebsiteVisits({ title, subheader, chart, ...other }: Props) {
  const theme = useTheme();

  const chartColors = chart.colors ?? [
    theme.palette.primary.dark,
    theme.palette.secondary.main,
    theme.palette.error.main,
    hexAlpha(theme.palette.primary.light, 0.64),
  ];

  const chartOptions = useChart({
    colors: chartColors,
    stroke: {
      width: 2,
    },
    xaxis: {
      categories: chart.categories,
    },
    legend: {
      show: true,
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value} USD`,
      },
    },
    ...chart.options,
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Chart
        type="bar" // Set chart type to bar
        series={chart.series}
        options={chartOptions}
        height={364}
        sx={{ py: 2.5, pl: 1, pr: 2.5 }}
      />
    </Card>
  );
}

export default function Page() {
  const [stockData, setStockData] = useState<{
    categories: string[];
    series: { name: string; data: number[] }[];
  }>({
    categories: [],
    series: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiKey = 'YOUR_API_KEY'; // Replace with your Alpha Vantage API key
        const response = await fetch(
          `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=AAPL&apikey=${apiKey}`
        );
        const data = (await response.json()) as AlphaVantageResponse;

        // Extract the last 12 months of data
        const monthlyData = Object.entries(data['Monthly Time Series'])
          .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()) // Sort by date descending
          .slice(0, 12) // Take the last 12 months
          .reverse(); // Reverse the order to go from oldest to newest

        // Transform the data
        const categories = monthlyData.map(([date]) => {
          const [year, month] = date.split('-');
          return `${new Date(date).toLocaleString('default', { month: 'short' })} ${year}`;
        });

        const openPrices = monthlyData.map(([, entry]) => parseFloat(entry['1. open']));
        const highPrices = monthlyData.map(([, entry]) => parseFloat(entry['2. high']));
        const lowPrices = monthlyData.map(([, entry]) => parseFloat(entry['3. low']));
        const closePrices = monthlyData.map(([, entry]) => parseFloat(entry['4. close']));

        setStockData({
          categories,
          series: [
            { name: 'Open', data: openPrices },
            { name: 'High', data: highPrices },
            { name: 'Low', data: lowPrices },
            { name: 'Close', data: closePrices },
          ],
        });
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <Grid xs={12} md={6} lg={8}>
      <AnalyticsWebsiteVisits
        title="Apple stock for the past 12 months"
        subheader="from March 2024 to February 2025"
        chart={{
          categories: stockData.categories,
          series: stockData.series,
        }}
      />
    </Grid>
  );
}
