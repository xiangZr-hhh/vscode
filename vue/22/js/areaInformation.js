//全局变量marker---区域点,map---地图 ,judgeClick判断是否需要点击
var marker, map;
var judgeClick = true;
//froalaEditor文本编辑器
var froalaEditor;

function edit() {
    //设置界面预览
    $('#edit').on('froalaEditor.contentChanged froalaEditor.initialized', function (e, editor) {
        $('#preview').html(editor.html.get());
        froalaEditor = editor;
    }).froalaEditor({
        imageUploadURL: 'http://121.37.39.206:8177/marker/saveReportFile',
        videoUploadURL: 'http://121.37.39.206:8177/marker/saveReportFile',
        fileUploadURL: 'http://121.37.39.206:8177/marker/saveReportFile',
        imageUploadMethod: 'POST',
        videoUploadMethod: 'POST',
        fileUploadMethod: 'POST',
        language: 'zh_cn', // 设置语言为中文
    });
};

//初始化界面
function initArea() {
    getAllArea().then(result => {

        //初始化富文本编辑器
        edit();

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
                document.getElementById("areaName").value = item.areaName
                document.getElementById("areaPosition").innerHTML = item.areaPosition
                document.getElementById("areaInformation").innerHTML = item.content
            }
        });

        //初始化其他方法

        createMap();
    })

}

//保存区域信息
function saveAreaInformation() {

    judgeClick = false

    var areaId = document.getElementById("areaSelect").value;
    var editorContent = $('#edit').froalaEditor('html.get', true);
    var areaPosition = document.getElementById("areaPosition").innerHTML;
    var areaName = document.getElementById("areaName").value

    //如果用户未编辑，更新内容数据为原来的数据
    if (editorContent == "") {
        editorContent = document.getElementById("areaInformation").innerHTML;
    }

    //区域名称不能为空
    if (areaName != null) {

        //mapId封装成json
        var data = {
            "areaId": areaId,
            "areaName": areaName,
            "content": editorContent,
            "areaPosition": areaPosition
        };

        //发送请求，保存区域数据
        axios.post('http://121.37.39.206:8177/area/saveAreaInformation', data)

        //显示提示框
        textShow("保存成功",1500)

    } else if (areaName == null) {
        window.alert("区域名称不能为空");
    }

}

//提示框
function textShow(text,time){
    var dialog = document.createElement("div");
    dialog.className = "dialog";
    dialog.innerHTML = text;
    document.body.appendChild(dialog);
    setTimeout(function() {
      dialog.style.display = "none";
      doSomethingElse();
    }, time); 
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
        document.getElementById("areaName").value = result.areaName;
        document.getElementById("areaPosition").innerHTML = result.areaPosition;
        document.getElementById("areaInformation").innerHTML = result.content;

        var strArray = result.areaPosition.split(",");
        var numArray = strArray.map(function (strNum) {
            return parseFloat(strNum); // 使用parseInt将字符串转换为浮点数
        });
        var positiondata = new AMap.LngLat(numArray[0], numArray[1]);
        map.setCenter(positiondata);
        map.remove(marker);
        //显示区域标注点
        marker = new AMap.Marker({
            position: positiondata,
            Image: "http://124.220.42.243:8083/image/DiTu/TuPiao.png",
        })
        map.add(marker)
    })

}


//更新当前信息数据
function updateArea() {

    
    //从选择框中获取areaId
    var areaId = document.getElementById("areaSelect").value;

    //获取地区信息
    getAreaInformation(areaId).then(result => {
        //清空编辑器
        froalaEditor.html.set('');
        $('#preview').html('');
        //根据返回的地区信息更新内容
        document.getElementById("areaName").value = result.areaName;
        document.getElementById("areaPosition").innerHTML = result.areaPosition;
        document.getElementById("areaInformation").innerHTML = result.content;

        var strArray = result.areaPosition.split(",");
        var numArray = strArray.map(function (strNum) {
            return parseFloat(strNum); // 使用parseInt将字符串转换为浮点数
        });
        var positiondata = new AMap.LngLat(numArray[0], numArray[1]);
        map.setCenter(positiondata);
        map.remove(marker);
        //显示区域标注点
        marker = new AMap.Marker({
            position: positiondata,
            Image: "http://124.220.42.243:8083/image/DiTu/TuPiao.png",
        })
        map.add(marker)
    })

}


function createMap() {

    //获取position数据并装换格式
    var markposition = document.getElementById("areaPosition").innerHTML
    var strArray = markposition.split(",");
    var numArray = strArray.map(function (strNum) {
        return parseFloat(strNum); // 使用parseInt将字符串转换为浮点数
    });
    var positiondata = new AMap.LngLat(numArray[0], numArray[1]);


    //初始化地图
    map = new AMap.Map('map1', {
        viewMode: '3D',  // 默认使用 2D 模式
        zoom: 16,  //初始化地图层级
        pitch: 30,
        center: positiondata  //初始化地图中心点
    });

    //显示区域标注点
    marker = new AMap.Marker({
        position: positiondata,
        Image: "http://124.220.42.243:8083/image/DiTu/TuPiao.png",
    })
    map.add(marker)

}


//取消当前数据
function cancelAreaInformation() {
    updateArea();
}


//选择标注点
function toSelectPosition() {
    judgeClick = true
    map.on('click', function (e) {
        //如果还未点击保存
        if (judgeClick == true) {
            //如果标注点存在
            if (marker != null) {
                //移除该点
                map.remove(marker);
                marker = new AMap.Marker({
                    position: e.lnglat,
                    Image: "http://124.220.42.243:8083/image/DiTu/TuPiao.png",
                })
                map.add(marker)
                document.getElementById("areaPosition").innerHTML = e.lnglat
            }
        }
    })

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