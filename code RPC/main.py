import winsdk.windows.media.control as wmc
import asyncio
from pypresence import Presence, ActivityType
import time

# Config
client_id = '1406966722761850890'
low_timeout = 1
long_timeout = 14 # long_timeout + low_timeout must equal 15 or more seconds

# Code
async def get_media_info():
    sessions = await wmc.GlobalSystemMediaTransportControlsSessionManager.request_async()
    current_session = sessions.get_current_session()
    if current_session:
        timeline = current_session.get_timeline_properties()
        info = await current_session.try_get_media_properties_async()
        return {
            "start_time": timeline.start_time.seconds,
            "position": timeline.position.seconds,
            "end_time": timeline.end_time.seconds,
            "title": info.title,
            "artist": info.artist,
            "paused": current_session.get_playback_info().controls.is_pause_enabled,
        }
        

def DiscordRPC():
    started = False
    while True:
        try:
            RPC = Presence(client_id)
            RPC.connect()
            while RPC != None:
                data = asyncio.run(get_media_info())
                if data == None or not data["paused"] or not data["artist"] == "Music Player By Coso.Man":
                    if RPC != None: RPC.clear()
                    started = False
                else:
                    RPC.update(
                        activity_type = ActivityType.LISTENING,
                        details=data["title"],
                        state= f"{data['artist']}",
                        start=time.time() - data["position"],
                        large_image="logo",
                        end=(data["end_time"] - data["position"]) + time.time(),
                    )
                    if started == True: time.sleep(long_timeout)
                    else: started = True
                time.sleep(low_timeout)
        except Exception as e:
            if started == True: started = False
            pass
        time.sleep(long_timeout)

DiscordRPC()
