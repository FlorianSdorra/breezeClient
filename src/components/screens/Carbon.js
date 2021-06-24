import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const socket = io("http://localhost:5000", {
  transports: ["websocket", "polling"],
});

const Carbon = () => {
  const [data, setData] = useState([]);
  const [incomingData, setIncomingData] = useState([]);
  const [highestVal, setHighestVal] = useState([]);
  const [lowestVal, setLowestValue] =useState([]);
  const [meanVal, setMeanVal] = useState({});
  const [firstEntry, setFirstEntry] =useState([]);
  const [lastEntry, setLastEntry] = useState([]);



  const mainCall = () => {
    socket.on("dataHistory", (arg) => {
      // console.log("data history received", arg);
      setData(arg.reverse());
    });
  };

  const setUpSocket = () => {
    socket.on("newData", (arg) => {
      // console.log("new data  received", arg);
      setIncomingData([arg]);
    });
  };

  const updateData = () => {
    setData([...data, ...incomingData]);
  };

  const setOther = () => {
      socket.on("highestValue", (arg) => {
        // console.log("highest value", arg);
        setHighestVal(arg);
      });

      socket.on("lowestValue", (arg)=>{
        setLowestValue(arg)
      })

      socket.on("meanVal", (arg)=>{
        setMeanVal(arg)
      })

      socket.on("firstRecord", (arg)=>{
        setFirstEntry(arg)
      })

      socket.on("lastRecord", (arg)=>{
        setLastEntry(arg)
      })

  }
  setOther()
  useEffect(mainCall, []);
  useEffect(setUpSocket, []);
  useEffect(updateData, [incomingData]);
  

  const options = {
    chart: {
      
    },
    xAxis: {
      categories: (function () {
        if (data) {
          let steve = data.map((item) => 
          {
          return [item.time]});
          // console.log("DATA FOR THE X", steve)
          return steve;
        }
      })()
    },
    yAxis: {
      title: {
        text: 'co2 in ppm'
    },
      categories: (function () {
        if (data) {
          let steve = data.map((item) => 
          {
          return [item.value]});
          // console.log("DATA FOR THE y", steve)
          return steve;
        }
      })()
    },title: {
      text: 'CO2 data sets in 10 sec range starting with the 50 latest'
  },
    series: [
      {
        name: "date/co2 in ppm",
        data: (function () {
          if (data) {
            let steve = data.map((item) => 
            {
            return [item.time, item.value]});
            // console.log("DATA FOR GRAPH", steve)
            return steve;
          }
        })(),zIndex: 1,
        marker: {
            fillColor: 'white',
            lineWidth: 2,
            lineColor: Highcharts.getOptions().colors[1]
        },zones: [
          { value: 1000, color: 'green' },
          { value: 2000, color: 'yellow' },
          { value: 4000, color: 'red' }
        ],
      
    },
    ],
  };
  // console.log("FINAL DATA", data);

  const meanBg = () =>{
      if (meanVal.mean<=1000){
        return {backgroundColor:"green"}
      }
      else if (meanVal.mean>1000 && meanVal.mean < 2000){
        return {backgroundColor:"yellow"}
      }
      else if (meanVal.mean>2000){
        return {backgroundColor:"red"}
      }
  }

  const highValBg = () =>{
    if (highestVal[0].value<=1000){
      return {backgroundColor:"green"}
    }
    else if (highestVal[0].value>1000 && highestVal[0].value<2000){
      return {backgroundColor:"yellow"}
    }
    else if (highestVal[0].value<3500){
      return {backgroundColor:"red"}
    }
}

const lowValBg = () =>{
  if (lowestVal[0].value<=1000){
    return {backgroundColor:"green"}
  }
  else if (lowestVal[0].value>1000 && lowestVal[0].value<2000){
    return {backgroundColor:"yellow"}
  }
  else if (lowestVal[0].value<3500){
    return {backgroundColor:"red"}
  }
}

  return (
   <div className="screen">
     <h1>Florian Sdorra für BREEZE-TECHNOLOGIES</h1>
     <div className="valChart">
        <div className="chartChild">
          <span>Highest co2 Value:</span>
          <span className="withB" style={highestVal.length>0?highValBg():{}}>{highestVal.length>0?`${highestVal[0].value} ppm`:"loading"}</span>
          <span>measured at</span>
          <span className="withB">{highestVal.length>0?highestVal[0].time:"loading"}</span>
        </div>
        <div className="chartChild">
          <span>C02 mean Value: </span>
          <span className="withB" style={meanVal.mean?meanBg():{}}>{meanVal.mean?`${meanVal.mean} ppm`:"loading"}</span>
          <span>between</span><span className="withB">{firstEntry?firstEntry:"loading"}</span>
          <span>-</span>
          <span className="withB">{lastEntry?lastEntry:"loading"}</span>
        </div>
        <div className="chartChild">
          <span>Lowest CO2 Value</span>
          <span className="withB" style={lowestVal.length>0?lowValBg():{}}>{lowestVal.length>0?`${lowestVal[0].value} ppm`:"loading"}</span>
          <span>measured at</span>
          <span className="withB">{lowestVal.length>0?lowestVal[0].time:"loading"}</span>
        </div>
      </div>
      <div className="mainChart">
        <HighchartsReact
          highcharts={Highcharts}
          cunstructorType={"bar"}
          options={options}
          containerProps={{ style: { height: "90%" } }}
        />
      </div>
    </div>)
  
};

export default Carbon;
