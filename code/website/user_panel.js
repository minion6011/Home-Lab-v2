function post_emulate(path, params, method='post') {
  const form = document.createElement('form');
  form.method = method;
  form.action = path;

  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      const hiddenField = document.createElement('input');
      hiddenField.type = 'hidden';
      hiddenField.name = key;
      hiddenField.value = params[key];

      form.appendChild(hiddenField);
    }
  }

  document.body.appendChild(form);
  form.submit();
}



const imgExt = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp', '.ico'];
const videoExt = ['.webm', '.mkv', '.vob', '.ogv', '.gifv', '.mng', '.mov', '.avi', '.amv', '.mp4', '.m4p', '.m4v', '.mpg', '.mp2', '.mpeg', '.mpe', '.mpv', '.svi'];
const audioExt = ['.mp3', '.flac', '.aac', '.ogg', '.wav'];
const editorExt = ['.txt', '.py', '.js', '.bat', '.json', '.css', '.xml'];
function checkFile(filename) {
  const lower = filename.toLowerCase();
  if (imgExt.some(ext => lower.endsWith(ext))) return "image";
  else if (videoExt.some(ext => lower.endsWith(ext))) return "video";
  else if (audioExt.some(ext => lower.endsWith(ext))) return "audio";
  else if (editorExt.some(ext => lower.endsWith(ext))) return "edit";
  else if (lower.includes(".")) return "unclass";
  else return "folder";
}
function emojiFile(filetype) {
  if (filetype == "image") {return "🖼️"}
  else if (filetype == "video") {return "📼"}
  else if (filetype == "audio") {return "🎵"}
  else if (filetype == "folder") {return "📁"}
  else if (filetype == "unclass" || filetype == "edit") {return "📄"}
}
function create_line(name) {
  // Start Code
  let mainContainer = document.getElementById("file-container")

  let type = checkFile(name)
  let emoji = emojiFile(type)
  
  let divline = document.createElement("div");
  mainContainer.appendChild(divline);
  divline.className = "cloud-file_line"

  let nameParagraph = document.createElement("p");
  divline.appendChild(nameParagraph);
  nameParagraph.style.margin = "0 0 0 0.75%";
  nameParagraph.style.fontSize = "calc(var(--normal_fontsize) + 0.25rem)";
  nameParagraph.style.maxWidth = "60%"
  nameParagraph.textContent = `${emoji} ${name}`;

  let optionsMenu = document.createElement("div");
  divline.appendChild(optionsMenu);
  optionsMenu.className = "cloud-bar_options-menu";

  let optionsMenu_Html = `
  <div onclick="delete_file(this)" class="cloud-bar-ico_button" style="background-color: #ff1e34;"> <img src="website/img/bin.png" class="cloud-bar-ico_button-img"> </div>
  <div onclick="rename_file(this)" class="cloud-bar-ico_button" style="background-color: #8ac926;"> <img src="website/img/rename.png" class="cloud-bar-ico_button-img"> </div>
  `
  if (type == "folder") {optionsMenu_Html = optionsMenu_Html + `<div onclick="open_folder(this)" class="cloud-bar-ico_button" style="background-color: #4cc9f0;"> <img src="website/img/darrow.png" class="cloud-bar-ico_button-img"> </div>`}
  else {optionsMenu_Html = optionsMenu_Html + `<div onclick="download_file(this)" class="cloud-bar-ico_button" style="background-color: #0496ff;"> <img src="website/img/download.png" class="cloud-bar-ico_button-img"> </div>`}

  if (type == "edit") {optionsMenu_Html = optionsMenu_Html + `<div onclick="show_file(this, 'edit')" class="cloud-bar-ico_button" style="background-color: #ecb520;"> <img src="website/img/edit.png" class="cloud-bar-ico_button-img"> </div>`}
  
  if (type == "image") {optionsMenu_Html = optionsMenu_Html + `<div onclick="show_file(this, 'img')" class="cloud-bar-ico_button" style="background-color: #72ddf7;"> <img src="website/img/eye.png" class="cloud-bar-ico_button-img"> </div>`}
  else if (type == "video") {optionsMenu_Html = optionsMenu_Html + `<div onclick="show_file(this, 'video')" class="cloud-bar-ico_button" style="background-color: #72ddf7;"> <img src="website/img/eye.png" class="cloud-bar-ico_button-img"> </div>`}
  optionsMenu.innerHTML = optionsMenu_Html
}



// Main JS

let username = document.getElementById("global_username").value;
let password = document.getElementById("global_password").value;
let path = document.getElementById("global_current-path").value;
let back_path = document.getElementById("global_back-path").value;

let home_path = document.getElementById("global_home-path").value;


function line_value(element) {
  let container = element.closest('.cloud-file_line');
  let text = container.querySelector('p').innerHTML;
  return text.replace(/^[^\p{L}\p{N}]+/u, "")
}


// Line function

// Show file Button
let show_popup = document.getElementById("show-popup");

