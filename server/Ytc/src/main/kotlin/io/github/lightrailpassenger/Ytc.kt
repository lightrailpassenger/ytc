package io.github.lightrailpassenger

import io.github.lightrailpassenger.io.DownloadHelper
import io.github.lightrailpassenger.io.DownloadRecord
import io.github.lightrailpassenger.routes.generateCreateVideoHandler
import io.github.lightrailpassenger.routes.generateInitHandler
import io.github.lightrailpassenger.routes.generateListVideosHandler
import io.github.lightrailpassenger.utils.ensureDbDir

import java.io.File

import org.http4k.core.Method.GET
import org.http4k.core.Method.POST
import org.http4k.core.Response
import org.http4k.core.Status.Companion.OK
import org.http4k.routing.bind as bind
import org.http4k.routing.routes
import org.http4k.routing.sse
import org.http4k.routing.sse.bind as sseBind
import org.http4k.server.PolyHandler
import org.http4k.server.Undertow
import org.http4k.server.asServer

val dbPath = ensureDbDir()
val sqliteFile = File(dbPath, "data.db")

val downloadHelper = DownloadHelper()
val downloadRecord = DownloadRecord(sqliteFile.getPath())
val createVideo = generateCreateVideoHandler(downloadHelper, downloadRecord)
val init = generateInitHandler(downloadRecord)
val listVideos = generateListVideosHandler(downloadRecord)

val http = routes(
    "/init" bind POST to init,
    "/ping" bind GET to {
        Response(OK).body("pong")
    },
    "/downloaded-videos" bind GET to listVideos
)

val sse = sse(
    "/videos" sseBind { request ->
        createVideo(request)
    }
)

fun main() {
    val server = PolyHandler(http, sse = sse).asServer(Undertow(9000)).start()

    println("Server started on " + server.port())
}
