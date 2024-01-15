// js部分---添加标注点
//获取数据---向后端获取数据
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

    //点击一点并反馈数据
    clickOne(map);
}


//只允许点击一个点，并反馈相关数据
function clickOne(map){
     //设置只允许在地图上点击一个点
     var marker = null;
     //监听地图点击事件
     map.on('click', function (e) {
         //如果marker以及存在，则移除，保证只有一个点新建
         if (marker) {
             map.remove(marker)
         }
 
         marker = new AMap.Marker({
             position: e.lnglat,
             Image: "http://124.220.42.243:8083/image/DiTu/TuPiao.png",
             extData: {
                 _geoJsonProperties: {
                     gid: Date.now().toString(36),
                     click: 0,
                 }
             }
         })

         //显示经纬度
         document.getElementById("markPosition").innerHTML = marker.getPosition()
         //添加id
         var ext = marker.getExtData()
         document.getElementById("markId").value = ext._geoJsonProperties.gid
         document.getElementById("lnglatData").value = e.lnglat;
         map.add(marker)
 
     })
}


//初始化所有点标注(即获取所有geojson并转化为地图上的点)
function loadMark(map) {
    getData(2).then(result => {

        var geojson = new AMap.GeoJSON({
            geoJSON: null,
        });

        if (result != false) {
            geojson.importData(JSON.parse(result))
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
                        content:`<div style="font-size:13px">名称：${name}<br>一共点击了${click}次<br>关键信息:
                        ${content}</div>`
                    })

                    //打开信息窗
                    infowindow.open(map, item.getPosition())
                    saveData( geojson.toGeoJSON(),2)
                })

            })
            map.add(geojson)
        }
        console.log("初始化数据成功")
    });


}



//提交点信息
function markerSubmit() {

    //获取值
    var name = document.getElementById("markName").value;
    var markerPosition = document.getElementById("markPosition").innerHTML;
    var markerId = document.getElementById("markId").value;
    var content = document.getElementById("markcontent").value;

    //判断是否为空
    if (name == "") {
        alert("请输入标记点名称");
        return
    } else if (markerPosition == "" || markerId == "") {
        alert("请选择标记点");
        return
    }

    //json数据
    var data = {
        "id": markerId,
        "name": name,
        "position": markerPosition,
        "content": content
    }

    //保存到geojson数据表里
    getData(2).then(result => {
        var geojson = new AMap.GeoJSON({
            geoJSON: null,
        });
        console.log(result)
        if (result != false) {
            geojson.importData(JSON.parse(result))
         
            //将字符类型的经纬度转换为LngLat（经纬度）对象
            var strArray = markerPosition.split(","); 
            var numArray = strArray.map(function(strNum) {
                    return parseFloat(strNum); // 使用parseFloat将字符串转换为浮点数
            });
            
            var positiondata = new AMap.LngLat(numArray[0],numArray[1]);

            var markerTemp = new AMap.Marker({
                position: positiondata,
                Image: "http://124.220.42.243:8083/image/DiTu/TuPiao.png",
                extData: {
                    _geoJsonProperties: {
                        gid: markerId,
                        click: 0,
                        name: name,
                        content: content
                    }
                }
            })
            console.log(JSON.stringify(markerTemp.getPosition()))
            //在现有geojson添加marker信息,并保存
            geojson.addOverlay(markerTemp)
            saveData(geojson.toGeoJSON(), 2)
        }
    });


    
   
    //保存到点数据表里---发送请求
    axios.post('http://localhost:8177/marker/saveMarker', data)
        // 请求成功
        .then(function (response) {
            if (response.code == 200) {
                console.log("saveMarker请求成功")
            }
        })
        // 请求失败
        .catch(function (error) {
            console.error('saveMarker请求失败');
        });

}


// 实时汇报下拉框跳转界面
function huiBaoToPage(){
    var selectElement = document.getElementById("huiBaoSelect");
    var selectedValue = selectElement.value;
    
    // Check if a valid option is selected
    if (selectedValue && selectedValue !== "") {
      // Redirect to the selected page
      window.location.href = selectedValue;
    }
}


