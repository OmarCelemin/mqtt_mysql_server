const mqtt = require("mqtt");
const mysql = require("mysql2");

const client = mqtt.connect("mqtt://zephyr.proxy.rlwy.net:41989");

const db = mysql.createConnection({
    host: "TU_HOST",
    user: "TU_USER",
    password: "TU_PASSWORD",
    database: "railway"
});

client.on("connect", () => {
    console.log("MQTT conectado");

    client.subscribe("estationESP32C6/temperature");
    client.subscribe("estationESP32C6/humidity");
});

let temperature = null;
let humidity = null;

client.on("message", (topic, message) => {

    if(topic === "estationESP32C6/temperature")
    {
        temperature = parseFloat(message.toString());
    }

    if(topic === "estationESP32C6/humidity")
    {
        humidity = parseFloat(message.toString());
    }

    if(temperature !== null && humidity !== null)
    {
        db.query(
            "INSERT INTO dht11_data (temperature, humidity) VALUES (?, ?)",
            [temperature, humidity],
            (err) => {
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    console.log("Datos guardados");
                }
            }
        );

        temperature = null;
        humidity = null;
    }
});