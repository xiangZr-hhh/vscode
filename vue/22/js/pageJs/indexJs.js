// js部分---主界面js

//获取数据---向后端获取数据
function getData(mapId) {
    return new Promise((resolve, reject) => {
        //mapId封装成json
        var data = {
            "mapId": mapId
        };

        axios.post('http://121.37.39.206:8177/map/loadMap', data)
            .then(function (response) {
                if (response.data.code = a = 200) {
                    resolve(response.data.data.geojson);
                } else {
                    console.log(response.data.msg);
                    resolve(false); // 或其他默认值，视情况而定
                }
            })
            .catch(function (error) {
                console.error('请求失败');
                reject(error);
            })

    })
}




//保存数据---向后端发送数据，并保存
function saveData(json, mapId) {

    var data = {
        "mapId": mapId,
        "geojson": json,
    }

    //发送请求
    axios.post('http://121.37.39.206:8177/map/saveGeoJson', data)
        // 请求成功
        .then(function (response) {
            console.log("saveData请求成功")
        })
        // 请求失败
        .catch(function (error) {

            console.error('saveData请求失败');
        });
}


//获取天气
function getWeather() {

    AMap.plugin('AMap.Weather', function () {
        //创建天气实例
        var weather = new AMap.Weather();

        // 获取天气信息并显示
        weather.getLive('无锡市', function (err, data) {
            if (!err) {

                // 获取温度湿度
                var weatherInfoTemperature = '温度：' + data.temperature + '℃' + '<br>' + '湿度：' + data.humidity + '%'
                    + '<br>' + '风力：' + data.windPower + '级' + '<br>';
                document.getElementById('weather-info').innerHTML = weatherInfoTemperature;

                console.log(data.weather)
                // 根据天气情况选择相应的天气图片
                var weatherImage = '';
                switch (data.weather) {
                    case '晴':
                        weatherImage = 'http://124.220.42.243:8083/image/DiTu/QingTian.png'; // 替换为晴天图片的URL
                        break;
                    case '多云':
                        weatherImage = 'http://124.220.42.243:8083/image/DiTu/QingTian.png'; // 替换为多云图片的URL
                        break;
                    case '雨':
                        weatherImage = 'http://124.220.42.243:8083/image/DiTu/QingTian.png'; // 替换为雨天图片的URL
                        break;
                    // 其他天气情况可以继续添加
                    default:
                        weatherImage = 'http://124.220.42.243:8083/image/DiTu/QingTian.png'; // 默认图片
                }

                // 在页面上显示天气图片
                var imageElement = document.createElement('img');
                imageElement.src = weatherImage;
                imageElement.setAttribute("height", "70px")
                // imageElement.setAttribute("margin-left","20px")
                document.getElementById('weather-image').appendChild(imageElement);
            } else {
                console.error('获取天气信息失败', err);
            }
        });
    });

}


function map() {

    //初始化地图
    const map = new AMap.Map('container', {
        viewMode: '3D',  // 默认使用 2D 模式
        zoom: 13,  //初始化地图层级
        pitch: 45,
        center: [107.876748,26.940237]  //初始化地图中心点
    });


    //安装地图插件
    AMap.plugin(["AMap.GeoJSON", "AMap.MoveAnimation", "AMap.ToolBar", "AMap.Scale", "AMap.ControlBar", "AMap.MapType"], function () {
        //缩略按钮插件
        map.addControl(new AMap.ToolBar({
            position: {
                top: '180px',
                right: '40px'
            }
        }))
        //比例尺显示插件
        map.addControl(new AMap.Scale())
        //观察角度插件
        map.addControl(new AMap.ControlBar())
        //地图图层切换插件
        map.addControl(new AMap.MapType({
            defaultType: 1, // 0表示默认底图，1表示卫星图
            showRoad: true // 显示路网
        }))
    })


    // 3d楼层
    var buildingsD = new AMap.Buildings;
    map.add(buildingsD)

    //初始化点标注
    loadMark(map);

}

