//标签按钮
var tab1 = document.getElementById('li-experience-choose1');
var tab2 = document.getElementById('li-experience-choose2');
var tab3 = document.getElementById('li-experience-choose3');

//经历页面
var exp1 = document.getElementById('expreience1');
var exp2 = document.getElementById('expreience2');
var exp3 = document.getElementById('expreience3');

//项目右图
var projectPicture = document.querySelectorAll('.proj-picture');

var messageInput = document.getElementById('message-input');
var nameInput = document.getElementById('name-input');
var inputSubmit = document.getElementById('message-submit');

tab1.addEventListener('click', function() {
    //隐藏页面2，3
    exp2.style.display = 'none';
    exp3.style.display = 'none';
    //显示页面1
    exp1.style.display = 'initial';

    //改变下划线
    tab1.style.borderBottom = '0px solid gray';
    tab2.style.borderBottom = '1px solid gray';
    tab3.style.borderBottom = '1px solid gray';
});

tab2.addEventListener('click', function() {
    //隐藏页面2，3
    exp1.style.display = 'none';
    exp3.style.display = 'none';
    //显示页面1
    exp2.style.display = 'initial';

    //改变下划线
    tab1.style.borderBottom = '1px solid gray';
    tab2.style.borderBottom = '0px solid gray';
    tab3.style.borderBottom = '1px solid gray';
});

tab3.addEventListener('click', function() {
    //隐藏页面2，3
    exp1.style.display = 'none';
    exp2.style.display = 'none';
    //显示页面1
    exp3.style.display = 'initial';

    //改变下划线
    tab1.style.borderBottom = '1px solid gray';
    tab2.style.borderBottom = '1px solid gray';
    tab3.style.borderBottom = '0px solid gray';
});

function Initialize() {
    //隐藏页面2，3
    exp2.style.display = 'none';
    exp3.style.display = 'none';
    //显示页面1
    exp1.style.display = 'initial';

    //改变下划线
    tab1.style.borderBottom = '0px solid gray';
    tab2.style.borderBottom = '1px solid gray';
    tab3.style.borderBottom = '1px solid gray';
}

function pictureDisappear() {
    var width = document.body.clientWidth;
    var i = 0;
    width /= 10;
    for (i = 0; i < projectPicture.length; i++) {
        projectPicture[i].style['width'] = width + 'px';
        projectPicture[i].style['height'] = width + 'px';
        if (width < 80)
            projectPicture[i].className = 'block-hidden';
        if (width > 80)
            projectPicture[i].className = 'proj-picture';

    }
}

//♥
var redHeart = [];
var flyHeart = [];
var redHeartBox = document.querySelectorAll('.redheart-box');

function set(numBox) {
    console.log(numBox);
    i = numBox.getAttribute('id').slice(3) - 1;
    console.log(i);
    if (redHeart[i].getAttribute('class') === 'redHeart') {
        redHeart[i].setAttribute('class', 'redHeartChecked');
        flyHeart[i].setAttribute('class', 'flyHeartChecked');
    } else {
        redHeart[i].setAttribute('class', 'redHeart');
        flyHeart[i].setAttribute('class', 'flyHeart');
    }
}

for (i = 0; i < 8; i++) {
    var j = i + 1;
    redHeart.push(document.getElementById('redheart' + j));
    flyHeart.push(document.getElementById('flyheart' + j));
}
for (var i = 0; i < 8; i++) {
    redHeartBox[i].addEventListener('click', function() {
        set(this)
    });
}



Initialize();

setInterval(pictureDisappear, 10);