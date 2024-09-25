/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.92477961550034, "KoPercent": 0.07522038449966095};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.670277619353419, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5872899074830176, 500, 1500, "1.1 - GET - https://www.blazedemo.com/"], "isController": false}, {"data": [0.6961285741251764, 500, 1500, "1.4 - POST - https://www.blazedemo.com/confirmation.php"], "isController": false}, {"data": [0.6969093931090248, 500, 1500, "1.3 - POST - https://www.blazedemo.com/purchase.php"], "isController": false}, {"data": [0.7008791070642852, 500, 1500, "1.2 - POST - https://www.blazedemo.com/reserve.php"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 445358, 335, 0.07522038449966095, 834.2138302219992, 146, 31324, 418.0, 960.0, 1347.9500000000007, 2747.9600000000064, 240.96824914159814, 564.8446589281434, 273.5954977290091], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["1.1 - GET - https://www.blazedemo.com/", 111439, 87, 0.07806961656152693, 954.318999632069, 282, 28568, 675.0, 1715.9000000000015, 2735.9500000000007, 5104.0, 60.29766014410101, 134.5652058253046, 18.0757367476793], "isController": false}, {"data": ["1.4 - POST - https://www.blazedemo.com/confirmation.php", 111251, 88, 0.07910041258056108, 796.2518359385465, 148, 18938, 524.0, 1530.9000000000015, 2486.9500000000007, 4387.900000000016, 60.22832963575316, 139.72531622041936, 130.33849345060023], "isController": false}, {"data": ["1.3 - POST - https://www.blazedemo.com/purchase.php", 111305, 63, 0.056601230852162975, 797.8504918916462, 148, 31324, 533.0, 1545.0, 2584.9500000000007, 4530.850000000024, 60.24846367906171, 151.35197213089054, 77.77332537228685], "isController": false}, {"data": ["1.2 - POST - https://www.blazedemo.com/reserve.php", 111363, 97, 0.08710253854511822, 788.2949094403, 146, 18968, 521.0, 1497.0, 2465.7000000000044, 4607.740000000042, 60.27078910067646, 139.38533007444752, 47.52736333292923], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.blazedemo.com:443 [www.blazedemo.com/142.251.129.147] failed: Connection timed out: connect", 1, 0.29850746268656714, 2.2453846119301776E-4], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.blazedemo.com:443 [www.blazedemo.com/172.217.29.211] failed: Connection timed out: connect", 4, 1.1940298507462686, 8.98153844772071E-4], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.blazedemo.com:443 [www.blazedemo.com/142.250.218.211] failed: Connection timed out: connect", 1, 0.29850746268656714, 2.2453846119301776E-4], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.blazedemo.com:443 [www.blazedemo.com/172.217.29.243] failed: Connection timed out: connect", 1, 0.29850746268656714, 2.2453846119301776E-4], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.blazedemo.com:443 [www.blazedemo.com/142.250.219.19] failed: Connection timed out: connect", 2, 0.5970149253731343, 4.490769223860355E-4], "isController": false}, {"data": ["429/Too Many Requests", 318, 94.92537313432835, 0.07140323065937965], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.blazedemo.com:443 [www.blazedemo.com/142.251.132.19] failed: Connection timed out: connect", 1, 0.29850746268656714, 2.2453846119301776E-4], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond", 7, 2.08955223880597, 0.0015717692283511242], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 445358, 335, "429/Too Many Requests", 318, "Non HTTP response code: java.net.SocketException/Non HTTP response message: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond", 7, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.blazedemo.com:443 [www.blazedemo.com/172.217.29.211] failed: Connection timed out: connect", 4, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.blazedemo.com:443 [www.blazedemo.com/142.250.219.19] failed: Connection timed out: connect", 2, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.blazedemo.com:443 [www.blazedemo.com/142.251.129.147] failed: Connection timed out: connect", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["1.1 - GET - https://www.blazedemo.com/", 111439, 87, "429/Too Many Requests", 76, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.blazedemo.com:443 [www.blazedemo.com/172.217.29.211] failed: Connection timed out: connect", 4, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.blazedemo.com:443 [www.blazedemo.com/142.250.219.19] failed: Connection timed out: connect", 2, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.blazedemo.com:443 [www.blazedemo.com/142.251.129.147] failed: Connection timed out: connect", 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to www.blazedemo.com:443 [www.blazedemo.com/142.250.218.211] failed: Connection timed out: connect", 1], "isController": false}, {"data": ["1.4 - POST - https://www.blazedemo.com/confirmation.php", 111251, 88, "429/Too Many Requests", 84, "Non HTTP response code: java.net.SocketException/Non HTTP response message: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond", 4, "", "", "", "", "", ""], "isController": false}, {"data": ["1.3 - POST - https://www.blazedemo.com/purchase.php", 111305, 63, "429/Too Many Requests", 63, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["1.2 - POST - https://www.blazedemo.com/reserve.php", 111363, 97, "429/Too Many Requests", 95, "Non HTTP response code: java.net.SocketException/Non HTTP response message: A connection attempt failed because the connected party did not properly respond after a period of time, or established connection failed because connected host has failed to respond", 2, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