//初始化所有点标注(即获取所有geojson并转化为地图上的点)
function loadMark(map) {

    getData(2).then(result => {

        var geojson = new AMap.GeoJSON({
            geoJSON: null,
        });
        if (result != false) {
            geojson.importData(JSON.parse(result))
            map.add(geojson)
            geojson.eachOverlay(function (item) {
                item.on('click', function (e) {
                    console.log(e.lnglat, '数据被点击了')
                    var ext = item.getExtData()
                    var click = ++ext._geoJsonProperties.click
                    var name = ext._geoJsonProperties.name
                    var content = ext._geoJsonProperties.content

                    //创建信息窗
                    var infowindow = new AMap.InfoWindow({
                        anchor: 'middle-left',
                        content: `<div style="font-size:13px">名称：${name}<br>一共点击了${click}次<br>关键信息:
                        ${content}</div>`
                    })
                    //打开信息窗
                    infowindow.open(map, item.getPosition())
                    saveData(geojson.toGeoJSON(), 2)
                })
            })
        }
        console.log("初始化数据成功")
    });


}

// 实时汇报下拉框跳转界面
function huiBaoToPage() {
    var selectElement = document.getElementById("huiBaoSelect");
    var selectedValue = selectElement.value;

    // Check if a valid option is selected
    if (selectedValue && selectedValue !== "") {
        // Redirect to the selected page
        window.location.href = selectedValue;
    }
}


function sheBeiTu() {
    var chartDom = document.getElementById('shebei');
    var myChart = echarts.init(chartDom);
    var option;

    option = {
        title: {
            text: '灾情统计',
            subtext: '饼状图',
            left: 'center'
        },
        tooltip: {
            trigger: 'item'
        },
        legend: {
            orient: 'vertical',
            left: 'left'
        },
        series: [
            {
                name: '灾难类型',
                type: 'pie',
                radius: '50%',
                data: [
                    { value: 1048, name: '城市消防' },
                    { value: 735, name: '森林消防' },
                    { value: 580, name: '自然灾害救援' },
                    { value: 484, name: '人员搜救' },
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };

    option && myChart.setOption(option);


}


function baojing() {
    var chartDom = document.getElementById('baojing');
    var myChart = echarts.init(chartDom);
    var option;

    option = {
        xAxis: {
            type: 'category',
            data: ['正常运行', '待维修', '报警状态', '异常状态']
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: 'Life Cost',
                type: 'bar',
                stack: 'Total',
                label: {
                    show: true,
                    position: 'inside'
                },
                data: [
                    {
                        value: 16,
                        itemStyle: {
                            color: '#5FB878'
                        }
                    },
                    4,
                    {
                        value: 3,
                        itemStyle: {
                            color: '#a90000'
                        }
                    },
                    {
                        value: 2,
                        itemStyle: {
                            color: '#FFB800'
                        }
                    }
                ],
                type: 'bar'
            }
        ]
    };

    option && myChart.setOption(option);
}

function showWeather() {

    var chartDom = document.getElementById('weatherShowMy');
    var myChart = echarts.init(chartDom);
    var option;

    const colors = ['#5470C6', '#EE6666'];
    option = {
        color: colors,
        tooltip: {
            trigger: 'none',
            axisPointer: {
                type: 'cross'
            }
        },
        legend: {},
        grid: {
            top: 70,
            bottom: 50
        },
        xAxis: [
            {
                type: 'category',
                axisTick: {
                    alignWithLabel: true
                },
                axisLine: {
                    onZero: false,
                    lineStyle: {
                        color: colors[1]
                    }
                },
                axisPointer: {
                    label: {
                        formatter: function (params) {
                            return (
                                '恶劣天气天数  ' +
                                params.value +
                                (params.seriesData.length ? '：' + params.seriesData[0].data : '')
                            );
                        }
                    }
                },
                // prettier-ignore
                data: ['2023-1', '2023-2', '2023-3', '2023-4', '2023-5', '2023-6', '2023-7', '2023-8', '2023-9', '2023-10', '2023-11', '2023-12']
            },
            {
                type: 'category',
                axisTick: {
                    alignWithLabel: true
                },
                axisLine: {
                    onZero: false,
                    lineStyle: {
                        color: colors[0]
                    }
                },
                axisPointer: {
                    label: {
                        formatter: function (params) {
                            return (
                                '晴天天数  ' +
                                params.value +
                                (params.seriesData.length ? '：' + params.seriesData[0].data : '')
                            );
                        }
                    }
                },
                // prettier-ignore
                data: ['2023-1', '2023-2', '2023-3', '2023-4', '2023-5', '2023-6', '2023-7', '2015-8', '2023-9', '2023-10', '2023-11', '2023-12']
            }
        ],
        yAxis: [
            {
                type: 'value'
            }
        ],
        series: [
            {
                name: '晴天(2023)',
                type: 'line',
                xAxisIndex: 1,
                smooth: true,
                emphasis: {
                    focus: 'series'
                },
                data: [
                    26, 13, 11, 22, 17, 15, 10, 20, 21, 18, 16, 5
                ]
            },
            {
                name: '恶劣天气(2023)',
                type: 'line',
                smooth: true,
                emphasis: {
                    focus: 'series'
                },
                data: [
                    5, 7, 20, 8, 16, 15, 21, 11, 19, 13, 4, 2
                ]
            }
        ]
    };

    option && myChart.setOption(option);

}


function yingjianshow() {
    var chartDom = document.getElementById('yingjian');
    var myChart = echarts.init(chartDom);
    var option;

    option = {
        title: {
            text: '硬件参数(平均值)'
        },
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: ['无人机电池', '热红外线温度', '无人机速度', '无人机高度(m)', '无人机距离(km)']
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['0:00', '2:00', '4:00', '6:00', '8:00', '10:00', '12:00','14:00','16:00','18:00','20:00','22:00']
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: '无人机电池',
                type: 'line',
                stack: 'Total',
                data: [80, 45, 13, 100,100, 100, 100,100,95,68,43,76]
            },
            {
                name: '热红外线温度',
                type: 'line',
                stack: 'Total',
                data: [16.1,15.4,16.4,18, 21, 21, 21,21,15.5,16.5,15.5,21]
            },
            {
                name: '无人机速度',
                type: 'line',
                stack: 'Total',
                data: [34, 33, 23,0, 0, 0, 0,0,24,37,33,11]
            },
            {
                name: '无人机高度(m)',
                type: 'line',
                stack: 'Total',
                data: [95, 115, 74, 12, 0, 0, 0,0,34,55,75,12]
            },
            {
                name: '无人机距离(km)',
                type: 'line',
                stack: 'Total',
                data: [11, 23,27, 12, 0, 0,0,0,7,13,15,6]
            }
        ]
    };

    option && myChart.setOption(option);

}



