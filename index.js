process.env.TZ = "America/Bogota";
const mqtt = require("mqtt");
const mysql = require("mysql2");

const client = mqtt.connect("mqtt://zephyr.proxy.rlwy.net:41989");

const db = mysql.createConnection({
    host: "mysql.railway.internal",
    user: "root",
    password: "rBUvZvahccWPhHUTLrIYLVcdfqegnKNF",
    database: "railway"
});

client.on("connect", () => {
    console.log("MQTT conectado");

    client.subscribe("stationESP32C6/temperature");
    client.subscribe("stationESP32C6/humidity");
    client.subscribe("stationESP32C6/fanStatus");
});

let temperature = null;
let humidity = null;
let fanStatus = null;

client.on("message", (topic, message) => {

    if(topic === "stationESP32C6/temperature")
    {
        temperature = parseFloat(message.toString());
    }

    if(topic === "stationESP32C6/humidity")
    {
        humidity = parseFloat(message.toString());
    }

    if(topic === "stationESP32C6/fanStatus")
    {
        fanStatus = parseInt(message.toString());
    }

    if(temperature !== null &&
       humidity !== null &&
       fanStatus !== null)
    {
        db.query(
            "INSERT INTO dht11_data (temperature, humidity, fanStatus) VALUES (?, ?, ?)",
            [temperature, humidity, fanStatus],
            (err) => {

                if(err)
                {
                    console.log("INSERT ERROR", err);
                }
                else
                {
                    console.log("Datos guardados");
                }
            }
        );

        temperature = null;
        humidity = null;
        fanStatus = null;
    }
});
