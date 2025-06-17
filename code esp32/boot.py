import time
from machine import I2C, Pin
from I2C_LCD import I2cLcd
import urequests as requests
import network
import dht

# - Mini Config

GPIO_Pin = 25

Wifi_Data = [
    {"SSID":"WINDTRE-749D25", "Password": "2dy7ma6rdskrtfh6"},
    ]


temperature_url = "http://209.25.141.16:3164/esp_stats"
time_url = "https://timeapi.io/api/time/current/zone?timeZone=Europe%2FRome"
# - Code

i2c = I2C(scl=Pin(14), sda=Pin(13), freq=400000)
sensor = dht.DHT11(Pin(GPIO_Pin))
wlan = network.WLAN(network.WLAN.IF_STA)
wlan.active(True)

def temp():
    sensor.measure()
    return sensor.temperature()

def humid():
    sensor.measure()
    return sensor.humidity()

def data_send(data_json: dict):
    try:
        r = requests.post(temperature_url, json=data_json)
        print(r.status_code)
        r.close()
    except Exception as e:
        print("Request Error: 'data_send()'")
        print(e)



        
def get_time():
    try:
        r = requests.get(time_url)
        time_now = f"{r.json()["time"]} {r.json()["date"]}"
        r.close()
        return time_now
    except Exception as e:
        print("Request Error: 'get_time()'")
        print(e)

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


devices = i2c.scan()
if len(devices) == 0:
  print("No i2c device !")
else:
  for device in devices:
    print("I2C addr: "+hex(device))
    lcd = I2cLcd(i2c, device, 2, 16)

lcd.backlight_on()
lcd.move_to(0, 0)
lcd.putstr("Booting...")

time.sleep(1)


while True:
    try:
        data_dht = {"type": "add", "temperature": temp(), "humidity": humid()}
        if wlan.isconnected():
            data_send(data_dht)
            under_line = get_time()
        else:
            under_line = "No Wi-fi"
            do_connect()

        lcd.clear()
        lcd.move_to(0, 0)
        lcd.putstr(f"Tem {data_dht['temperature']}C Umid {data_dht['humidity']}%")
        lcd.move_to(0, 1)
        lcd.putstr(under_line)
        
    except Exception as e:
        #print(e)
        pass
    
    time.sleep(15)
