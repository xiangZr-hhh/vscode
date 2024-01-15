
//加载数据---向后端获取数据
function getData(mapId) {
    return new Promise((resolve, reject) => {
        //mapId封装成json
        var data = {
            "mapId": mapId
        };

        axios.post('http://localhost:8177/map/loadMap', data)
            .then(function (response) {
                if (response.data.code == 200) {
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
    axios.post('http://localhost:8177/map/saveGeoJson', data)
        // 请求成功
        .then(function (response) {
            console.log("saveData请求成功")
        })
        // 请求失败
        .catch(function (error) {
            console.error('saveData请求失败');
        });
}


//初始化数据
function map() {
    //初始化地图
    const map = new AMap.Map('container', {
        viewMode: '3D',  // 默认使用 2D 模式
        zoom: 17,  //初始化地图层级
        pitch: 30,
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
        map.addControl(new AMap.MapType())
    })

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
                    var ext = item.getExtData()
                    var click = ++ext._geoJsonProperties.click

                    //创建信息窗
                    var infowindow = new AMap.InfoWindow({
                        anchor: 'top-center',
                        content: `<div>一共点击了${click}次</div>`,
                    })
                    //打开信息窗
                    infowindow.open(map, item.getPosition())
                    //保存
                    saveData(geojson.toGeoJSON(),2)

                })
            })
        }
        console.log("初始化数据成功")
    });


}