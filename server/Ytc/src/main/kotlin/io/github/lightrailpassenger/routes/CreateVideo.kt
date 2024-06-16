package io.github.lightrailpassenger.routes

import com.fasterxml.jackson.databind.ObjectMapper

import java.io.BufferedReader
import java.io.File
import java.io.IOException
import java.io.InputStream
import java.io.InputStreamReader
import java.lang.Double
import java.util.regex.Pattern

import kotlin.concurrent.thread
import kotlinx.coroutines.newSingleThreadContext
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withContext

import org.http4k.core.Request
import org.http4k.lens.LensFailure
import org.http4k.lens.Query
import org.http4k.sse.Sse
import org.http4k.sse.SseMessage
import org.http4k.sse.SseResponse

import io.github.lightrailpassenger.formats.errorResponseLens
import io.github.lightrailpassenger.formats.ErrorResponse
import io.github.lightrailpassenger.io.DownloadHelper
import io.github.lightrailpassenger.io.DownloadRecord
import io.github.lightrailpassenger.utils.ensureStorage

data class Progress (
    val current: Number,
    val total: Number,
)

fun parseProgress(line: String): Progress? {
    val pattern = Pattern.compile("\\[download\\].*\\(frag\\s([0-9]+)\\/([0-9]+)\\)")
    val matcher = pattern.matcher(line)
    matcher.lookingAt()

    try {
        val current = Integer.parseInt(matcher.group(1))
        val total = Integer.parseInt(matcher.group(2))

        return Progress(current, total)
    } catch (_: Exception) {
        val percentagePattern = Pattern.compile("\\[download\\]\\s*([0-9\\.]+)\\%\\sof")
        val percentageMatcher = percentagePattern.matcher(line)
        percentageMatcher.lookingAt()

        try {
            val percent = Double.parseDouble(percentageMatcher.group(1))

            return Progress(percent, 100)
        } catch (_: Exception) {
            return null
        }
    }
}

data class CreateVideoRequest(
    val url: String,
)

val payloadLens = Query.map(::CreateVideoRequest).required("url")

fun generateCreateVideoHandler(
    downloadHelper: DownloadHelper,
    downloadRecord: DownloadRecord
): (request: Request) -> SseResponse {
    return fun(request: Request): SseResponse {
        return SseResponse { sse: Sse ->
            var process: Process? = null
            val processContext = newSingleThreadContext("Download process")

            thread {
                try {
                    val query = payloadLens(request)
                    val storageDir = ensureStorage()
                    val idFromTime = System.currentTimeMillis().toString()
                    val currentDir = File(storageDir, idFromTime)
                    val hasCreated = currentDir.mkdir()

                    if (!hasCreated) {
                        throw IOException("Cannot create directory $idFromTime")
                    }

                    val url = query.url
                    val location = currentDir.getPath()
                    var inputStream: InputStream? = null

                    runBlocking {
                        withContext(processContext) {
                            process = downloadHelper.fetchUrl(url, location)

                            inputStream = process.getInputStream()
                        }
                    }

                    inputStream?.use { st ->
                        InputStreamReader(st).use { isr ->
                            BufferedReader(isr).use { r ->
                                var line: String? = null
                                var lastProgress: Progress? = null

                                while (true) {
                                    line = r.readLine()

                                    if (line != null) {
                                        println(line)
                                        val progress = parseProgress(line)

                                        if (progress != null && !progress.equals(lastProgress)) {
                                            lastProgress = progress

                                            val progressStr: String = ObjectMapper().writeValueAsString(progress)
                                            sse.send(SseMessage.Data(progressStr))
                                        }
                                    } else {
                                        break
                                    }
                                }
                            }
                        }
                    }

                    val files = currentDir.list()
                    val firstWebM = files.find { it.toLowerCase().endsWith(".webm") }
                    val name = if (firstWebM == null) "Untitled" else firstWebM.substring(0, firstWebM.length - 4)

                    downloadRecord.insert(url, idFromTime, name)
                } catch (ex: LensFailure) {
                    sse.send(SseMessage.Data(ObjectMapper().writeValueAsString(ErrorResponse("BAD_REQUEST"))))
                } catch (ex: Throwable) {
                    // TODO: Add logger
                    println(ex)
                    sse.send(SseMessage.Data(ObjectMapper().writeValueAsString(ErrorResponse("INTERNAL_SERVER_ERROR"))))
                } finally {
                    sse.close()
                }
            }
            sse.onClose {
                println("Closing connection")

                runBlocking {
                    withContext(processContext) {
                        process?.destroy()
                    }
                }
            }
        }
    }
}