function zaiqing(){

    var chartDom = document.getElementById('zaiqing1');
var myChart = echarts.init(chartDom);
var option;

option = {
  title: {
    text: '灾情位置统计'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985'
      }
    }
  },
  legend: {
    data: ['城市', '湖泊', '山体', '平原', '其他']
  },
  toolbox: {
    feature: {
      saveAsImage: {}
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: [
    {
      type: 'category',
      boundaryGap: false,
      data: ['一月', '二月', '三月', '四月', '五月', '六月', '七月','八月','九月','十月','十一月','十二月']
    }
  ],
  yAxis: [
    {
      type: 'value'
    }
  ],
  series: [
    {
      name: '城市',
      type: 'line',
      stack: 'Total',
      areaStyle: {},
      emphasis: {
        focus: 'series'
      },
      data: [2, 5, 8, 7, 3, 9, 1, 4, 6, 10, 0, 0]
    },
    {
      name: '湖泊',
      type: 'line',
      stack: 'Total',
      areaStyle: {},
      emphasis: {
        focus: 'series'
      },
      data: [7, 1, 3, 9, 4, 2, 6, 8, 5, 10, 3, 0]
    },
    {
      name: '山体',
      type: 'line',
      stack: 'Total',
      areaStyle: {},
      emphasis: {
        focus: 'series'
      },
      data: [3, 6, 9, 2, 5, 8, 4, 7, 1, 3, 5, 0]
    },
    {
      name: '平原',
      type: 'line',
      stack: 'Total',
      areaStyle: {},
      emphasis: {
        focus: 'series'
      },
      data: [8, 4, 6, 1, 9, 3, 7, 2, 5, 1, 2, 0]
    },
    {
      name: '其他',
      type: 'line',
      stack: 'Total',
      label: {
        show: true,
        position: 'top'
      },
      areaStyle: {},
      emphasis: {
        focus: 'series'
      },
      data: [5, 9, 7, 4, 6, 2, 8, 3, 1, 3, 1, 0]
    }
  ]
};

option && myChart.setOption(option);

}