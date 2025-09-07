// src/components/dashboard/KpiByDeptChart.js
import React from 'react';
import { Card, Typography } from 'antd';
import Chart from 'react-apexcharts';

const { Title } = Typography;

const KpiByDeptChart = ({ data = [] }) => {
    const options = {
        chart: {
            type: 'bar',
            toolbar: { show: false },
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: true,
            }
        },
        dataLabels: {
            enabled: true,
            formatter: (val) => `${val}%`,
            style: {
                colors: ['#fff']
            }
        },
        xaxis: {
            categories: data.map(item => item.department),
            title: { text: 'Điểm KPI trung bình' }
        },
        tooltip: {
            y: {
                formatter: (val) => `${val}%`
            }
        },
    };

    const series = [{
        name: 'Điểm KPI',
        data: data.map(item => parseFloat(item.score|| 0).toFixed(2))
    }];

    return (
        <Card title={<Title level={5}>Tỷ lệ Hoàn thành KPI theo Phòng ban</Title>} style={{ height: '100%' }}>
            <Chart options={options} series={series} type="bar" height={350} />
        </Card>
    );
};

export default KpiByDeptChart;