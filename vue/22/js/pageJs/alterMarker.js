//js部分---修改标注点
var nowMarkerId;

//获取地图数据---向后端获取数据
function getData(mapId) {
    return new Promise((resolve, reject) => {
        //mapId封装成json
        var data = {
            "mapId": mapId
        };

        axios.post('http://121.37.39.206:8177/map/loadMap', data)
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


//保存标记点数据---向后端发送数据，并保存
function saveMarkerData(markerId) {

    var name,content,click
    if(document.getElementById("markName").value != null){
        name = document.getElementById("markName").value;
    }
    if(document.getElementById("markContent").value != null){
        content = document.getElementById("markContent").value;
    }
    if(document.getElementById("markClick").value != null){
        click = document.getElementById("markClick").value;
    }


    var data = {
        "id":  markerId,
        "name": name,
        "click":click,
        "content":content
    }

    //发送请求
    axios.post('http://121.37.39.206:8177/marker/updateMarker', data)
    // 请求成功
    .then(function (response) {
        console.log("saveMarkerData请求成功")
    })
    // 请求失败
    .catch(function (error) {
        console.error('saveMarkerData请求失败');
    });
    console.log("方法被调用")

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
                        content: `<div style="font-size:13px">名称：${name}<br>一共点击了${click}次<br>关键信息:
                        ${content}</div>`
                    })
                    //打开信息窗
                    infowindow.open(map, item.getPosition())

                    showMarkInformation(markerId)
                    nowMarkerId = markerId;
                    saveData(geojson.toGeoJSON(), 2)
                })

                //标注点绑定鼠标右击事件——弹出右键菜单
                item.on('rightclick', function (e) {

                    var contextMenu = new AMap.ContextMenu();
                    var ext = item.getExtData()
                    var markerId = ext._geoJsonProperties.gid

                    //删除标记点
                    contextMenu.addItem("删除标记点", function () {
                        deleteMarker(markerId)
                    }, 0);

                    contextMenu.open(map, e.lnglat);
                    contextMenuPositon = e.lnglat;
                });

            })
            map.add(geojson)
        }
        console.log("初始化数据成功")
    });

}


//删除标记点
function deleteMarker(markerId) {

    getData(2).then(result => {

        var geojson = new AMap.GeoJSON({
            geoJSON: null,
        });

        if (result != false) {
            //获取数据
            geojson.importData(JSON.parse(result))
            //遍历标记点
            geojson.eachOverlay(function (item) {
                var ext = item.getExtData();
                var gid = ext._geoJsonProperties.gid
                var name = ext._geoJsonProperties.name
                if (gid == markerId) {
                    geojson.removeOverlay(item);

                    var data = {
                        "id": gid
                    }

                    //发送删除点标记请求
                    axios.get('http://121.37.39.206:8177/marker/deleteMarker', data)
                        // 请求成功
                        .then(function (response) {
                            console.log("deleteMarker请求成功")
                        })
                        // 请求失败
                        .catch(function (error) {
                            console.error('deleteMarker请求失败');
                        });

                    console.log("已删除名称为：" + name + "的标记点");
                    return false;
                }
            })
            saveData(geojson.toGeoJSON(), 2)
            location.reload();
        }
    });

}

//展示标记点对应信息
function showMarkInformation(markerId) {

    //根据id获取点数据
    getMarkerData(markerId).then(result => {

        if (result.name != null) {
            document.getElementById("markName").value = result.name;
        }

        if (result.content != null) {
            document.getElementById("markContent").value = result.content;
        }

        document.getElementById("markClick").value = result.click;
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

function markerSubmit(){
    saveMarkerData(nowMarkerId);
    console.log(nowMarkerId)
}