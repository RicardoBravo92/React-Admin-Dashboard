import { useEffect, useState } from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import { useTheme, alpha as hexAlpha } from '@mui/material/styles';
import { Chart, useChart } from 'src/components/chart';
import type { ChartOptions } from 'src/components/chart';

// Define the type for the API data
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
  'Monthly Time Series'?: MonthlyTimeSeries;
  'Error Message'?: string;
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
    yaxis: {
      labels: {
        formatter: (value: number) => value.toFixed(2), // Show two decimal places on the Y-axis
      },
    },
    legend: {
      show: true,
    },
    tooltip: {
      y: {
        formatter: (value: number) => `${value.toFixed(2)} USD`, // Show two decimal places in the tooltip
      },
    },
    ...chart.options,
  });

  return (
    <Card {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Chart
        type="bar" // Use bar chart
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
      const url =
        'https://alpha-vantage.p.rapidapi.com/query?function=TIME_SERIES_MONTHLY&symbol=AAPL&datatype=json';
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': 'd5fea69192mshcea247651a31b42p1aec01jsnceadcc0f1ef7', // Replace with your RapidAPI key
          'x-rapidapi-host': 'alpha-vantage.p.rapidapi.com',
        },
      };

      try {
        const response = await fetch(url, options);

        // Check if the response is OK
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response and define the type
        const result = (await response.json()) as AlphaVantageResponse;

        // Check if the API returned an error
        if (result['Error Message']) {
          console.error('API Error:', result['Error Message']);
          return;
        }

        // Check if the expected data is present
        if (!result['Monthly Time Series']) {
          console.error('No monthly time series data found');
          return;
        }

        // Process the data
        const timeSeries = result['Monthly Time Series'];
        const last12Months = Object.entries(timeSeries)
          .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()) // Sort by date descending
          .slice(0, 12) // Take the last 12 months
          .reverse(); // Reverse to go from oldest to newest

        const categories = last12Months.map(([date]) => {
          const [year, month] = date.split('-');
          return `${new Date(date).toLocaleString('default', { month: 'short' })} ${year}`;
        });

        const openPrices = last12Months.map(([, data]) => parseFloat(data['1. open']));
        const highPrices = last12Months.map(([, data]) => parseFloat(data['2. high']));
        const lowPrices = last12Months.map(([, data]) => parseFloat(data['3. low']));
        const closePrices = last12Months.map(([, data]) => parseFloat(data['4. close']));

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
        title="Apple Stock (Last 12 Months)"
        subheader="Open, Close, High, and Low Prices"
        chart={{
          categories: stockData.categories,
          series: stockData.series,
        }}
      />
    </Grid>
  );
}
