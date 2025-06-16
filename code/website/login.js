const imgExt = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.webp', '.ico'];
const videoExt = ['.webm', '.mkv', '.vob', '.ogv', '.gifv', '.mng', '.mov', '.avi', '.amv', '.mp4', '.m4p', '.m4v', '.mpg', '.mp2', '.mpeg', '.mpe', '.mpv', '.svi'];
const audioExt = ['.mp3', '.flac', '.aac', '.ogg', '.wav'];
const editorExt = ['.txt', '.py', '.js', '.bat', '.json', '.css', '.xml'];

/* Global Functions */

function checkFile(filename) {
    const lower = filename.toLowerCase();
    if (imgExt.some(ext => lower.endsWith(ext))) return "image";
    else if (videoExt.some(ext => lower.endsWith(ext))) return "video";
    else if (audioExt.some(ext => lower.endsWith(ext))) return "audio";
    else if (editorExt.some(ext => lower.endsWith(ext))) return "edit";
    else if (lower.includes(".")) return "folder";
    else return "unclass";
}