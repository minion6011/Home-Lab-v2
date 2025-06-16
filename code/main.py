# - Imports
from flask import Flask, render_template, request, redirect, send_from_directory, send_file
from markupsafe import Markup
import platform # Per riconoscere il sistema operativo
import psutil
import os
import json
import signal
import shutil

from api import CloudAPI, MusicApi

app = Flask(__name__, static_folder="website", template_folder="website")

global esp32_data
esp32_data = {"temperature": "??", "humidity":"??"}

PID = os.getpid()
# - Config

with open("app_config.json") as f:
	data_config = json.load(f)

# - Code

@app.route('/')
def index():
	return render_template("index.html")

# - API
@app.route('/stats', methods=['POST'])
def system_stats():
	disk_1 = psutil.disk_usage(data_config["disk_1_path"]).percent
	disk_2 = psutil.disk_usage(data_config["disk_2_path"]).percent
	if "Windows" in platform.system():
		cpu = "??"
		ram = round(psutil.virtual_memory().percent, 1)
	else:
		from gpiozero import CPUTemperature
		try: cpu = int(CPUTemperature().temperature)
		except: cpu = "??"
		ram = round(int(psutil.virtual_memory().used / 1083692.37333) / 7809 * 100, 1)
	return {"ram":ram,"disk_1":disk_1,"disk_2":disk_2,"cpu":cpu}, 200

@app.route('/esp_stats', methods=['POST'])
def esp32_stats():
	if "type" in request.json:
		global esp32_data
		req_type = request.json["type"]
		if req_type == "get":
			return {"temperature": esp32_data["temperature"], "humidity": esp32_data["humidity"]}, 200
		else:
			esp32_data = request.get_json(force=True)
			return {}, 200
	else:
		return "Bad Request", 400

@app.route('/send_command', methods=['POST'])
def exec_command():
	if "command" in request.json:
		command = request.json["command"]
		os.system(str(command))
		return {}, 200
	else:
		return "Bad Request", 400

@app.route('/shutdown', methods=['POST'])
def shutdown():
	os.kill(PID, signal.SIGINT)

# - Cloud

@app.route('/login')
@app.route('/login/<status>')
def cloud_login(status=" "):
	if not status == " ":
		status = '<p class="response-password" id="response-login">Wrong Password</p>'
	return render_template("login.html", status=Markup(status))

@app.route('/cloud', methods=['POST', 'GET'])
def cloud():
	if request.method == "POST":
		if "username" in request.form and "password" in request.form:
			user_name = str(request.form["username"])
			password = str(request.form["password"])
			path = str(request.form["path"])
			back_path = str(request.form["back_path"])

			data = CloudAPI.login_check(user_name, password)

			if path == "None": path = data["path"]
			if back_path == "None": back_path = data["path"]

			if data["status"]:
				return render_template("user_panel.html", files=CloudAPI.get_files(user_name, password, path), current_path=path, global_path=data["path"], back_path=back_path, username=user_name, password=password)
			else:
				return redirect("/login/fail")
	return redirect("/login")

@app.route('/cloud_api', methods=['POST'])
def api_cloud():
	if request.is_json: # se la richiesta ha dati json
		if "type" in request.json and "username" in request.json and "password" in request.json:
			data = CloudAPI.login_check(request.json["username"], request.json["password"])
			if data["status"]:
				if request.json["type"] == "delete" and "path" in request.json:
					if os.path.isfile(request.json["path"]):
						os.remove(request.json["path"])
					else:
						shutil.rmtree(request.json["path"], ignore_errors=True)
					return "Success", 200
				elif request.json["type"] == "create_folder" and "path" in request.json:
					file_list = CloudAPI.get_files(request.json["username"], request.json["password"], request.json["path"])
					i = 0
					for file in file_list:
						if not os.path.isfile(os.path.join(request.json["path"], file["name"])):
							if "Nuova Cartella" in file["name"]: i = i + 1
					if i == 0: folder_name = "Nuova Cartella"
					else: folder_name = f"Nuova Cartella ({i})"
					os.mkdir(os.path.join(request.json["path"], folder_name))
					return {"name": folder_name}, 200
				elif request.json["type"] == "rename_file" and "path" in request.json and "new_name" in request.json:
					os.rename(os.path.join(request.json["path"], request.json["old_name"]), os.path.join(request.json["path"], request.json["new_name"]))
					return "Success", 200
				elif request.json["type"] == "show_file" and "path" in request.json:
					return send_file(request.json["path"])
	elif "type" in request.form and "username" in request.form and "password" in request.form:
		data = CloudAPI.login_check(request.form["username"], request.form["password"])
		if data["status"]:
			if request.form["type"] == "file_upload" and "path" in request.form:
				file = request.files.get('file')
				if file:
					if not file.filename in os.listdir(request.form["path"]):
						file.save(os.path.join(request.form["path"], file.filename))
						return "Success", 200
					else:
						return "Already Exixsting File", 409
				else:
					return "No file", 400
			elif request.form["type"] == "file_download" and "path" in request.form:
				return send_from_directory(request.form["path"], request.form["filename"], as_attachment=True), 200
	return "Error", 400

# - Music

@app.route('/music')
def music():
	with open("music.json") as f:
		data_song = json.load(f)
	return render_template("music.html", songs_dict=data_song)

@app.route('/music_api', methods=['POST'])
def api_music():
	if request.is_json: # se la richiesta ha dati json
		if "type" in request.json:
			if request.json["type"] == "add" and "url" in request.json:
				return MusicApi.add_song(request.json["url"])
			
			elif request.json["type"] == "remove" and "song_name" in request.json:
				return MusicApi.remove_song(request.json["song_name"])
			
			elif request.json["type"] == "get" and "song_name" in request.json:
				with open("music.json") as f:
					data_song = json.load(f)
				if str(request.json["song_name"]) in data_song:
					return send_file(data_song[str(request.json["song_name"])]["path"], mimetype='audio/mpeg'), 200
				return "No file found", 404
			elif request.json["type"] == "random":
				with open("music.json") as f:
					data_song = json.load(f)
				song = MusicApi.random_song()
				return {"song_name": song, "ico": data_song[song]["ico"]}, 200
	return "Error", 400


app.run(host="0.0.0.0", debug=False)
