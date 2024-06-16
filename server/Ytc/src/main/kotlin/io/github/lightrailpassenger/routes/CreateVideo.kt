package io.github.lightrailpassenger.routes

import com.fasterxml.jackson.databind.ObjectMapper

import java.io.BufferedReader
import java.io.File
import java.io.IOException
import java.io.InputStreamReader
import java.util.regex.Pattern
import org.http4k.core.Request
import org.http4k.lens.LensFailure
import org.http4k.lens.Query
import org.http4k.sse.Sse
import org.http4k.sse.SseMessage
import org.http4k.sse.SseResponse

import io.github.lightrailpassenger.formats.errorResponseLens
import io.github.lightrailpassenger.formats.ErrorResponse
import io.github.lightrailpassenger.io.DownloadHelper
import io.github.lightrailpassenger.utils.ensureStorage

data class Progress (
    val current: Int,
    val total: Int,
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
        // TODO: Can we parse percentage?
        return null
    }
}

data class CreateVideoRequest(
    val url: String,
)

val payloadLens = Query.map(::CreateVideoRequest).required("url")

fun generateCreateVideoHandler(
    downloadHelper: DownloadHelper
): (request: Request) -> SseResponse {
    return fun(request: Request): SseResponse {
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
            val process = downloadHelper.fetchUrl(url, location)

            return SseResponse { sse: Sse ->
                // FIXME: Does sse.onClose work?
                process.getInputStream().use { st ->
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
                                    sse.close()
                                    break
                                }
                            }
                        }
                    }
                }
            }
        } catch (ex: LensFailure) {
            return SseResponse { sse ->
                sse.send(SseMessage.Data(ObjectMapper().writeValueAsString(ErrorResponse("BAD_REQUEST"))))
                sse.close()
            }
        } catch (ex: Throwable) {
            // TODO: Add logger
            System.err.println(ex)

            return SseResponse { sse ->
                sse.send(SseMessage.Data(ObjectMapper().writeValueAsString(ErrorResponse("INTERNAL_SERVER_ERROR"))))
                sse.close()
            }
        }
    }
}
