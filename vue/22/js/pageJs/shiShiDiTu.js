// 全局变量,map---地图
var map;

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
    map = new AMap.Map('container', {
        viewMode: '3D',  // 默认使用 2D 模式
        zoom: 17,  //初始化地图层级
        pitch: 45,
        center: [120.471077, 31.582275]  //初始化地图中心点
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
    //初始化界面
    initArea()
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
                    var markerId = ext._geoJsonProperties.gid

                    //创建信息窗
                    var infowindow = new AMap.InfoWindow({
                        anchor: 'middle-left',
                        content:`<div style="font-size:13px">名称：${name}<br>一共点击了${click}次<br>关键信息:
                        ${content}</div>`
                    })
                    //打开信息窗
                    infowindow.open(map, item.getPosition())
                    showMarkInformation(markerId)
                    saveData( geojson.toGeoJSON(),2)
                })
            })
        }
        console.log("初始化数据成功")
    });

}

//获取点信息---向后端获取数据
function getMarkerData(markerId) {
    return new Promise((resolve, reject) => {
        //mapId封装成json
        var data = {
            "id": markerId
        };

        axios.post('http://121.37.39.206:8177/marker/getMarker', data)
            .then(function (response) {
                if (response.data.code == 200) {
                    resolve(response.data.data);
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

//初始化界面
function initArea() {
    getAllArea().then(result => {

        //获取选择框
        var select = document.getElementById("areaSelect");

        //获取地区信息json数组
        var optionsArray = result.areas
        //在选择框中插入option数据
        optionsArray.forEach(function (item) {
            var option = document.createElement("option");
            option.value = item.id;
            option.text = item.areaName;
            select.add(option)
        });

        //检测现有select框数据，将其区域地点和名称赋值到对应位置
        optionsArray.forEach(function (item) {
            if (select.value == item.id) {
                document.getElementById("areaName").innerHTML = item.areaName
                document.getElementById("areaInformation").innerHTML = item.content
            }
        });

        //初始化其他方法

        createMap();
    })

}

//获取所有区域
function getAllArea() {
    return new Promise((resolve, reject) => {

        //发送获取地区信息请求
        axios.get('http://121.37.39.206:8177/area/getAllArea')
            .then(function (response) {
                if (response.data.code == 200) {
                    resolve(response.data.data);
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


//改变区域
function changeArea() {

    //从选择框中获取areaId
    var areaId = document.getElementById("areaSelect").value;
    //获取地区信息
    getAreaInformation(areaId).then(result => {

        //根据返回的地区信息更新内容
        document.getElementById("areaName").innerHTML = result.areaName;
        document.getElementById("areaInformation").innerHTML = result.content;

        var strArray = result.areaPosition.split(",");
        var numArray = strArray.map(function (strNum) {
            return parseFloat(strNum); // 使用parseInt将字符串转换为浮点数
        });
        var positiondata = new AMap.LngLat(numArray[0], numArray[1]);
        map.setCenter(positiondata);
    })

}

//获取单个区域信息
function getAreaInformation(areaId) {
    return new Promise((resolve, reject) => {

        //转换为数字类型
        var id = parseInt(areaId)
        //areaId封装成json
        var data = {
            "areaId": id
        };

        //发送获取地区信息请求
        axios.post('http://121.37.39.206:8177/area/getArea', data)
            .then(function (response) {
                if (response.data.code == 200) {
                    resolve(response.data.data);
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


//展示标记点对应信息
function showMarkInformation(markerId) {

    //根据id获取点数据
    getMarkerData(markerId).then(result => {

        if (result.name != null) {
            document.getElementById("markName").innerHTML = result.name;
        }

        if (result.content != null) {
            document.getElementById("markContent").innerHTML = result.content;
        }

        document.getElementById("markPosition").innerHTML = result.position;
        document.getElementById("markCreateTime").innerHTML = result.createTime;

        if (result.createName != null) {
            document.getElementById("markCreateName").innerHTML = result.createName;
        } else if (result.createName == null) {
            document.getElementById("markCreateName").innerHTML = "暂无数据";
        }

        if (result.updateTime != null) {
            document.getElementById("markUpdateTime").innerHTML = result.updateTime;
        } else if (result.updateTime == null) {
            document.getElementById("markUpdateTime").innerHTML = "暂无数据";
        }

        if (result.updateName != null) {
            document.getElementById("markUpdateName").innerHTML = result.updateName;
        } else if (result.updateTime == null) {
            document.getElementById("markUpdateName").innerHTML = "暂无数据";
        }

    })
}