(function() {
    // 獲取 API 資料

    // 使用 new XMLHttpRequest(); 取得 API
    // get 讀取資料
    // send() 送出連線
    // onload() xhr 其中一個事件 onload，當確定資料有回傳時，就執行 function

    var xhr = new XMLHttpRequest();
    xhr.open(
        'get',
        'https://opendata.cwb.gov.tw/api/v1/rest/datastore/O-A0003-001?Authorization=CWB-08B59C01-5D51-4140-8EDB-8A3C74A2CC80&format=JSON',
        true
    );
    xhr.send(null);
    xhr.onload = function() {
        // 滿足兩者條件 - readyState == 4: 請求已完成，且響應已就緒 
        // status == 200: 交易成功
        var loader = document.querySelector('.loader');
        if (xhr.readyState == 4 && xhr.status == 200) {
            loader.style.display = 'none';
            console.log('成功讀取資料');
            xhrData();
        } else {
            loader.style.display = 'block';
            console.log('資料錯誤!!');
        }
    };

    function xhrData() {
        // 資料設定

        // xhr.responseText 獲得字符串形式的響應數據。
        // JSON.parse 將 string 轉 object，方便撈取資料。
        // 先撈出各區域的值並加入空陣列中，用 forEach 去判斷陣列裡面所有值是否有吻合

        var dataStr = JSON.parse(xhr.responseText);
        var data = dataStr.records.location;

        var btnZone = document.querySelector('.hot-zone');
        var infoContent = document.querySelector('.info');
        var selection = document.querySelector('#zone');


        /*---------- 撈出過濾為區域陣列  ----------*/
        var selectList = [];
        for (var i = 0; i < data.length; i++) {
            var selectZone = data[i].locationName;
            selectList.push(selectZone);
        }

        /*----------  篩選重複區域  ----------*/
        // 用 forEach() 去判斷陣列裡面所有值是否有吻合
        // indexOf() 會回傳 陣列中第一個被找到索引，若不存在於陣列中則回傳 -1
        var selected = [];
        selectList.forEach(function(value) {
            if (selected.indexOf(value) == -1) {
                selected.push(value);
            }
        });

        for (var i = 0; i < selected.length; i++) {
            var option = document.createElement('option');
            option.textContent = selected[i];
            selection.appendChild(option);
        }

        btnZone.addEventListener('click', hotZone);
        selection.addEventListener('change', selectedList);

        function hotZone(e) {
            // 高海拔氣象站
            if (e.target.nodeName == 'BUTTON') {
                // e.target.nodeName 點擊判斷 HTML button 的屬性，符合才執行。
                queryZone(e.target.textContent);
                renderContent();
            }
        }

        function selectedList(e) {
            // 下拉選單
            var value = e.target.value;
            queryZone(value);
            renderContent();
        }

        function queryZone(zoneName) {
            selected = [];
            for (var i = 0; i < data.length; i++) {
                if (data[i].locationName === zoneName) {
                    selected.push(data[i]);
                }
            }
        }

        function renderContent() {

            $('html,body').animate({ scrollTop: $('.zone-name').offset().top }, 1000);
            // 點選氣象站，畫面向下移動

            var tempHTML = ``;
            for (var i = 0; i < selected.length; i++) {
                tempHTML +=
                    `<li class="item" data-id="${selected[i].stationId}">
                        <div class="title-wrap">
                        <p class="name">${selected[i].locationName}</p>
                        </div>
                         <div class="content-wrap">
                            <p class="temperature"><i class="fas fa-thermometer-three-quarters"></i>溫度(攝氏): ${selected[i].weatherElement[3].elementValue}</p>               
                            <p class="Rain"><i class="fas fa-umbrella"></i>日累積雨量: ${selected[i].weatherElement[6].elementValue}</p>
                            <p class="UVI"><i class="fas fa-sun"></i>每小時紫外線指數: ${selected[i].weatherElement[13].elementValue}</p>
                            <p class="Time"><i class="far fa-clock"></i>觀測資料時間: ${selected[i].time.obsTime}</p>
                            <br>
                            <p><i class="far fa-clipboard"></i>負值或斜線(/)皆表示「該時刻因故無資料」</p>
                            <br>
                            <p class="detail">
                                <button class="btn-detail" value="詳細資料">詳細資料</button>
                            </p>

                        </div>
                    </li>`;
            }
            infoContent.innerHTML = tempHTML;

            CardModelAddEventListenClick();
        }

        function CardModelAddEventListenClick(e) {
            let btndetail = document.querySelector('.btn-detail');
            btndetail.addEventListener('click', function(e) {

                for (let i = 0; i < e.path.length; i++) {
                    let elementClassName = e.path[i].className;
                    if (elementClassName === "item") {
                        let cardModel = e.path[i];
                        renderModal(cardModel.dataset.id);
                    }
                }
            }, false);
        }

        function renderModal(cardModelId) {
            for (let i = 0; i < data.length; i++) {
                if (data[i].stationId === cardModelId) {

                    let modalContent =
                        `<div class="modal-body">
                            <h3>詳細資料</h3>
                        
                            <p class="location"><i class="fas fa-map-marker-alt"></i> 觀測站位置: ${data[i].parameter[0].parameterValue}-${data[i].parameter[2].parameterValue}</p>
                            <p class="wind"><i class="fas fa-wind"></i>每小時最大陣風風速: ${data[i].weatherElement[7].elementValue} 公尺/秒</p>
                            <p class="high"><i class="fas fa-temperature-high"></i>本日最高溫(攝氏): ${data[i].weatherElement[14].elementValue}</p>
                            <p class="low"><i class="fas fa-temperature-low"></i>本日最低溫(攝氏): ${data[i].weatherElement[16].elementValue}</p>
                            <br>
                            <div id="map"></div>
                            </div>
 
                        <div class="modal-footer">
                            <button class="modal-btn-close">關閉</button>
                        </div>`;

                    let modal = document.querySelector('.modal');
                    modal.innerHTML = modalContent;

                    let modalEl = document.querySelector('.modal-el');
                    modalEl.classList.add('show');

                    let modalBtnClose = document.querySelector('.modal-btn-close');

                    modalBtnClose.addEventListener('click', function() {
                        modalEl.classList.remove('show').add('hide');
                    }, false);

                    // 顯示 Google Map
                    initMap(data[i].lon, data[i].lat, data[i].locationName);

                }
            }
        }

        // 初始化 google map

        function initMap(px, py, name) {

            let centerXY = {
                lat: parseFloat(py),
                lng: parseFloat(px)
            }

            // 設定 center 軸心與 zoom 遠近縮距
            let map = new google.maps.Map(document.getElementById('map'), {
                zoom: 12, //放大的倍率
                center: centerXY //初始化的地圖中心位置
            });

            // 標記座標
            let marker = new google.maps.Marker({
                position: centerXY,
                title: name,
                map: map,
            });
        }


        $('#goTop').click(function() {
            $('html,body').animate({
                    scrollTop: 0
                },
                800
            );
            return false;
        });

    }
})();