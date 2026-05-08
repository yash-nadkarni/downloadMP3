const express = require("express");
const cors = require("cors");
const validator = require("validator");
const rateLimit = require("express-rate-limit");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20
});

app.use(limiter);

const PORT = 3000;

const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
//const BASE_URL = `http://localhost:${PORT}`;

const DOWNLOADS_DIR = path.join(__dirname, "downloads");

if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR);
}

app.post("/convert", (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({
            error: "No URL provided"
        });
    }

    if (!validator.isURL(url)) {
        return res.status(400).json({
            error: "Invalid URL"
        });
    }

    if (
        !url.includes("youtube.com") &&
        !url.includes("youtu.be")
    ) {
        return res.status(400).json({
            error: "Only YouTube URLs allowed"
        });
    }

    const infoCommand = `yt-dlp -j "${url}"`;

    exec(infoCommand, (err, stdout, stderr) => {
        if (err) {
            console.error("YT-DLP ERROR:", err);
            console.error("STDERR:", stderr);
            return res.status(500).json({ error: "Failed to fetch video info" });
        }

        let data;
        try {
            data = JSON.parse(stdout);
        } catch {
            return res.status(500).json({ error: "Invalid metadata response" });
        }

        console.log(data)

        //filename cleaning
        const cleanTitle = data.title
            .replace(/[<>:"/\\|?*]+/g, "") //remove illegal chars
            .trim();

        const outputPath = path.join(DOWNLOADS_DIR, cleanTitle);

        // STEP 3: Download audio using title as filename
        //const command = `yt-dlp -x --audio-format mp3 -o "${outputPath}" "${url}"`;
        const command =
            `yt-dlp ` +
            `--js-runtimes node ` +
            `--ffmpeg-location "C:\\ffmpeg\\bin" ` +
            `-x --audio-format mp3 ` +
            `-o "${outputPath}.%(ext)s" ` +
            `"${url}"`;

        console.log("Running:", command);

        exec(command, (error) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ error: "Conversion failed" });
            }

            res.json({
                success: true,
                title: cleanTitle,
                download: `${BASE_URL}/download/${cleanTitle}.mp3`
            });
        });
    });


});


app.post("/info", (req, res) => {
    console.log("INFO")
    const { url } = req.body;
    console.log(url)

    const command = `yt-dlp -j "${url}"`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error("YT-DLP ERROR:", error);
            console.error("STDERR:", stderr);
            return res.status(500).json({
                error: "Failed to fetch info"
            });
        }

        try {
            const data = JSON.parse(stdout);

            res.json({
                title: data.title,
                duration: data.duration,
                thumbnail: data.thumbnail,
                uploader: data.uploader
            });
        }
        catch {
            res.status(500).json({
                error: "Invalid metadata"
            });
        }
    });
});

app.get("/download/:file", (req, res) => {
    const filePath = path.join(DOWNLOADS_DIR, req.params.file);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({
            error: "File not found"
        });
    }

    //Removes the file after its been downloaded
    res.download(filePath, () => {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(err);
            }
        });
    });
});


//To prevent downloads from filling up indefinitely
setInterval(() => {
    const files = fs.readdirSync(DOWNLOADS_DIR);

    files.forEach(file => {
        const filePath = path.join(DOWNLOADS_DIR, file);

        const stats = fs.statSync(filePath);

        const age = Date.now() - stats.mtimeMs;

        // Delete after 1 hour
        if (age > 3600000) {
            fs.unlinkSync(filePath);
            console.log("Deleted:", file);
        }
    });
}, 600000);


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});