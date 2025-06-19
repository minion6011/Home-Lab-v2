# 🍓 How to install
To use the HomeLab on Raspbian you need to follow these steps:

1. Install all files inside the `code` folder.
  
2. Create a [virtual environment in Python](http://rptl.io/venv) in the folder where you placed the files.

3. Then install all the requirements using the command:
   ```console
   pip install -r requirements.txt
   ```

4. Run the code with the command:
   ```console
   python3 main.py
   ```

5. Setup the `app_config.json` file in the `code` folder: 
   - disk_1_path (The path to the system disk)
   - disk_2_path (The path to the secondary disk [usually the SSD card for the cloud])
   - music_path (The path to the folder where the songs from the homelab music section will be downloaded)

6. Set the `user.json` file in the `code` folder following the example in the file
   
7. Change the password and if you want the custom page for the index page from the file `code/website/main.js`
    
8. Install Node.js from [here](https://github.com/meech-ward/NodeJs-Raspberry-Pi)
<hr>

[Go back](README.md)