let show_img = document.getElementById("show-img");
let show_video = document.getElementById("show-vid");
let show_text = document.getElementById("show-text");

async function show_file(element, type_file) {
  let name = line_value(element)

  if (path.includes("\\")) { path_return = `${path}\\${name}` }
  else { path_return = `${path}/${name}` }

  let req = await fetch(`/cloud_api`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({type: 'show_file', username: username, password: password, path: path_return}),
  });
  if (req.status == 200) {
    let blob = await req.blob();
    let blobUrl = URL.createObjectURL(blob);
    show_popup.style.display = "flex"
    if (type_file == "img") {
      show_img.style.display = "inline"
      show_img.src = blobUrl
    }
    else if (type_file == "edit") {
      show_text.style.display = "inline"
      show_text.innerHTML = await blob.text();
    }
    else {
      show_video.style.display = "inline"
      show_video.src = blobUrl
    }
  }
}
function close_show_loading() {
  show_popup.style.display = "none"
  show_img.style.display = "none"
  show_video.style.display = "none"
  show_text.style.display = "none"
  show_img.src = ""
  show_video.src = ""
  show_text.innerHTML = ""
}


// Download Button
function download_file(element) {
  let name = line_value(element)
  post_emulate("/cloud_api", {"type": "file_download", "username": username, "password": password,"path": path, "filename": name})
}


// Delete Button
async function delete_file(element) {
  let name = line_value(element)
  let path_return
  element.closest('.cloud-file_line').remove();

  if (path.includes("\\")) { path_return = `${path}\\${name}` }
  else { path_return = `${path}/${name}` }

  await fetch(`/cloud_api`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({type: 'delete', username: username, password: password, path: path_return}),
  });
}

// Open Folder Button
function open_folder(element) {
  let name = line_value(element)
  let path_return
  if (path.includes("\\")) { path_return = `${path}\\${name}` }
  else { path_return = `${path}/${name}` }
  post_emulate("/cloud", {"username": username, "password": password,"path": path_return, "back_path": path})
}

// Rename Button
const rename_popup = document.getElementById("rename-popup");
const rename_filetext = document.getElementById("filename_rename");
const rename_placeholder = document.getElementById("placeholder_rename");

function rename_file(element) {
  let name = line_value(element)
  rename_popup.style.display = "flex"
  rename_filetext.innerHTML = name
  rename_placeholder.placeholder = name
  rename_placeholder.value = name
}
function close_popup_rename() {rename_popup.style.display = "none"}
async function rename_file_api(element) {
  let req = await fetch(`/cloud_api`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({type: 'rename_file', username: username, password: password, path: path, old_name: element.placeholder, new_name: element.value}),
  });
  if (req.status == 200) {
    (Array.from(document.querySelectorAll("p")).find(p => p.textContent.includes(element.placeholder))).innerHTML = `${emojiFile(checkFile(element.value))} ${element.value}`;
    rename_popup.style.display = "none"
  }
}


// Main Bar

// Home Path
function home_page() {
  post_emulate("/cloud", {"username": username, "password": password,"path": home_path, "back_path": path})
}

// Back Path
function back_page() {
  let back_path_page = back_path.substring(0, back_path.lastIndexOf("\\"))
  if (home_path.substring(0, home_path.lastIndexOf("\\")) == back_path_page) {back_path_page = home_path}
  post_emulate("/cloud", {"username": username, "password": password,"path": back_path, "back_path": back_path_page})
}

// Create Folder
async function create_folder() {
  let req = await fetch(`/cloud_api`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({type: 'create_folder', username: username, password: password, path: path}),
  });
  var req_json = JSON.parse(await req.text());
  create_line(req_json.name)
}


// Upload Button
const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton');
const statusText = document.getElementById('statusText');
const uploadPopup = document.getElementById('loading-popup');


function close_popup_loading() {uploadPopup.style.display = "none"}
uploadButton.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', () => {
  const files = fileInput.files;
  if (!files.length) return;

  const formData = new FormData();
  formData.append('type', "file_upload");
  formData.append('username', username);
  formData.append('password', password);
  formData.append('path', path);

  // Aggiungi tutti i file
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }

  uploadPopup.style.display = "flex";

  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/cloud_api', true);

  xhr.upload.onprogress = (event) => {
    if (event.lengthComputable) {
      const percent = Math.round((event.loaded / event.total) * 100);
      statusText.textContent = `${percent}%`;
    }
  };

  xhr.onload = () => {
    if (xhr.status === 200) {
      statusText.textContent = 'Caricamento completato!';
      for (let i = 0; i < files.length; i++) {
        create_line(files[i].name);
      }
    } else {
      statusText.textContent = 'Errore durante l\'upload.';
    }
  };

  xhr.onerror = () => {
    statusText.textContent = 'Errore di rete.';
  };

  xhr.send(formData);
  statusText.textContent = 'Caricamento in corso...';
});
