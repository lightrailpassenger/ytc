package io.github.lightrailpassenger.io

class DownloadHelper {
    fun fetchUrl(url: String, location: String): Process {
        val processBuilder = ProcessBuilder().command(
            "yt-dlp",
            "-f",
            "bestvideo+bestaudio",
            "--merge-output-format",
            "mp4",
            "-k",
            "-P",
            location,
            "--newline",
            url
        )
        val process = processBuilder.start()

        return process
    }
}
