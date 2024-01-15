//从localStorage中获取数据
function getData(){
    //如果本地localStorage中不存在数据
    if(!localStorage.getItem("geojson")){
        localStorage.setItem('geojson','[]')
    }

    return JSON.parse(localStorage.getItem('geojson'))
}

function saveData(data){
    localStorage.setItem('geojson',JSON.stringify(data))
}