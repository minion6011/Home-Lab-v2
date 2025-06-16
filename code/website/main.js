
// Config
const password = 1234
const custom_website = "https://github.com/minion6011/Home-Lab-v2"

// Password
if (prompt('Password: ','')==password) {alert('Correct Password') }
else { window.location=""}


// OpenPage (navbar_buttons)
const iframe_container = document.getElementById("iframe_container");
const iframe_element = document.getElementById("iframe_element");
const iframe_name = document.getElementById("iframe_title");

function OpenPage(element) {
    iframe_container.style.display = "flex";

    window.scrollTo({top: document.body.scrollHeight,behavior: 'smooth'});

    if (element == "music") {
        iframe_name.textContent = "Music Player";
        iframe_element.src = "/music";
    }
    else if (element == "custom") {
        iframe_name.textContent = "Custom Page";
        iframe_element.src = custom_website;
    }
    else if (element == "cloud") {
        iframe_name.textContent = "Cloud";
        iframe_element.src = `/login`;
    }
    else if (element == "ai") {
        iframe_name.textContent = "AI Chat";
        iframe_element.src = "http://ai.homelab-coso.playit.plus:18993/";
    }
};


/* Stats (all page) */
async function StatsUpdate() {
    var stats_res = await fetch(`/stats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    /* API */
    var stats_json = JSON.parse(await stats_res.text());
    /* Update Stats Ui */
    /* CPU */
    if (String(stats_json.cpu) == "??") {
        document.getElementById("stats_cpu").style.width = "0%";
        document.getElementById("stats_cpu_text").innerHTML = "??";
    }
    else {
        document.getElementById("stats_cpu").style.width = `${stats_json.cpu}%`;
        document.getElementById("stats_cpu_text").innerHTML = `${stats_json.cpu}%`;
    }
    /* RAM */
    document.getElementById("stats_ram").style.width = `${stats_json.ram}%`;
    document.getElementById("stats_ram_text").innerHTML = `${stats_json.ram}%`;
    /* Disk 1-2 */
    document.getElementById("stats_disk1").style.width = `${stats_json.disk_1}%`;
    document.getElementById("stats_disk1_text").innerHTML = `${stats_json.disk_1}%`;
    document.getElementById("stats_disk2").style.width = `${stats_json.disk_2}%`;
    document.getElementById("stats_disk2_text").innerHTML = `${stats_json.disk_2}%`;
    
}
StatsUpdate()
setInterval(StatsUpdate, 15000); /* Ogni 15 secondi */


/* ESP32 Stats */
async function Esp32StatsUpdate() {
    var esp_res = await fetch(`/esp_stats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body:  JSON.stringify({type: 'get'}),
    });
    /* API */
    var esp_json = JSON.parse(await esp_res.text());
    if (String(esp_json.temperature) == "??" || String(esp_json.humidity) == "??") {
        document.getElementById("esp32_tem").innerHTML = `??°`;
        document.getElementById("esp32_hum").innerHTML = `??%`;
    }
    else {
        document.getElementById("esp32_tem").innerHTML = `${esp_json.temperature}°`;
        document.getElementById("esp32_hum").innerHTML = `${esp_json.humidity}%`;
    }
}
Esp32StatsUpdate()
setInterval(Esp32StatsUpdate, 20000); /* Ogni 20 secondi */


/* Command sender */
async function SendCommand() {
    var cmd_comm = document.getElementById("cmd_input");
    await fetch(`/send_command`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body:  JSON.stringify({command: cmd_comm.value}),
    });
    cmd_comm.value = "";
}


/* Shutdown */
async function shutdown(self) {
    self.innerHTML = "Site Offline"
    await fetch(`/shutdown`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
}

/* API Request */

const api_link = document.getElementById("req_url");
const api_type = document.getElementById("req_type");
const api_json = document.getElementById("req_json");
const api_header = document.getElementById("req_header");

async function send_request() {
    try {
        if (String(api_type.value) !== "GET" && String(api_type.value) !== "HEAD") {
            var req_res = await fetch(String(api_link.value), {
                method: String(api_type.value),
                headers: JSON.parse(api_header.value),
                body: api_json.value
            });     
        }
        else {
            var req_res = await fetch(String(api_link.value), {
                method: String(api_type.value),
                headers: JSON.parse(api_header.value),
        });
        }
        /* Response */
        var req_json = await req_res.text();
        document.getElementById("api-popup").style.display = 'flex';
        document.getElementById("api-response").innerHTML = `${req_json} <br>Code: [${req_res.status}]`;
    } catch (error) {
        document.getElementById("api-popup").style.display = 'flex';
        document.getElementById("api-response").innerHTML = `Error: ${error}`;
        console.log(error)
    }
}

function close_popup() {
    document.getElementById("api-popup").style.display = 'none';
}

