import json
import os
import random
import re
# - Music
import pytubefix
from pytubefix.cli import on_progress

with open("users.json") as f:
	data_users = json.load(f)

with open("app_config.json") as f:
	data_config = json.load(f)

img_ext = ('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp', '.ico', '.gif')
video_ext = ('.webm', '.mkv', '.vob', '.ogv', '.gifv', '.mng', '.mov', '.avi', '.amv', '.mp4', '.m4p', '.m4v', '.mpg', '.mp2', '.mpeg', '.mpe', '.mpv', '.m4v', '.svi')
audio_ext = ('.mp3', '.flac', '.aac', '.ogg', '.wav')
editor_ext = ('.txt', '.py', '.js', '.bat', ".json", ".css", ".xml", ".html")

class CloudAPI():
	def login_check(user_name, password):
		if user_name in data_users and password == data_users[user_name]["password"]:
			return {"status":True, "path": data_users[user_name]["path"]}
		return {"status":False}
	def get_files(user_name, password, path):
		# - Internal Function
		def type_file(filename, req_type):
			if req_type == "type":
				if filename.endswith(img_ext): return "img"
				elif filename.endswith(video_ext): return "video"
				elif filename.endswith(editor_ext): return "edit"
				elif not "." in filename: return "folder"
			elif req_type == "emoji":
				if filename.endswith(img_ext): return "🖼️"
				elif filename.endswith(video_ext): return "📼"
				elif filename.endswith(audio_ext): return "🎵"
				elif not "." in filename: return "📁"
				else: return "📄"
		def files_dict(path):
			def custom_key(s):
				match = re.match(r'([a-zA-Z]+)(\d*)', s)
				text_part = match.group(1).lower()
				num_part = int(match.group(2)) if match.group(2) else -1
				return (text_part, num_part, s)
			files = []
			for file in os.listdir(path):
				file_dict = {}
				file_dict["name"] = file
				file_dict["type"] = type_file(file, "type")
				file_dict["emoji"] = type_file(file, "emoji")
				files.append(file_dict)
			return sorted(files, key=lambda file: custom_key(file["name"]))
		# - Main code
		if user_name in data_users and password in data_users[user_name]["password"]:
			#path = data_users[user_name]["path"]
			return files_dict(path)



class MusicApi():
	def add_song(url: str):
		with open("music.json") as f:
			data_song = json.load(f)
		if url.startswith("https://youtu.be/"):
			url = url.replace("https://youtu.be/", "https://youtube.com/watch?v=")
		yt = pytubefix.YouTube(url, on_progress_callback = on_progress)
		file_name = f"{random.randint(1, 999999999)}.mp3"
		# - Check File
		if not str(yt.title) in data_song:
			if file_name in os.listdir(data_config["music_path"]):
				file_name = f"{random.randint(1, 999999999)}.mp3"
			yt.streams.first().download(filename=file_name, output_path=data_config["music_path"])
			# - Json Update
			data_song[str(yt.title)] = {"ico": yt.thumbnail_url, "path": os.path.join(data_config["music_path"], file_name)}
			with open("music.json", 'w') as f: 
				json.dump(data_song, f, indent=4)
			return {"name": str(yt.title), "ico": yt.thumbnail_url}, 200
		return "File already existing", 409 # 409 - Conflict
	def remove_song(name: str):
		with open("music.json") as f:
			data_song = json.load(f)
		if name in data_song:
			os.remove(data_song[name]["path"])
			del data_song[name]
			with open("music.json", 'w') as f: 
				json.dump(data_song, f, indent=4)
			return "Success", 200
		return "No file found", 404 # 404 - Not found
	def random_song():
		with open("music.json") as f:
			data_song = json.load(f)
		return random.choice(list(data_song.keys()))
