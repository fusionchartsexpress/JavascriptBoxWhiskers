// src/index.js

const myDiv = document.createElement('div');
myDiv.id = 'chart-container';
document.body.appendChild( myDiv )

// Include the core fusioncharts file from core
import FusionCharts from 'fusioncharts/core';

// Include the chart from viz folder
// E.g. - import ChartType from fusioncharts/viz/[ChartType]
import Boxandwhisker2d from 'fusioncharts/viz/boxandwhisker2d';

// Include the fusion theme
import FusionTheme from 'fusioncharts/themes/es/fusioncharts.theme.fusion';


async function main() {
    //Get the data
    let response = await fetch('/mlRepo');
    let data = await response.text();
    if (response.ok){        
        renderPage(data);
    }
    else {
        alert('Error reading data from ML repository');
    }
}

//renders the html page when passed data as csv-text
function renderPage(csvText){
    var irisHeader = ['Sepal-length','Sepal-width','Petal-length','Petal-width','Class']; 
    var matrix = csvToMatrix(csvText,',');
    var dataset = constructDatasetJson(matrix);
    var jsonArr = constructDataSource(dataset,irisHeader);
    renderChart(jsonArr);
}

//convert csv text to matrix
function csvToMatrix(csvText,sep=','){
    var matrix = [];
    var rows = csvText.split("\n");
    for(var i=0;i<rows.length;i++){
        var cols = rows[i].split(sep);
        if (cols.length > 1)
        matrix.push(cols);
    }
    return matrix;
}

//helper function to get unique items in array
function unique(value, index, self){
    return self.indexOf(value) === index;
}

//returns JSON text for 'dataset' key 
function constructDatasetJson(matrix){
    var cols = matrix[0].length;
    //find the unique classes (iris species)
    var classes = matrix.map(function(value,index) {return value[cols-1];});
    classes = classes.filter(unique);
    //JSON for dataset
    var dataset = [];
    
    for (var k=0;k<classes.length;++k)
    {
        var className = classes[k];        
        var seriesObj = {"seriesname":className};
        var obj = [];
        for (var j=0;j<cols-1;++j)
        {
            var subset = matrix.filter(r=>r[cols-1].match(className));
            var col = subset.map(function(value,index) {return parseFloat(value[j],10);});             
            var valObj = {"value":col.toString()};
            obj.push(valObj);
        }
        seriesObj.data = obj;
        dataset.push(seriesObj);
    }
    return dataset;
}

//constructs JSON text for 'dataSource' key
function constructDataSource(dataset,heads){
    var category = [];
    for (var i=0;i<heads.length-1;++i){
        category.push({"label":heads[i]});
    }
    var categories = [{"category": category}];
    var JsonArr = {"chart": {
        "caption": "Iris Dataset: Distribution of Attribute Values By Species",
        "subcaption": "Data Source: UCI Machine Learning Repository",
        "xAxisName": "Attributes",
        "YAxisName": "Length/Width",
        "numberPrefix": "",
        "theme": "fusion"
    }, 
    categories, dataset};    
    return JsonArr;
}

// Draw the chart
function renderChart(dataSrc){

    FusionCharts.addDep(Boxandwhisker2d);
    FusionCharts.addDep(FusionTheme);

    //Chart Configurations
    const chartConfig = {
        type: 'boxandwhisker2d',
        renderAt: 'chart-container',
        width: '80%',
        height: '600',
        dataFormat: 'json',
        dataSource: dataSrc
    }

    //Create an Instance with chart options and render the chart
    var chartInstance = new FusionCharts(chartConfig);
    chartInstance.render();
}

//Call main method
main();
