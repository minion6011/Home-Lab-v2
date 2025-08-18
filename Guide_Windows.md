# 🪟 How to install
To use the HomeLab on Windows you need to follow these steps:

1. Install all files inside the `code/HomeLab` folder.
  
2. Install Python (I suggest `Python 3.11`)

3. Install all the requirements using the command:
   ```console
   pip install -r requirements.txt
   ```

4. Run the code with the command:
   ```console
   py main.py
   ```
   
5. Setup the `app_config.json` file in the `code` folder: 
   - disk_1_path (The path to the system disk)
   - disk_2_path (The path to the secondary disk [usually the SSD card for the cloud])
   - music_path (The path to the folder where the songs from the homelab music section will be downloaded)

6. Set the `user.json` file in the `code` folder following the example in the file

7. Change the password and if you want the custom page for the index page from the file `code/website/main.js`

8. Install Node.js from [here](https://nodejs.org/en/download)

<hr>

# 🔊 How to install Discord RPC 

1. Install Python (I suggest `Python 3.11`)

2. Install all the requirements using the command:
   ```console
   pip install -r requirements.txt
   ```

3. Open [Discord Developer Portal](https://discord.com/developers/applications) and create an App for the Homelab

4. In the `Rich Presence` section add the `logo.jpeg`

5. Run the main.py in background

<hr>

[Go back](README.md)
