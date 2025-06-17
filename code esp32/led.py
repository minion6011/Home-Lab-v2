from machine import Pin
import network
import urequests as requests
import time

temperature_url = "http://209.25.141.16:3164/esp_stats"
Wifi_Data = [
    {"SSID":"", "Password": ""},
    ]


wlan = network.WLAN(network.WLAN.IF_STA)
wlan.active(True)

led_red = Pin(18, Pin.OUT)
led_yellow = Pin(19, Pin.OUT)
led_green = Pin(21, Pin.OUT)


def do_connect():
    if not wlan.isconnected():
        print('Connecting to network...')
        for data in Wifi_Data:
            try:
                wlan.connect(data['SSID'], data['Password'])
                while not wlan.isconnected():
                    pass
                print("Connected")
            except:
                print("Undefined wifi")
    print('network config:', wlan.ipconfig('addr4'))


def data_get():
    try:
        r = requests.post(temperature_url, json={"type":"get"})
        print(r.status_code)
        return int(r.json()["temperature"])
    except Exception as e:
        print("Request Error: 'data_send()'")
        print(e)


def turn_led(temp):
    if temp >= 35:
        led_red.value(1)
        # - Turn off
        led_yellow.value(0)
        led_green.value(0)
    elif temp >= 30 and temp <= 35:
        led_yellow.value(1)
        # - Turn off
        led_red.value(0)
        led_green.value(0)
    elif temp <= 30:
        led_green.value(1)
        # - Turn off
        led_yellow.value(0)
        led_red.value(0)



while True:
    if wlan.isconnected():
        turn_led(data_get())
    else:
        do_connect()
    time.sleep(15)
